const { DynamoDB } = require('aws-sdk');
const crypto = require('crypto');

exports.handler = async function(event, context) {
    const user = {
        id: crypto.randomUUID(),
        ...JSON.parse(event.body)
    }
    try {
        console.log("Adding a new user: ", user);
        const docClient = new DynamoDB.DocumentClient();
        await docClient.put({
            TableName: 'Users',
            Item: user,
        }).promise();
        return {
            statusCode: 201,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
        };
    } catch (err) {
        console.log('DynamoDB error: ', err);
        return { statusCode: 500, body: 'Failed to add user' };
    }
};
