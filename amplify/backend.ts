import { defineBackend } from '@aws-amplify/backend';
import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { CorsHttpMethod, HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpJwtAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda';
import { Bucket } from 'aws-cdk-lib/aws-s3';

import { auth } from './auth/resource';
import { data } from './data/resource';
import { echolabApi } from './functions/echolab-api/resource';

const backend = defineBackend({
  auth,
  data,
  echolabApi,
});

// Reuse the stack created for the function's resource group.
// (Avoid creating a custom stack with the same name twice.)
const apiStack = backend.echolabApi.stack;

// Persistence for the FastAPI monolith
const voicesTable = new Table(apiStack, 'VoicesTable', {
  billingMode: BillingMode.PAY_PER_REQUEST,
  partitionKey: { name: 'voiceId', type: AttributeType.STRING },
  removalPolicy: RemovalPolicy.DESTROY,
});

const presetsTable = new Table(apiStack, 'PresetsTable', {
  billingMode: BillingMode.PAY_PER_REQUEST,
  partitionKey: { name: 'userId', type: AttributeType.STRING },
  sortKey: { name: 'presetId', type: AttributeType.STRING },
  removalPolicy: RemovalPolicy.DESTROY,
});

const messagePacksTable = new Table(apiStack, 'MessagePacksTable', {
  billingMode: BillingMode.PAY_PER_REQUEST,
  partitionKey: { name: 'userId', type: AttributeType.STRING },
  sortKey: { name: 'packId', type: AttributeType.STRING },
  removalPolicy: RemovalPolicy.DESTROY,
});

const voiceSelectionsTable = new Table(apiStack, 'VoiceSelectionsTable', {
  billingMode: BillingMode.PAY_PER_REQUEST,
  partitionKey: { name: 'userId', type: AttributeType.STRING },
  sortKey: { name: 'pairKey', type: AttributeType.STRING },
  removalPolicy: RemovalPolicy.DESTROY,
});

const tenantDefaultsTable = new Table(apiStack, 'TenantDefaultsTable', {
  billingMode: BillingMode.PAY_PER_REQUEST,
  partitionKey: { name: 'tenantId', type: AttributeType.STRING },
  sortKey: { name: 'pairKey', type: AttributeType.STRING },
  removalPolicy: RemovalPolicy.DESTROY,
});

const audioBucket = new Bucket(apiStack, 'AudioBucket', {
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
});

const apiLambda = backend.echolabApi.resources.lambda as LambdaFunction;

voicesTable.grantReadWriteData(apiLambda);
presetsTable.grantReadWriteData(apiLambda);
messagePacksTable.grantReadWriteData(apiLambda);
voiceSelectionsTable.grantReadWriteData(apiLambda);
tenantDefaultsTable.grantReadWriteData(apiLambda);
audioBucket.grantReadWrite(apiLambda);

apiLambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['polly:SynthesizeSpeech'],
    resources: ['*'],
  })
);

apiLambda.addEnvironment('VOICES_TABLE_NAME', voicesTable.tableName);
apiLambda.addEnvironment('PRESETS_TABLE_NAME', presetsTable.tableName);
apiLambda.addEnvironment('MESSAGE_PACKS_TABLE_NAME', messagePacksTable.tableName);
apiLambda.addEnvironment('VOICE_SELECTIONS_TABLE_NAME', voiceSelectionsTable.tableName);
apiLambda.addEnvironment('TENANT_DEFAULTS_TABLE_NAME', tenantDefaultsTable.tableName);
apiLambda.addEnvironment('AUDIO_BUCKET_NAME', audioBucket.bucketName);

// HTTP API v2 (API Gateway) + Cognito JWT authorizer
const httpApi = new HttpApi(apiStack, 'echolabHttpApi', {
  apiName: 'echolabHttpApi',
  corsPreflight: {
    allowOrigins: ['*'],
    allowHeaders: ['*'],
    allowMethods: [CorsHttpMethod.ANY],
  },
});

const integration = new HttpLambdaIntegration('EcholabLambdaIntegration', apiLambda);

const region = Stack.of(apiStack).region;
const issuer = `https://cognito-idp.${region}.amazonaws.com/${backend.auth.resources.userPool.userPoolId}`;
const authorizer = new HttpJwtAuthorizer('CognitoUserPoolAuthorizer', issuer, {
  jwtAudience: [backend.auth.resources.userPoolClient.userPoolClientId],
});

httpApi.addRoutes({
  path: '/health',
  methods: [HttpMethod.GET],
  integration,
});

httpApi.addRoutes({
  path: '/{proxy+}',
  methods: [HttpMethod.ANY],
  integration,
  authorizer,
});

backend.addOutput({
  custom: {
    API: {
      echolabHttpApi: {
        endpoint: httpApi.apiEndpoint,
        region,
        apiName: 'echolabHttpApi',
      },
    },
  },
});
