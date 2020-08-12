import * as path from 'path';
import * as cdk from '@aws-cdk/core';
import * as lambdaNode from '@aws-cdk/aws-lambda-nodejs';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2';
import * as route53 from '@aws-cdk/aws-route53';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { EnvConfig, getDomainName } from './env';
import { JournalingDynamoDB } from './journaling-dynamodb';

interface JournalingLambdaProps {
  envConfig: EnvConfig;
  dynamo: JournalingDynamoDB;
  hostedZone: route53.IHostedZone;
  acmCert: acm.ICertificate;
}

class ApiGatewayV2Target implements route53.IAliasRecordTarget {
  constructor(private readonly api: apiGateway.DomainName) {}

  bind(record: route53.IRecordSet): route53.AliasRecordTargetConfig {
    return {
      dnsName: this.api.regionalDomainName,
      hostedZoneId: this.api.regionalHostedZoneId,
    };
  }
}

export class JournalingLambda extends cdk.Construct {
  gqlUrl: string;

  constructor(scope: cdk.Construct, id: string, props: JournalingLambdaProps) {
    super(scope, id);

    const apiDomain = getDomainName(props.envConfig, 'api');

    const serverDir = path.join(__dirname, '../../journaling-server');
    const handlersDir = path.join(serverDir, 'src/handlers');

    const tableNames = Object.fromEntries(
      Object.entries(props.dynamo.tables).map(([k, v]) => {
        const table = v as dynamodb.Table;
        return [k, table.tableName];
      })
    );

    const environment = {
      AUTH0_IDENTIFIER: props.envConfig.AUTH0_API_IDENTIFIER,
      AUTH0_DOMAIN: props.envConfig.AUTH0_DOMAIN,
      ELASTIC_NODE: 'http://nope',
      DYNAMO_TABLE_NAMES: JSON.stringify(tableNames),
    };

    const graphql = new lambdaNode.NodejsFunction(this, 'gqlFn', {
      entry: path.join(handlersDir, 'gql.ts'),
      environment,
    });

    props.dynamo.tables.JournalEntries.grantReadWriteData(graphql);

    const domain = new apiGateway.DomainName(this, 'domain', {
      domainName: apiDomain,
      certificate: props.acmCert,
    });

    const api = new apiGateway.HttpApi(this, 'gqlApi', {
      defaultDomainMapping: { domainName: domain },
      corsPreflight: {
        allowHeaders: ['Authorization', 'Content-Type'],
        allowMethods: [
          apiGateway.HttpMethod.GET,
          apiGateway.HttpMethod.POST,
          apiGateway.HttpMethod.HEAD,
          apiGateway.HttpMethod.OPTIONS,
        ],
        allowOrigins: ['*'],
        maxAge: cdk.Duration.days(10),
      },
    });

    api.addRoutes({
      path: '/graphql',
      methods: [apiGateway.HttpMethod.POST],
      integration: new apiGateway.LambdaProxyIntegration({
        handler: graphql,
      }),
    });

    new route53.ARecord(this, 'apiRecord', {
      zone: props.hostedZone,
      recordName: apiDomain,
      target: route53.RecordTarget.fromAlias(new ApiGatewayV2Target(domain)),
    });

    this.gqlUrl = `https://${apiDomain}/graphql`;

    new cdk.CfnOutput(this, 'gqlUrl', {
      value: this.gqlUrl,
    });
  }
}
