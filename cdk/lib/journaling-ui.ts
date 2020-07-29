import * as path from 'path';
import * as childProcess from 'child_process';
import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3Deployment from '@aws-cdk/aws-s3-deployment';
import { EnvConfig } from './env';

export interface JournalingUiProps {
  gqlUrl: string;
  envConfig: EnvConfig;
}

export class JournalingUi extends cdk.Construct {
  appUrl: string;

  constructor(scope: cdk.Construct, id: string, props: JournalingUiProps) {
    super(scope, id);

    if (process.env.BUILD_UI) {
      const envVars: { [key: string]: string } = {
        REACT_APP_AUTH0_DOMAIN: props.envConfig.AUTH0_DOMAIN,
        REACT_APP_AUTH0_CLIENT_ID: props.envConfig.AUTH0_CLIENT_ID,
        REACT_APP_AUTH0_API_ID: props.envConfig.AUTH0_API_IDENTIFIER,
        REACT_APP_GQL_URL: props.gqlUrl,
      };
      const envVarsPrefix = Object.keys(envVars)
        .map((k) => `${k}="${envVars[k]}"`)
        .join(' ');
      childProcess.execSync(`${envVarsPrefix} npm run build`, {
        cwd: path.resolve('../journaling-client'),
        stdio: 'inherit',
      });
    }

    const appBucket = new s3.Bucket(this, 'appBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new s3Deployment.BucketDeployment(this, 'appDeployment', {
      sources: [
        s3Deployment.Source.asset(path.resolve('../journaling-client/build')),
      ],
      destinationBucket: appBucket,
    });

    this.appUrl = appBucket.bucketWebsiteUrl;
  }
}
