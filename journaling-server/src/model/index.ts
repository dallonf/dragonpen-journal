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
  user: User,
  { esClient, dynamoClient } = {} as {
    esClient?: Client;
    dynamoClient?: DynamoDBClient;
  }
) => {
  esClient = esClient ?? makeClient();
  dynamoClient = dynamoClient ?? makeDynamoClient();

  return {
    journalEntry: journalEntry(esClient, dynamoClient, user),
  };
};

export default makeModel;
export { JournalEntry };
