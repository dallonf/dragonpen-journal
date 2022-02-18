import * as path from 'path';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { aws_s3 as s3, aws_s3_deployment as s3Deployment } from 'aws-cdk-lib';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';

interface JournalingDockerComposeProps {}

export class JournalingDockerCompose extends Construct {
  constructor(
    scope: Construct,
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
