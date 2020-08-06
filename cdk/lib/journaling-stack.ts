import * as path from 'path';
import * as cdk from '@aws-cdk/core';
import * as elasticsearch from '@aws-cdk/aws-elasticsearch';
import * as ecsPatterns from '@aws-cdk/aws-ecs-patterns';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as route53 from '@aws-cdk/aws-route53';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as iam from '@aws-cdk/aws-iam';
import * as elb from '@aws-cdk/aws-elasticloadbalancingv2';
import { DockerImageAsset } from '@aws-cdk/aws-ecr-assets';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3Deployment from '@aws-cdk/aws-s3-deployment';
import { EnvConfig, getDomainName } from './env';
import { JournalingUi } from './journaling-ui';

interface JournalingStackProps extends cdk.StackProps {
  envConfig: EnvConfig;
  enableExpensiveStuff?: boolean;
}

export class JournalingStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: JournalingStackProps) {
    super(scope, id, props);

    const apiDomain = getDomainName(props.envConfig, 'api');
    const gqlUrl = `https://${apiDomain}/graphql`;

    // const zone = route53.HostedZone.fromHostedZoneAttributes(this, 'r53zone', {
    //   zoneName: props.envConfig.DOMAIN,
    //   hostedZoneId: props.envConfig.R53_HOSTED_ZONE_ID,
    // });

    // const acmCert = acm.Certificate.fromCertificateArn(
    //   this,
    //   'httpsCert',
    //   props.envConfig.ARN_HTTPS_CERT
    // );

    if (props.enableExpensiveStuff) {
      // const serverImageEnv = {
      //   AUTH0_IDENTIFIER: props.envConfig.AUTH0_API_IDENTIFIER,
      //   AUTH0_DOMAIN: props.envConfig.AUTH0_DOMAIN,
      //   ELASTIC_NODE: `http://nope/`,
      //   PG_HOST: dbService.loadBalancer.loadBalancerDnsName,
      //   PG_DB: 'postgres',
      //   PG_USERNAME: 'postgres',
      //   PG_PASSWORD: 'password',
      // };
      // new cdk.CfnOutput(this, 'gqlUrl', {
      //   value: gqlUrl,
      // });
    }

    const serverDockerImage = new DockerImageAsset(this, 'serverDockerImage', {
      directory: path.join(__dirname, '../../journaling-server'),
    });

    new cdk.CfnOutput(this, 'serverDockerImageUri', {
      value: serverDockerImage.imageUri,
    });

    const serverConfigBucket = s3.Bucket.fromBucketName(this, 'serverConfigBucket', 'dallonf-ec2-config');

    new s3Deployment.BucketDeployment(this, 'appDeployment', {
      sources: [
        s3Deployment.Source.asset(path.join(__dirname, '../server-config')),
      ],
      destinationBucket: serverConfigBucket,
      prune: false
    });

    // const ui = new JournalingUi(this, 'ui', {
    //   envConfig: props.envConfig,
    //   gqlUrl,
    //   hostedZone: zone,
    //   acmCert,
    // });

    // new cdk.CfnOutput(this, 'appUrl', {
    //   value: ui.appUrl,
    // });
  }
}
