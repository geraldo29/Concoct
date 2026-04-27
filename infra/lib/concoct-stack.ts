import * as path from 'path';
import { Stack, StackProps, CfnOutput, RemovalPolicy, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigwv2Auth from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import * as apigwv2Int from 'aws-cdk-lib/aws-apigatewayv2-integrations';

/**
 * Concoct backend stack
 *
 * Provisions:
 *   - Cognito User Pool (email + password sign-in)
 *   - DynamoDB table (single-table design)
 *   - Lambda function for /recipes CRUD
 *   - HTTP API Gateway with Cognito JWT authorizer + permissive CORS
 */
export class ConcoctStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // ════════════════ Cognito ════════════════
    const userPool = new cognito.UserPool(this, 'ConcoctUserPool', {
      userPoolName: 'concoct-users',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      standardAttributes: {
        email: { required: true, mutable: false },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireDigits: true,
        requireUppercase: false,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: RemovalPolicy.RETAIN, // never accidentally drop the user pool
    });

    const userPoolClient = userPool.addClient('ConcoctWebClient', {
      userPoolClientName: 'concoct-web',
      authFlows: {
        userSrp: true, // secure remote password — what aws-amplify uses by default
      },
      preventUserExistenceErrors: true,
      idTokenValidity: Duration.hours(1),
      accessTokenValidity: Duration.hours(1),
      refreshTokenValidity: Duration.days(30),
    });

    // ════════════════ DynamoDB ════════════════
    // Single-table design:
    //   PK = USER#<sub>      SK = RECIPE#<recipeId>
    //   GSI1 (future): browse public recipes
    const table = new dynamodb.Table(this, 'ConcoctTable', {
      tableName: 'concoct-data',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // ════════════════ Lambda ════════════════
    const recipesFn = new lambdaNode.NodejsFunction(this, 'RecipesFn', {
      functionName: 'concoct-recipes',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: path.join(__dirname, '..', 'lambda', 'recipes', 'index.ts'),
      timeout: Duration.seconds(8),
      memorySize: 256,
      environment: {
        TABLE_NAME: table.tableName,
      },
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'node20',
        format: lambdaNode.OutputFormat.ESM,
        // Native AWS SDK v3 is available on the runtime; mark external to keep bundle small
        externalModules: ['@aws-sdk/*'],
      },
    });

    table.grantReadWriteData(recipesFn);

    // ════════════════ HTTP API ════════════════
    const httpApi = new apigwv2.HttpApi(this, 'ConcoctApi', {
      apiName: 'concoct-api',
      corsPreflight: {
        allowOrigins: ['*'],
        allowHeaders: ['authorization', 'content-type'],
        allowMethods: [
          apigwv2.CorsHttpMethod.GET,
          apigwv2.CorsHttpMethod.POST,
          apigwv2.CorsHttpMethod.DELETE,
          apigwv2.CorsHttpMethod.OPTIONS,
        ],
        maxAge: Duration.hours(1),
      },
    });

    const jwtAuthorizer = new apigwv2Auth.HttpUserPoolAuthorizer(
      'CognitoAuthorizer',
      userPool,
      {
        userPoolClients: [userPoolClient],
      },
    );

    const integration = new apigwv2Int.HttpLambdaIntegration('RecipesInt', recipesFn);

    httpApi.addRoutes({
      path: '/recipes',
      methods: [apigwv2.HttpMethod.GET, apigwv2.HttpMethod.POST],
      integration,
      authorizer: jwtAuthorizer,
    });

    httpApi.addRoutes({
      path: '/recipes/{recipeId}',
      methods: [apigwv2.HttpMethod.DELETE],
      integration,
      authorizer: jwtAuthorizer,
    });

    // ════════════════ Outputs ════════════════
    new CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new CfnOutput(this, 'UserPoolClientId', { value: userPoolClient.userPoolClientId });
    new CfnOutput(this, 'ApiUrl', { value: httpApi.apiEndpoint });
    new CfnOutput(this, 'Region', { value: this.region });
    new CfnOutput(this, 'TableName', { value: table.tableName });
  }
}
