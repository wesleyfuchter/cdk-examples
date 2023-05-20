const { Stack } = require('aws-cdk-lib');
const { Function, Runtime, Code } = require('aws-cdk-lib/aws-lambda');
const { RestApi, LambdaIntegration } = require('aws-cdk-lib/aws-apigateway');

class ExampleRestApiStack extends Stack {

  constructor(scope, id, props) {
    super(scope, id, props);

    const helloWorldFn = new Function(this, 'HelloWorld', {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset('lambda'),
      handler: 'hello-world.handler',
    });

    const api = new RestApi(this, 'HelloWorldApi', {
      restApiName: 'HelloWorldApi',
    });

    api.root.addMethod('GET', new LambdaIntegration(helloWorldFn));

  }

}

module.exports = { ExampleRestApiStack }
