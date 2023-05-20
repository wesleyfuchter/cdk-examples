#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { ExampleS3EventDynamo } = require('../lib/example-s3-event-dynamo');

const app = new cdk.App();
new ExampleS3EventDynamo(app, 'ExampleS3EventDynamo', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: 'us-east-1',
    }
});
