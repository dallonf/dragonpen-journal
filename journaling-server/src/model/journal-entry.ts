import { Client } from '@elastic/elasticsearch';

const INDEX = 'journal-entry';

export type JournalEntryBody = Source;

export interface JournalEntry {
  id: string;
  date: Date;
  text: string;
}

interface Source {
  date: Date;
  text: string;
}

type Overwrite<TOriginal, TNew> = Omit<TOriginal, keyof TNew> & TNew;
type ApiSource = Overwrite<
  Source,
  {
    date: string;
  }
>;

type GetResponse =
  | ({
      _index: string;
      _id: string;
    } & {
      found: true;
      _source: ApiSource;
    })
  | { found: false };

export default (client: Client) => {
  const read = async (id: string): Promise<JournalEntry | null> => {
    const result = await client.get<GetResponse>({
      index: INDEX,
      id,
    });

    if (result.body.found) {
      return {
        id: result.body._id,
        date: new Date(result.body._source.date),
        text: result.body._source.text,
      };
    } else {
      return null;
    }
  };

  const create = async (input: JournalEntryBody): Promise<JournalEntry> => {
    const result = await client.index<{
      _id: string;
    }>({
      index: INDEX,
      body: input,
    });

    const readResult = await read(result.body._id);
    return readResult!;
  };

  return { read, create };
};
