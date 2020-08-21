#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { JournalingStack } from '../lib/journaling-stack';
import { loadEnvConfig } from '../lib/env';

const envConfig = loadEnvConfig();

const app = new cdk.App();
new JournalingStack(app, `JournalingStack-${envConfig.envName}`, {
  envConfig,
});
