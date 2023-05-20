const { Stack, RemovalPolicy } = require('aws-cdk-lib');
const { Bucket } = require("aws-cdk-lib/aws-s3");
const { BucketDeployment, Source } = require("aws-cdk-lib/aws-s3-deployment");
const { Certificate } = require("aws-cdk-lib/aws-certificatemanager");
const { ViewerCertificate, CloudFrontWebDistribution } = require("aws-cdk-lib/aws-cloudfront");
const { ARecord, RecordTarget, HostedZone } = require("aws-cdk-lib/aws-route53");
const { CloudFrontTarget } = require("aws-cdk-lib/aws-route53-targets");

class ExampleContentDeliveryNetworkStack extends Stack {

  constructor(scope, id, props) {
    super(scope, id, props);

    const websiteBucket = new Bucket(this, 'WebsiteBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false
      },
      removalPolicy: RemovalPolicy.DESTROY
    });

    new BucketDeployment(this, 'DeployWebsite', {
      sources: [Source.asset('./www')],
      destinationBucket: websiteBucket,
    });


    const certificate = Certificate.fromCertificateArn(this, 'WesleyFuchterComCertificate', 'arn:aws:acm:us-east-1:760736027183:certificate/a303a094-4098-43f1-87fc-a152bfe55d90');

    const distribution = new CloudFrontWebDistribution(this, 'WebsiteDistribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: websiteBucket,
          },
          behaviors: [{ isDefaultBehavior: true }],
        },
      ],
      viewerCertificate: ViewerCertificate.fromAcmCertificate(certificate, {
        aliases: ['wesleyfuchter.com'],
      }),
    });

    new ARecord(this, 'WebsiteAliasRecord', {
      recordName: 'wesleyfuchter.com',
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      zone: HostedZone.fromLookup(this, 'Zone', { domainName: 'wesleyfuchter.com' }),
    });

  }

}

module.exports = { ExampleContentDeliveryNetworkStack }
