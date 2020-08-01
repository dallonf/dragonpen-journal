import * as cdk from '@aws-cdk/core';
import * as elasticsearch from '@aws-cdk/aws-elasticsearch';
import * as ecsPatterns from '@aws-cdk/aws-ecs-patterns';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as route53 from '@aws-cdk/aws-route53';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as iam from '@aws-cdk/aws-iam';
import * as elb from '@aws-cdk/aws-elasticloadbalancingv2';
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
    const dbMigrationSecruityGroup = new ec2.SecurityGroup(
      this,
      'dbMigrationGroup',
      {
        vpc,
        allowAllOutbound: true,
      }
    );
    const apiSecurityGroup = new ec2.SecurityGroup(this, 'apiGroup', {
      vpc,
      allowAllOutbound: true,
    });

    // dbSecurityGroup.addIngressRule(
    //   apiSecurityGroup,
    //   ec2.Port.tcp(9200),
    //   'API can access database'
    // );

    if (props.enableExpensiveStuff) {
      const ecsCluster = new ecs.Cluster(this, 'ecsCluster', {
        vpc,
        capacity: {
          vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
          instanceType: new ec2.InstanceType('t2.micro'),
          minCapacity: 1,
          maxCapacity: 1,
        },
      });

      // const apiService = new ecsPatterns.ApplicationLoadBalancedEc2Service(
      //   this,
      //   'gqlservice',
      //   {
      //     cluster: ecsCluster,
      //     cpu: 256,
      //     memoryLimitMiB: 512,
      //     taskImageOptions: {
      //       image: ecs.ContainerImage.fromAsset('../journaling-server'),
      //       containerPort: 4000,
      //       environment: {
      //         AUTH0_IDENTIFIER: props.envConfig.AUTH0_API_IDENTIFIER,
      //         AUTH0_DOMAIN: props.envConfig.AUTH0_DOMAIN,
      //         ELASTIC_NODE: `https://${ecDomain.attrDomainEndpoint}`,
      //       },
      //     },
      //     domainName: apiDomain,
      //     domainZone: zone,
      //     certificate: acmCert,
      //   }
      // );
      // apiService.service.connections.addSecurityGroup(apiSecurityGroup);

      const dbLoadBalancer = new elb.NetworkLoadBalancer(
        this,
        'dbLoadBalancer',
        {
          vpc,
          internetFacing: true,
          vpcSubnets: {
            subnetType: ec2.SubnetType.PUBLIC,
          },
        }
      );
      const dbService = new ecsPatterns.NetworkLoadBalancedEc2Service(
        this,
        'dbService',
        {
          cluster: ecsCluster,
          memoryLimitMiB: 512,
          publicLoadBalancer: false,
          loadBalancer: dbLoadBalancer,
          taskImageOptions: {
            image: ecs.ContainerImage.fromRegistry('postgres:12-alpine'),
            containerPort: 5432,
            environment: {
              // TODO: literally anything but this
              POSTGRES_PASSWORD: 'password',
            },
          },
          maxHealthyPercent: 100,
        }
      );
      dbService.service.connections.addSecurityGroup(dbSecurityGroup);

      const serverImage = ecs.ContainerImage.fromAsset('../journaling-server');
      const serverImageEnv = {
        AUTH0_IDENTIFIER: props.envConfig.AUTH0_API_IDENTIFIER,
        AUTH0_DOMAIN: props.envConfig.AUTH0_DOMAIN,
        ELASTIC_NODE: `http://nope/`,
        PG_HOST: dbService.loadBalancer.loadBalancerDnsName,
        PG_DB: 'postgres',
        PG_USERNAME: 'postgres',
        PG_PASSWORD: 'password',
      };

      const dbMigrateTask = new ecs.Ec2TaskDefinition(this, 'dbMigrateTask');
      dbMigrateTask.addContainer('dbMigrateContainer', {
        memoryLimitMiB: 128,
        image: serverImage,
        command: ['npm', 'run', 'migrate:latest'],
        environment: serverImageEnv,
        logging: new ecs.AwsLogDriver({
          streamPrefix: 'dbMigrate',
        }),
      });

      ecsCluster.connections.addSecurityGroup(dbMigrationSecruityGroup);

      // new cdk.CfnOutput(this, 'gqlUrl', {
      //   value: gqlUrl,
      // });
    }

    // const ui = new JournalingUi(this, 'ui', {
    //   envConfig: props.envConfig,
    //   gqlUrl,
    //   hostedZone: zone,
    //   acmCert,
    // });

    // new cdk.CfnOutput(this, 'appUrl', {
    //   value: ui.appUrl,
    // });
  }
}
