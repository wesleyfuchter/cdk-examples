const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async function(event, context) {
    console.log('Event: ', JSON.stringify(event, null, 2));
    for (const record of event.Records) {
        const messageBody = JSON.parse(record.body);
        const url = messageBody.url;
        const size = messageBody.size;
        const filename = url.substring(url.lastIndexOf('/') + 1);
        const description = await generateImageDescription(messageBody.bucket, messageBody.key);
        console.log('Description: ', description);
        try {
            const data = await dynamodb.put({
                TableName: process.env.TABLE_NAME,
                Item: {
                    filename: filename,
                    size: size,
                    description: description,
                },
            }).promise();
            console.log(`Inserted item into DynamoDB table: filename=${filename}, size=${size}`);
        } catch (error) {
            console.error(`Error inserting item into DynamoDB table: ${error}`);
        }
    }
};

const rekognition = new AWS.Rekognition({ region: 'us-east-1' });

async function generateImageDescription(bucket, key) {
    const params = {
        Image: {
            S3Object: {
                Bucket: bucket,
                Name: key,
            },
        },
        MaxLabels: 10,
        MinConfidence: 90,
    };
    try {
        const response = await rekognition.detectLabels(params).promise();
        const labels = response.Labels.map(label => label.Name);
        return labels.join(', ');
    } catch (error) {
        console.error(`Error describing image: ${error}`);
    }
}