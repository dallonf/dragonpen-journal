import * as cdk from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';
import * as acm from '@aws-cdk/aws-certificatemanager';
import { EnvConfig } from './env';
import { JournalingUi } from './journaling-ui';
import { JournalingLambda } from './journaling-lambda';
import { JournalingDynamoDB } from './journaling-dynamodb';

interface JournalingStackProps extends cdk.StackProps {
  envConfig: EnvConfig;
  enableExpensiveStuff?: boolean;
}

export class JournalingStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: JournalingStackProps) {
    super(scope, id, props);

    const zone = route53.HostedZone.fromHostedZoneAttributes(this, 'r53zone', {
      zoneName: props.envConfig.route53HostedZoneDomain,
      hostedZoneId: props.envConfig.route53HostedZoneId,
    });

    const acmCert = acm.Certificate.fromCertificateArn(
      this,
      'httpsCert',
      props.envConfig.httpsCertArn
    );

    const dynamo = new JournalingDynamoDB(this, 'dynamoTables', {
      envConfig: props.envConfig,
    });

    const lambdaServer = new JournalingLambda(this, 'lambdaServer', {
      envConfig: props.envConfig,
      dynamo,
      hostedZone: zone,
      acmCert,
    });

    new cdk.CfnOutput(this, 'gqlUrl', {
      value: lambdaServer.gqlUrl,
    });

    const ui = new JournalingUi(this, 'ui', {
      envConfig: props.envConfig,
      hostedZone: zone,
      acmCert,
    });

    new cdk.CfnOutput(this, 'appUrl', {
      value: props.envConfig.appUrl,
    });
  }
}
