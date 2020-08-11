import * as path from 'path';
import * as cdk from '@aws-cdk/core';
import * as lambdaNode from '@aws-cdk/aws-lambda-nodejs';
import * as apiGateway from '@aws-cdk/aws-apigateway';
import * as route53 from '@aws-cdk/aws-route53';
import * as route53Targets from '@aws-cdk/aws-route53-targets';
import * as acm from '@aws-cdk/aws-certificatemanager';
import { EnvConfig, getDomainName } from './env';
import { TableNames } from './journaling-dynamodb';

interface JournalingLambdaProps {
  envConfig: EnvConfig;
  dynamoTableNames: TableNames;
  hostedZone: route53.IHostedZone;
  acmCert: acm.ICertificate;
}

export class JournalingLambda extends cdk.Construct {
  gqlUrl: string;

  constructor(scope: cdk.Construct, id: string, props: JournalingLambdaProps) {
    super(scope, id);

    const apiDomain = getDomainName(props.envConfig, 'api');

    const serverDir = path.join(__dirname, '../../journaling-server');
    const handlersDir = path.join(serverDir, 'src/handlers');

    const environment = {
      AUTH0_IDENTIFIER: props.envConfig.AUTH0_API_IDENTIFIER,
      AUTH0_DOMAIN: props.envConfig.AUTH0_DOMAIN,
      ELASTIC_NODE: 'http://nope',
      DYNAMO_TABLE_NAMES: JSON.stringify(props.dynamoTableNames),
    };

    const graphql = new lambdaNode.NodejsFunction(this, 'gqlFn', {
      entry: path.join(handlersDir, 'gql.ts'),
      environment,
    });
    const api = new apiGateway.RestApi(this, 'gqlApi', {
      domainName: {
        domainName: apiDomain,
        certificate: props.acmCert,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apiGateway.Cors.ALL_ORIGINS,
        allowMethods: ['GET', 'POST', 'HEAD', 'OPTIONS'],
        allowHeaders: ['Authorization', 'Content-Type'],
        maxAge: cdk.Duration.days(10),
      },
    });
    api.root.addResource('graphql').addMethod(
      'POST',
      new apiGateway.LambdaIntegration(graphql, {
        proxy: false,
        passthroughBehavior: apiGateway.PassthroughBehavior.NEVER,
        requestTemplates: {
          'application/json': `{
              "method": "$context.httpMethod",
              "body" : $input.json('$'),
              "headers": {
                  #foreach($param in $input.params().header.keySet())
                  "$param": "$util.escapeJavaScript($input.params().header.get($param))"
                  #if($foreach.hasNext),#end
                  #end
              }
          }`,
        },
      })
    );

    new route53.ARecord(this, 'apiRecord', {
      zone: props.hostedZone,
      recordName: apiDomain,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.ApiGateway(api)
      ),
    });

    this.gqlUrl = `https://${apiDomain}/graphql`;

    new cdk.CfnOutput(this, 'gqlUrl', {
      value: this.gqlUrl,
    });
  }
}
