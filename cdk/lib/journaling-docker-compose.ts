import * as path from 'path';
import * as cdk from '@aws-cdk/core';
import { DockerImageAsset } from '@aws-cdk/aws-ecr-assets';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3Deployment from '@aws-cdk/aws-s3-deployment';

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
