import * as cdk from '@aws-cdk/core';
import * as elasticsearch from '@aws-cdk/aws-elasticsearch';
import * as ecsPatterns from '@aws-cdk/aws-ecs-patterns';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ec2 from '@aws-cdk/aws-ec2';
import { EnvConfig } from './env';

interface JournalingStackProps extends cdk.StackProps {
  envConfig: EnvConfig;
  enableExpensiveStuff?: boolean;
}

export class JournalingStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: JournalingStackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const esCluster = new elasticsearch.CfnDomain(this, 'elasticsearch', {
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

    if (props.enableExpensiveStuff) {
      const vpc = new ec2.Vpc(this, 'vpc', {
        maxAzs: 2,
        natGateways: 0,
      });

      const gqlService = new ecsPatterns.ApplicationLoadBalancedFargateService(
        this,
        'gqlservice',
        {
          vpc,
          assignPublicIp: true,
          // hours per month: 750
          cpu: 256, // $0.01012/hr
          memoryLimitMiB: 512, //$0.0022225/hr
          // total cost/hr: $0.0123425
          // total cost/mo: $8.8866
          taskImageOptions: {
            image: ecs.ContainerImage.fromAsset('../journaling-server'),
            containerPort: 4000,
            environment: {
              AUTH0_IDENTIFIER: props.envConfig.AUTH0_API_IDENTIFIER,
              AUTH0_DOMAIN: props.envConfig.AUTH0_DOMAIN,
              ELASTIC_NODE: `https://${esCluster.attrDomainEndpoint}`,
            },
          },
        }
      );

      new cdk.CfnOutput(this, 'loadBalancerUrl', {
        value: `http://${gqlService.loadBalancer.loadBalancerDnsName}`,
      });
    }
  }
}
