import DynamoDB from 'aws-sdk/clients/dynamodb';
import { User } from './user';
import { DynamoDBClient } from './dynamo-client';

export interface JournalEntry {
  id: string;
  timestamp: Date;
  text: string;
}

interface DynamoJournalEntry {
  UserId: { S: string };
  Id: { S: string };
  Timestamp: { N: string };
  Text: { S: string };
}
type JournalEntryKey = Pick<DynamoJournalEntry, 'UserId' | 'Id'>;

function convertFromDynamo(
  item: DynamoJournalEntry | DynamoDB.AttributeMap
): JournalEntry {
  item = item as DynamoJournalEntry;
  return {
    id: item.Id.S,
    timestamp: new Date(parseInt(item.Timestamp.N, 10)),
    text: item.Text.S,
  };
}

export default (dynamo: DynamoDBClient, user: User) => {
  const readList = async (): Promise<JournalEntry[]> => {
    const result = await dynamo.api
      .query({
        TableName: dynamo.tableNames.JournalEntries,
        IndexName: 'TimestampIndex',
        KeyConditionExpression: 'UserId = :userId',
        ExpressionAttributeValues: {
          userId: { S: user.id },
        },
        ScanIndexForward: false,
      })
      .promise();

    return result.Items?.map(convertFromDynamo) ?? [];
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
      return convertFromDynamo(item);
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
