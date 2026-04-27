#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ConcoctStack } from '../lib/concoct-stack';

const app = new cdk.App();

new ConcoctStack(app, 'ConcoctStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
  },
  description: 'Concoct backend: Cognito + DynamoDB + Lambda + HTTP API',
});
