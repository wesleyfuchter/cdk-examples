#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { ExampleContentDeliveryNetworkStack } = require('../lib/example-content-delivery-network-stack');

const app = new cdk.App();
new ExampleContentDeliveryNetworkStack(app, 'ExampleContentDeliveryNetworkStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    }
});
