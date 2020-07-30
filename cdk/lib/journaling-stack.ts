import * as cdk from '@aws-cdk/core';
import * as elasticsearch from '@aws-cdk/aws-elasticsearch';
import * as ecsPatterns from '@aws-cdk/aws-ecs-patterns';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as route53 from '@aws-cdk/aws-route53';
import * as route53Targets from '@aws-cdk/aws-route53-targets';
import * as acm from '@aws-cdk/aws-certificatemanager';
import { EnvConfig, getDomainName } from './env';
import { JournalingUi } from './journaling-ui';

interface JournalingStackProps extends cdk.StackProps {
  envConfig: EnvConfig;
  enableExpensiveStuff?: boolean;
}

export class JournalingStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: JournalingStackProps) {
    super(scope, id, props);

    const gqlDomain = getDomainName(props.envConfig, 'api');
    const gqlUrl = `http://${gqlDomain}/graphql`;

    const zone = route53.HostedZone.fromHostedZoneAttributes(this, 'r53zone', {
      zoneName: props.envConfig.DOMAIN,
      hostedZoneId: props.envConfig.R53_HOSTED_ZONE_ID,
    });

    const acmCert = acm.Certificate.fromCertificateArn(
      this,
      'httpsCert',
      props.envConfig.ARN_HTTPS_CERT
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
      });

      const vpc = new ec2.Vpc(this, 'vpc', {
        maxAzs: 2,
        natGateways: 0,
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

      const gqlService = new ecsPatterns.ApplicationLoadBalancedEc2Service(
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
        }
      );

      new route53.ARecord(this, 'gqlServiceRecord', {
        zone,
        recordName: gqlDomain,
        target: route53.RecordTarget.fromAlias(
          new route53Targets.LoadBalancerTarget(gqlService.loadBalancer)
        ),
      });

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
