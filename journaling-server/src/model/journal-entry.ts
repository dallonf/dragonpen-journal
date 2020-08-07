import { Client, RequestParams } from '@elastic/elasticsearch';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import { User } from './user';
import { sanitizeIndexName } from './util';
import { DynamoDBClient } from './dynamo-client';

export type JournalEntryBody = Source;

export interface JournalEntry {
  id: string;
  timestamp: Date;
  text: string;
}

interface Source {
  timestamp: Date;
  text: string;
}

type Overwrite<TOriginal, TNew> = Omit<TOriginal, keyof TNew> & TNew;
type ApiSource = Overwrite<
  Source,
  {
    timestamp: string;
  }
>;

type SaveRequestBody = Source;

type GetResponse = {
  _index: string;
  _id: string;
} & (
  | {
      found: true;
      _source: ApiSource;
    }
  | { found: false }
);

interface SearchResponse {
  hits: {
    total: {
      value: number;
    };
    hits: {
      _index: string;
      _id: string;
      _source: ApiSource;
    }[];
  };
}

interface DynamoJournalEntry {
  UserId: { S: string };
  Id: { S: string };
  Timestamp: { N: string };
  Text: { S: string };
}
type JournalEntryKey = Pick<DynamoJournalEntry, 'UserId' | 'Id'>;

export default (client: Client, dynamo: DynamoDBClient, user: User) => {
  const index = `user_${sanitizeIndexName(user.id)}_journal_entry`;

  const readList = async (): Promise<JournalEntry[]> => {
    let result;
    try {
      result = await client.search<SearchResponse, RequestParams.Search>({
        index,
        size: 100,
        sort: 'timestamp:desc',
      });
    } catch (err) {
      if (err.meta && err.meta.statusCode === 404) {
        return [];
      } else {
        throw err;
      }
    }

    return result.body.hits.hits.map((x) => ({
      id: x._id,
      timestamp: new Date(x._source.timestamp),
      text: x._source.text,
    }));
  };

  const read = async (id: string): Promise<JournalEntry | null> => {
    const key: JournalEntryKey = {
      Id: { S: id },
      UserId: { S: user.id },
    };
    const result = await dynamo.api
      .getItem({
        TableName: dynamo.tableNames.JournalEntries,
        Key: key,
        ConsistentRead: true,
      })
      .promise();

    const item = (result.Item as unknown) as DynamoJournalEntry | null;
    if (item) {
      return {
        id: item.Id.S,
        timestamp: new Date(parseInt(item.Timestamp.N, 10)),
        text: item.Text.S,
      };
    } else {
      return null;
    }
  };

  const save = async (input: JournalEntry): Promise<JournalEntry> => {
    const item: DynamoJournalEntry = {
      UserId: { S: user.id },
      Id: { S: input.id },
      Timestamp: { N: input.timestamp.getTime().toString() },
      Text: { S: input.text },
    };

    // TODO: check for conflicts
    await dynamo.api
      .putItem({
        TableName: dynamo.tableNames.JournalEntries,
        Item: (item as unknown) as DynamoDB.AttributeMap,
      })
      .promise();

    return input;
  };

  return { readList, read, save };
};
