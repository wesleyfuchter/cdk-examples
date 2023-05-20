const AWS = require('aws-sdk');
const sqs = new AWS.SQS();

exports.handler = async function(event, context) {
    console.log('Event: ', JSON.stringify(event, null, 2));
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const params = {
        MessageBody: JSON.stringify({
            url: `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
            size: event.Records[0].s3.object.size,
            bucket: bucket,
            key: key
        }),
        QueueUrl: process.env.QUEUE_URL,
    };
    console.log('Params: ', JSON.stringify(params));
    try {
        const data = await sqs.sendMessage(params).promise();
        console.log(`Message sent to SQS queue, message ID: ${data.MessageId}`);
    } catch (error) {
        console.error(`Error sending message to SQS queue: ${error}`);
    }
};
