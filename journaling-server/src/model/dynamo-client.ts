import DynamoDB from 'aws-sdk/clients/dynamodb';
import * as env from '../env.json';

export type DynamoDBClient = ReturnType<typeof makeClient>;

process.env.AWS_SDK_LOAD_CONFIG = '1';

export const makeClient = () => {
  const api = new DynamoDB();
  const tableNamesFromEnv = env.dynamoTableNames;
  const tableNames = {
    JournalEntries: tableNamesFromEnv.JournalEntries,
  };

  return {
    api,
    tableNames,
  };
};
