import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import {
  aws_route53 as route53,
  aws_certificatemanager as acm,
} from 'aws-cdk-lib';
import { EnvConfig } from './env';
import { JournalingUi } from './journaling-ui';
import { JournalingLambda } from './journaling-lambda';
import { JournalingDBStack } from './journaling-db-stack';

interface JournalingStackProps extends cdk.StackProps {
  envConfig: EnvConfig;
  enableExpensiveStuff?: boolean;
  dbStack: JournalingDBStack;
}

export class JournalingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: JournalingStackProps) {
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

    const lambdaServer = new JournalingLambda(this, 'lambdaServer', {
      envConfig: props.envConfig,
      dbStack: props.dbStack,
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

    new cdk.CfnOutput(this, 'uiBucket', {
      value: ui.bucket.s3UrlForObject(),
    });
    new cdk.CfnOutput(this, 'uiDistribution', {
      value: ui.distribution.distributionId,
    });
  }
}
