import { Client, RequestParams } from '@elastic/elasticsearch';
import { User } from './user';
import { sanitizeIndexName } from './util';

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

export default (client: Client, user: User) => {
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
    let result;
    try {
      result = await client.get<GetResponse>({
        index,
        id,
      });
    } catch (err) {
      if (err.meta && err.meta.statusCode === 404) {
        return null;
      } else {
        throw err;
      }
    }

    if (result.body.found) {
      return {
        id: result.body._id,
        timestamp: new Date(result.body._source.timestamp),
        text: result.body._source.text,
      };
    } else {
      return null;
    }
  };

  const save = async (input: JournalEntry): Promise<JournalEntry> => {
    const result = await client.index<{ _id: string }, SaveRequestBody>({
      id: input.id,
      index,
      body: {
        timestamp: input.timestamp,
        text: input.text,
      },
    });

    const readResult = await read(result.body._id);
    return readResult!;
  };

  return { readList, read, save };
};
