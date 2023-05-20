const { Stack, RemovalPolicy, Duration} = require('aws-cdk-lib');
const { Bucket, EventType } = require("aws-cdk-lib/aws-s3");
const { Runtime, Code, Function } = require("aws-cdk-lib/aws-lambda");
const { S3EventSource, SqsEventSource} = require("aws-cdk-lib/aws-lambda-event-sources");
const {Queue} = require("aws-cdk-lib/aws-sqs");
const {AttributeType, Table} = require("aws-cdk-lib/aws-dynamodb");
const {PolicyStatement, ServicePrincipal} = require("aws-cdk-lib/aws-iam");

class ExampleS3EventDynamo extends Stack {

  constructor(scope, id, props) {
    super(scope, id, props);

    const imagesBucket = new Bucket(this, 'ImagesBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const imagesToGenerateMetadataQueue = new Queue(this, 'ImagesToGenerateMetadataQueue', {
      visibilityTimeout: Duration.seconds(300),
    });

    const sendMessageToQueueFn = new Function(this, 'SendMessageToQueue', {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset('lambda'),
      handler: 'send-message-to-queue.handler',
      environment: {
        QUEUE_URL: imagesToGenerateMetadataQueue.queueUrl,
      },
    });

    imagesBucket.grantRead(sendMessageToQueueFn);
    sendMessageToQueueFn.addEventSource(new S3EventSource(imagesBucket, { events: [ EventType.OBJECT_CREATED ] }));

    imagesToGenerateMetadataQueue.grantSendMessages(sendMessageToQueueFn);

    const imagesTable = new Table(this, 'Images', {
      tableName: 'Images',
      partitionKey: { name: 'filename', type: AttributeType.STRING },
      sortKey: { name: 'size', type: AttributeType.NUMBER },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const generateMetadataFn = new Function(this, 'GenerateMetadataFn', {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset('lambda'),
      handler: 'generate-metadata.handler',
      environment: {
        TABLE_NAME: imagesTable.tableName,
      },
    });

    imagesBucket.grantRead(generateMetadataFn);

    generateMetadataFn.addEventSource(new SqsEventSource(imagesToGenerateMetadataQueue));
    imagesTable.grantWriteData(generateMetadataFn);

    generateMetadataFn.addToRolePolicy(new PolicyStatement({
      actions: ['rekognition:DetectLabels'],
      resources: ['*'],
    }));

    const rekognitionBucketPolicy = new PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [imagesBucket.bucketArn + '/*'],
      principals: [new ServicePrincipal('rekognition.amazonaws.com')],
    });

    imagesBucket.addToResourcePolicy(rekognitionBucketPolicy);


  }

}

module.exports = { ExampleS3EventDynamo }
