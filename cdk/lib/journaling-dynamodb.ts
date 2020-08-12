import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { EnvConfig } from './env';

export interface JournalingDynamoDBProps {
  envConfig: EnvConfig;
}

export interface TableCollection {
  JournalEntries: dynamodb.Table;
}

export class JournalingDynamoDB extends cdk.Construct {
  tables: TableCollection;

  constructor(
    scope: cdk.Construct,
    id: string,
    props: JournalingDynamoDBProps
  ) {
    super(scope, id);

    const journalEntriesName = props.envConfig.DYNAMO_PREFIX
      ? `${props.envConfig.DYNAMO_PREFIX}_JournalEntries`
      : undefined;

    const journalEntriesTable = new dynamodb.Table(this, 'JournalEntries', {
      tableName: journalEntriesName,
      partitionKey: { name: 'UserId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'Id', type: dynamodb.AttributeType.STRING },
    });
    journalEntriesTable.addLocalSecondaryIndex({
      indexName: 'TimestampIndex',
      sortKey: { name: 'Timestamp', type: dynamodb.AttributeType.NUMBER },
    });

    this.tables = {
      JournalEntries: journalEntriesTable,
    };
  }
}
