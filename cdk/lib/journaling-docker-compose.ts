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

interface JournalingDockerComposeProps {}

export class JournalingDockerCompose extends cdk.Construct {
  constructor(
    scope: cdk.Construct,
    id: string,
    props: JournalingDockerComposeProps
  ) {
    super(scope, id);

    const serverDockerImage = new DockerImageAsset(this, 'serverDockerImage', {
      directory: path.join(__dirname, '../../journaling-server'),
    });

    new cdk.CfnOutput(this, 'serverDockerImageUri', {
      value: serverDockerImage.imageUri,
    });

    const serverConfigBucket = s3.Bucket.fromBucketName(
      this,
      'serverConfigBucket',
      'dallonf-ec2-config'
    );

    new s3Deployment.BucketDeployment(this, 'appDeployment', {
      sources: [
        s3Deployment.Source.asset(path.join(__dirname, '../server-config')),
      ],
      destinationBucket: serverConfigBucket,
      prune: false,
    });
  }
}
