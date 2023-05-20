#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { ExampleRestApiStack } = require('../lib/example-rest-api-stack');

const app = new cdk.App();
new ExampleRestApiStack(app, 'ExampleRestApiStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    }
});
