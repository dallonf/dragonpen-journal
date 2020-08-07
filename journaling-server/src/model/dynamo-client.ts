import DynamoDB from 'aws-sdk/clients/dynamodb';

export type DynamoDBClient = ReturnType<typeof makeClient>;

export const makeClient = () => {
  const api = new DynamoDB();
  const tableNamesFromEnv = JSON.parse(process.env.DYNAMO_TABLE_NAMES);
  const tableNames = {
    JournalEntries: tableNamesFromEnv.JournalEntries,
  };

  return {
    api,
    tableNames,
  };
};
