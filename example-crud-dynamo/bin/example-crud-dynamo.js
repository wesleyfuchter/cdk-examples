#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { ExampleCrudDynamoStack } = require('../lib/example-crud-dynamo-stack');

const app = new cdk.App();
new ExampleCrudDynamoStack(app, 'ExampleCrudDynamoStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    }
});
