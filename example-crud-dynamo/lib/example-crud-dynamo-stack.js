const { Stack, RemovalPolicy} = require('aws-cdk-lib');
const { Function, Runtime, Code } = require('aws-cdk-lib/aws-lambda');
const { RestApi, LambdaIntegration, Cors } = require('aws-cdk-lib/aws-apigateway');
const {Table, AttributeType} = require("aws-cdk-lib/aws-dynamodb");

class ExampleCrudDynamoStack extends Stack {

  constructor(scope, id, props) {
    super(scope, id, props);

    const getUsersFn = new Function(this, 'GetUsers', {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset('lambda'),
      handler: 'get-users.handler',
    });

    const createUserFn = new Function(this, 'CreateUser', {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset('lambda'),
      handler: 'create-user.handler',
    });

    const usersTable = new Table(this, 'Users', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      tableName: 'Users',
      removalPolicy: RemovalPolicy.DESTROY,
    });

    usersTable.grantReadWriteData(getUsersFn);
    usersTable.grantReadWriteData(createUserFn);

    const api = new RestApi(this, 'UsersApi', {
      restApiName: 'UserServiceApi',
    });

    const users = api.root.addResource('users');

    users.addMethod('GET', new LambdaIntegration(getUsersFn));
    users.addMethod('POST', new LambdaIntegration(createUserFn));

  }

}

module.exports = { ExampleCrudDynamoStack }
