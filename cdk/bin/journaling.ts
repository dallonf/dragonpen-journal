#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { JournalingStack } from '../lib/journaling-stack';
import { JournalingDBStack } from '../lib/journaling-db-stack';
import { loadEnvConfig } from '../lib/env';

const envConfig = loadEnvConfig();

const app = new cdk.App();
const dbStack = new JournalingDBStack(
  app,
  `JournalingDBStack-${envConfig.envName}`,
  {
    envConfig,
  }
);
new JournalingStack(app, `JournalingStack-${envConfig.envName}`, {
  envConfig,
  dbStack,
});
