import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { aws_dynamodb as dynamodb } from 'aws-cdk-lib';
import { EnvConfig } from './env';

export interface JournalingDBStackProps extends cdk.StackProps {
  envConfig: EnvConfig;
}

export interface TableCollection {
  JournalEntries: dynamodb.Table;
}

export class JournalingDBStack extends cdk.Stack {
  tables: TableCollection;

  constructor(scope: Construct, id: string, props: JournalingDBStackProps) {
    super(scope, id, props);

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

    new cdk.CfnOutput(this, 'tableNames', {
      value: JSON.stringify(props.envConfig.dynamoTableNames),
    });
  }
}
