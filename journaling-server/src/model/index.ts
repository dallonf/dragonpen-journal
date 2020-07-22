import { Client } from '@elastic/elasticsearch';
import { makeClient } from './elastic-client';
import journalEntry from './journal-entry';

export interface TestCounterState {
  counter: number;
}

export type Model = ReturnType<typeof makeModel>;

const makeModel = (client?: Client) => {
  client = client ?? makeClient();

  return {
    journalEntry: journalEntry(client),
    testCounter: { counter: 0 },
  };
};

export default makeModel;