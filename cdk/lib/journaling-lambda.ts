import * as path from 'path';
import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as lambdaNode from '@aws-cdk/aws-lambda-nodejs';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2';

interface JournalingLambdaProps {}

export class JournalingLambda extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: JournalingLambdaProps) {
    super(scope, id);

    const serverDir = path.join(__dirname, '../../journaling-server');
    const handlersDir = path.join(serverDir, 'src/handlers');

    const hello = new lambdaNode.NodejsFunction(this, 'helloFn', {
      entry: path.join(handlersDir, 'hello.ts'),
    });

    const api = new apiGateway.HttpApi(this, 'api');

    api.addRoutes({
      path: '/hello',
      methods: [apiGateway.HttpMethod.GET],
      integration: new apiGateway.LambdaProxyIntegration({ handler: hello }),
    });

    new cdk.CfnOutput(this, 'helloApiUrl', {
      value: `${api.url}hello`,
    });
  }
}
