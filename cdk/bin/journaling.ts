#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { JournalingStack } from '../lib/journaling-stack';
import { getEnvConfig } from '../lib/env';

const app = new cdk.App();
new JournalingStack(app, 'JournalingStackStaging', {
  envConfig: getEnvConfig('staging'),
  enableExpensiveStuff: true,
});
