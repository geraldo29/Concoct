import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  DeleteCommand,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import type {
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyResultV2,
} from 'aws-lambda';

const TABLE_NAME = process.env.TABLE_NAME!;
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

function ok(body: unknown): APIGatewayProxyResultV2 {
  return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(body) };
}
function created(body: unknown): APIGatewayProxyResultV2 {
  return { statusCode: 201, headers: CORS_HEADERS, body: JSON.stringify(body) };
}
function noContent(): APIGatewayProxyResultV2 {
  return { statusCode: 204, headers: CORS_HEADERS, body: '' };
}
function badRequest(msg: string): APIGatewayProxyResultV2 {
  return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: msg }) };
}
function unauthorized(): APIGatewayProxyResultV2 {
  return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Unauthorized' }) };
}
function notFound(): APIGatewayProxyResultV2 {
  return { statusCode: 404, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Not found' }) };
}

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
): Promise<APIGatewayProxyResultV2> => {
  const sub = event.requestContext.authorizer?.jwt?.claims?.sub as string | undefined;
  if (!sub) return unauthorized();

  const method = event.requestContext.http.method;
  const path = event.requestContext.http.path;

  try {
    // GET /recipes — list all for the user
    if (method === 'GET' && path === '/recipes') {
      return await listRecipes(sub);
    }

    // POST /recipes — create
    if (method === 'POST' && path === '/recipes') {
      const body = parseBody(event.body);
      if (!body || typeof body.name !== 'string') return badRequest('Missing recipe name');
      return await createRecipe(sub, body);
    }

    // DELETE /recipes/{recipeId}
    if (method === 'DELETE' && path.startsWith('/recipes/')) {
      const recipeId = event.pathParameters?.recipeId;
      if (!recipeId) return badRequest('Missing recipeId');
      return await deleteRecipe(sub, recipeId);
    }

    return notFound();
  } catch (err) {
    console.error('Handler error', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Internal error' }),
    };
  }
};

// ─── Operations ──────────────────────────────────────

interface RecipeBody {
  name: string;
  category: string;
  vessel: unknown;
  ingredients: unknown[];
  aiAnalysis?: unknown;
}

async function listRecipes(sub: string): Promise<APIGatewayProxyResultV2> {
  const result = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${sub}`,
        ':sk': 'RECIPE#',
      },
      ScanIndexForward: false, // newest first (assumes SK encodes timestamp)
    }),
  );

  const recipes = (result.Items ?? []).map(stripKeys);
  return ok({ recipes });
}

async function createRecipe(sub: string, body: RecipeBody): Promise<APIGatewayProxyResultV2> {
  const id = `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const createdAt = new Date().toISOString();

  const item = {
    PK: `USER#${sub}`,
    SK: `RECIPE#${createdAt}#${id}`,
    id,
    name: body.name,
    category: body.category,
    vessel: body.vessel,
    ingredients: body.ingredients,
    aiAnalysis: body.aiAnalysis ?? null,
    createdAt,
  };

  await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return created(stripKeys(item));
}

async function deleteRecipe(sub: string, recipeId: string): Promise<APIGatewayProxyResultV2> {
  // Find the item first (we need the full SK)
  const result = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${sub}`,
        ':sk': 'RECIPE#',
      },
    }),
  );

  const target = (result.Items ?? []).find((i) => i.id === recipeId);
  if (!target) return notFound();

  await ddb.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: target.PK, SK: target.SK },
    }),
  );
  return noContent();
}

// ─── Utils ───────────────────────────────────────────

function parseBody(raw: string | null | undefined): RecipeBody | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RecipeBody;
  } catch {
    return null;
  }
}

function stripKeys(item: Record<string, unknown>): Record<string, unknown> {
  const { PK: _PK, SK: _SK, ...rest } = item as { PK: string; SK: string; [k: string]: unknown };
  return rest;
}
