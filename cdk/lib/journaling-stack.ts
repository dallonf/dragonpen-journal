import * as cdk from '@aws-cdk/core';
import * as elasticsearch from '@aws-cdk/aws-elasticsearch';

export class JournalingStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    new elasticsearch.CfnDomain(this, 'elasticsearch', {
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
  }
}
