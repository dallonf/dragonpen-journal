import * as path from 'path';
import * as childProcess from 'child_process';
import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as crypto from 'crypto';
import * as s3Deployment from '@aws-cdk/aws-s3-deployment';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as route53 from '@aws-cdk/aws-route53';
import * as route53Targets from '@aws-cdk/aws-route53-targets';
import * as acm from '@aws-cdk/aws-certificatemanager';
import { EnvConfig, getDomainName } from './env';

export interface JournalingUiProps {
  gqlUrl: string;
  envConfig: EnvConfig;
  hostedZone: route53.IHostedZone;
  acmCert: acm.ICertificate;
}

export class JournalingUi extends cdk.Construct {
  appUrl: string;

  constructor(scope: cdk.Construct, id: string, props: JournalingUiProps) {
    super(scope, id);

    const appDomain = getDomainName(props.envConfig);

    const appBucket = new s3.Bucket(this, 'appBucket', {
      websiteIndexDocument: 'index.html',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      publicReadAccess: true,
    });

    const cloudfrontDistribution = new cloudfront.CloudFrontWebDistribution(
      this,
      'cloudfront',
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: appBucket,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
        viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(
          props.acmCert,
          {
            aliases: [appDomain],
            securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2018,
            sslMethod: cloudfront.SSLMethod.SNI,
          }
        ),
      }
    );

    new route53.ARecord(this, 'appRecord', {
      zone: props.hostedZone,
      recordName: appDomain,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(cloudfrontDistribution)
      ),
    });

    if (process.env.BUILD_UI) {
      const envVars: { [key: string]: string } = {
        REACT_APP_AUTH0_DOMAIN: props.envConfig.AUTH0_DOMAIN,
        REACT_APP_AUTH0_CLIENT_ID: props.envConfig.AUTH0_CLIENT_ID,
        REACT_APP_AUTH0_API_ID: props.envConfig.AUTH0_API_IDENTIFIER,
        REACT_APP_GQL_URL: props.gqlUrl,
      };

      const sourcePath = path.join(__dirname, '../../journaling-client');
      const exclude = ['node_modules', 'build'];

      const uiSource = s3Deployment.Source.asset(sourcePath, {
        exclude,
        bundling: {
          image: cdk.BundlingDockerImage.fromRegistry('node:14'),
          command: [
            'bash',
            '-c',
            'npm ci && npm run build && cp -R build/* /asset-output',
          ],
          environment: envVars,
        },

        sourceHash: cdk.FileSystem.fingerprint(sourcePath, {
          exclude,
          extraHash: crypto
            .createHash('md5')
            .update(
              JSON.stringify({
                envVars,
                hashBreak: 1,
              })
            )
            .digest('hex'),
        }),
      });

      new s3Deployment.BucketDeployment(this, 'appDeployment', {
        sources: [uiSource],
        destinationBucket: appBucket,
        distribution: cloudfrontDistribution,
        retainOnDelete: true,
      });
    }

    this.appUrl = `https://${appDomain}`;
  }
}
