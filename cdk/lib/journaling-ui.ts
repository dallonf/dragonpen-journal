import * as path from 'path';
import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as crypto from 'crypto';
import * as s3Deployment from '@aws-cdk/aws-s3-deployment';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as route53 from '@aws-cdk/aws-route53';
import * as route53Targets from '@aws-cdk/aws-route53-targets';
import * as acm from '@aws-cdk/aws-certificatemanager';
import { EnvConfig } from './env';

export interface JournalingUiProps {
  envConfig: EnvConfig;
  hostedZone: route53.IHostedZone;
  acmCert: acm.ICertificate;
}

export class JournalingUi extends cdk.Construct {
  bucket: s3.Bucket;
  distribution: cloudfront.IDistribution;

  constructor(scope: cdk.Construct, id: string, props: JournalingUiProps) {
    super(scope, id);

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
            aliases: [props.envConfig.appDomain],
            securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2018,
            sslMethod: cloudfront.SSLMethod.SNI,
          }
        ),
      }
    );

    new route53.ARecord(this, 'appRecord', {
      zone: props.hostedZone,
      recordName: props.envConfig.appDomain,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(cloudfrontDistribution)
      ),
    });

    this.bucket = appBucket;
    this.distribution = cloudfrontDistribution;
  }
}
