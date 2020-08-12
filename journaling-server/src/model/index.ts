import { Client } from '@elastic/elasticsearch';
import { makeClient } from './elastic-client';
import {
  DynamoDBClient,
  makeClient as makeDynamoClient,
} from './dynamo-client';
import journalEntry, { JournalEntry } from './journal-entry';
import { User } from './user';

export { User };

export type Model = ReturnType<typeof makeModel>;

const makeModel = (
  user: User | null,
  { esClient, dynamoClient } = {} as {
    esClient?: Client;
    dynamoClient?: DynamoDBClient;
  }
) => {
  esClient = esClient ?? makeClient();
  dynamoClient = dynamoClient ?? makeDynamoClient();

  if (user) {
    return {
      authenticated: true,
      user,
      journalEntry: journalEntry(esClient, dynamoClient, user),
    } as const;
  } else {
    return { authenticated: false } as const;
  }
};

export default makeModel;
export { JournalEntry };
