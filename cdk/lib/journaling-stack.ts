import * as cdk from '@aws-cdk/core';
import * as elasticsearch from '@aws-cdk/aws-elasticsearch';
import * as ecsPatterns from '@aws-cdk/aws-ecs-patterns';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ec2 from '@aws-cdk/aws-ec2';
import { EnvConfig } from './env';
import { JournalingUi } from './journaling-ui';

interface JournalingStackProps extends cdk.StackProps {
  envConfig: EnvConfig;
  enableExpensiveStuff?: boolean;
}

export class JournalingStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: JournalingStackProps) {
    super(scope, id, props);

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

      const gqlUrl = `http://${gqlService.loadBalancer.loadBalancerDnsName}/graphql`;

      const ui = new JournalingUi(this, 'ui', {
        envConfig: props.envConfig,
        gqlUrl,
      });

      new cdk.CfnOutput(this, 'gqlUrl', {
        value: gqlUrl,
      });

      new cdk.CfnOutput(this, 'appUrl', {
        value: ui.appUrl,
      });
    }
  }
}
