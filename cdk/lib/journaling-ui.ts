import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import {
  aws_s3 as s3,
  aws_s3_deployment as s3Deployment,
  aws_cloudfront as cloudfront,
  aws_route53 as route53,
  aws_route53_targets as route53Targets,
  aws_certificatemanager as acm,
} from 'aws-cdk-lib';
import { EnvConfig } from './env';

export interface JournalingUiProps {
  envConfig: EnvConfig;
  hostedZone: route53.IHostedZone;
  acmCert: acm.ICertificate;
}

export class JournalingUi extends Construct {
  bucket: s3.Bucket;
  distribution: cloudfront.IDistribution;

  constructor(scope: Construct, id: string, props: JournalingUiProps) {
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
