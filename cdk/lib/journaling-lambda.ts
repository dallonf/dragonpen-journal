import * as path from 'path';
import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as lambdaNode from '@aws-cdk/aws-lambda-nodejs';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2';
import { EnvConfig } from './env';

interface JournalingLambdaProps {
  envConfig: EnvConfig;
}

export class JournalingLambda extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: JournalingLambdaProps) {
    super(scope, id);

    const serverDir = path.join(__dirname, '../../journaling-server');
    const handlersDir = path.join(serverDir, 'src/handlers');

    const environment = {
      AUTH0_IDENTIFIER: props.envConfig.AUTH0_API_IDENTIFIER,
      AUTH0_DOMAIN: props.envConfig.AUTH0_DOMAIN,
      ELASTIC_NODE: 'http://nope',
    };

    const graphql = new lambdaNode.NodejsFunction(this, 'gqlFn', {
      entry: path.join(handlersDir, 'gql.ts'),
      environment,
    });

    const api = new apiGateway.HttpApi(this, 'api');

    api.addRoutes({
      path: '/graphql',
      methods: [apiGateway.HttpMethod.POST],
      integration: new apiGateway.LambdaProxyIntegration({ handler: graphql }),
    });

    const gqlUrl = `${api.url}graphql`;

    new cdk.CfnOutput(this, 'gqlApi', {
      value: gqlUrl,
    });
  }
}
