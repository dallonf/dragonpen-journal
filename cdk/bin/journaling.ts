#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { JournalingStack } from '../lib/journaling-stack';

const app = new cdk.App();
new JournalingStack(app, 'JournalingStackStaging');
