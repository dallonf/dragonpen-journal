import * as cdk from '@aws-cdk/core';
import * as elasticsearch from '@aws-cdk/aws-elasticsearch';
import * as ecsPatterns from '@aws-cdk/aws-ecs-patterns';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as route53 from '@aws-cdk/aws-route53';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as iam from '@aws-cdk/aws-iam';
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

    const zone = route53.HostedZone.fromHostedZoneAttributes(this, 'r53zone', {
      zoneName: props.envConfig.DOMAIN,
      hostedZoneId: props.envConfig.R53_HOSTED_ZONE_ID,
    });

    const acmCert = acm.Certificate.fromCertificateArn(
      this,
      'httpsCert',
      props.envConfig.ARN_HTTPS_CERT
    );

    const vpc = new ec2.Vpc(this, 'vpc', {
      maxAzs: 2,
      natGateways: 0,
    });

    const dbSecurityGroup = new ec2.SecurityGroup(this, 'databaseGroup', {
      vpc,
      allowAllOutbound: true,
    });
    const apiSecurityGroup = new ec2.SecurityGroup(this, 'apiGroup', {
      vpc,
      allowAllOutbound: true,
    });

    dbSecurityGroup.addIngressRule(
      apiSecurityGroup,
      ec2.Port.tcp(9200),
      'API can access database'
    );

    if (props.enableExpensiveStuff) {
      const ecDomain = new elasticsearch.CfnDomain(this, 'elasticsearch', {
        // TODO: VPC
        elasticsearchClusterConfig: {
          instanceCount: 1,
          instanceType: 't2.small.elasticsearch',
          dedicatedMasterEnabled: false,
        },
        elasticsearchVersion: '7.4',
        ebsOptions: {
          ebsEnabled: true,
          volumeSize: 10,
          volumeType: 'standard',
        },
        accessPolicies: {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: {
                AWS: '*',
              },
              Action: ['es:*'],
              Resource: '*',
            },
          ],
        },
      });

      const ecsCluster = new ecs.Cluster(this, 'ecsCluster', {
        vpc,
        capacity: {
          vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
          instanceType: new ec2.InstanceType('t2.micro'),
          minCapacity: 1,
          maxCapacity: 1,
        },
      });

      const apiService = new ecsPatterns.ApplicationLoadBalancedEc2Service(
        this,
        'gqlservice',
        {
          cluster: ecsCluster,
          cpu: 256,
          memoryLimitMiB: 512,
          taskImageOptions: {
            image: ecs.ContainerImage.fromAsset('../journaling-server'),
            containerPort: 4000,
            environment: {
              AUTH0_IDENTIFIER: props.envConfig.AUTH0_API_IDENTIFIER,
              AUTH0_DOMAIN: props.envConfig.AUTH0_DOMAIN,
              ELASTIC_NODE: `https://${ecDomain.attrDomainEndpoint}`,
            },
          },
          domainName: apiDomain,
          domainZone: zone,
          certificate: acmCert,
        }
      );
      apiService.service.connections.addSecurityGroup(apiSecurityGroup);

      new cdk.CfnOutput(this, 'gqlUrl', {
        value: gqlUrl,
      });
    }

    const ui = new JournalingUi(this, 'ui', {
      envConfig: props.envConfig,
      gqlUrl,
      hostedZone: zone,
      acmCert,
    });

    new cdk.CfnOutput(this, 'appUrl', {
      value: ui.appUrl,
    });
  }
}
