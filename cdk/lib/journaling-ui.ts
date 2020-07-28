import * as path from 'path';
import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3Assets from '@aws-cdk/aws-s3-assets';
import * as codebuild from '@aws-cdk/aws-codebuild';
import { EnvConfig } from './env';

export interface JournalingUiProps {
  gqlUrl: string;
  envConfig: EnvConfig;
}

export class JournalingUi extends cdk.Construct {
  appUrl: string;

  constructor(scope: cdk.Construct, id: string, props: JournalingUiProps) {
    super(scope, id);

    const sourceAsset = new s3Assets.Asset(this, 'uiSource', {
      path: path.resolve('../journaling-client'),
      exclude: ['build', 'node_modules', '.env', 'tmp'],
    });

    const appBucket = new s3.Bucket(this, 'appBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new codebuild.Project(this, 'builder', {
      source: codebuild.Source.s3({
        bucket: sourceAsset.bucket,
        path: sourceAsset.s3ObjectKey,
      }),
      environmentVariables: {
        REACT_APP_AUTH0_DOMAIN: { value: props.envConfig.AUTH0_DOMAIN },
        REACT_APP_AUTH0_CLIENT_ID: { value: props.envConfig.AUTH0_CLIENT_ID },
        REACT_APP_AUTH0_API_ID: { value: props.envConfig.AUTH0_API_IDENTIFIER },
        REACT_APP_GQL_URL: { value: props.gqlUrl },
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            'runtime-versions': {
              nodejs: '14.x',
            },
            commands: ['npm install'],
          },
          build: {
            commands: ['npm run build'],
          },
        },
        artifacts: {
          files: 'build/**/*',
        },
      }),
      artifacts: codebuild.Artifacts.s3({
        bucket: appBucket,
        encryption: false,
        packageZip: false,
      }),
    });

    this.appUrl = appBucket.bucketWebsiteUrl;
  }
}
