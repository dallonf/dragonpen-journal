import { Client } from '@elastic/elasticsearch';
import { makeClient } from './elastic-client';
import journalEntry, { JournalEntry } from './journal-entry';
import { User } from './user';

export { User };

export interface TestCounterState {
  counter: number;
}

export type Model = ReturnType<typeof makeModel>;

const makeModel = (user: User, client?: Client) => {
  client = client ?? makeClient();

  return {
    journalEntry: journalEntry(client, user),
    testCounter: { counter: 0 },
  };
};

export default makeModel;
export { JournalEntry };
