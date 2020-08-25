import * as path from 'path';
import * as cdk from '@aws-cdk/core';
import * as lambdaNode from '@aws-cdk/aws-lambda-nodejs';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2';
import * as route53 from '@aws-cdk/aws-route53';
import * as acm from '@aws-cdk/aws-certificatemanager';
import { EnvConfig } from './env';
import { JournalingDBStack } from './journaling-db-stack';

interface JournalingLambdaProps {
  envConfig: EnvConfig;
  dbStack: JournalingDBStack;
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

    const apiDomain = props.envConfig.apiDomain;

    const serverDir = path.join(__dirname, '../../journaling-server');
    const handlersDir = path.join(serverDir, 'src/handlers');

    const environment = {
      AUTH0_IDENTIFIER: props.envConfig.auth0ApiId,
      AUTH0_DOMAIN: props.envConfig.auth0Domain,
      DYNAMO_TABLE_NAMES: JSON.stringify(props.envConfig.dynamoTableNames),
    };

    const graphql = new lambdaNode.NodejsFunction(this, 'gqlFn', {
      entry: path.join(handlersDir, 'gql.ts'),
      environment,
    });

    props.dbStack.tables.JournalEntries.grantReadWriteData(graphql);

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
  }
}
