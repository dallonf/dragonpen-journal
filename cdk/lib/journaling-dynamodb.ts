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

    const journalEntriesTable = new dynamodb.Table(this, 'JournalEntries', {
      tableName: props.envConfig.dynamoTableNames.JournalEntries,
      partitionKey: { name: 'UserId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'Id', type: dynamodb.AttributeType.STRING },
      removalPolicy: props.envConfig.ephemeralData
        ? cdk.RemovalPolicy.DESTROY
        : cdk.RemovalPolicy.RETAIN,
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
