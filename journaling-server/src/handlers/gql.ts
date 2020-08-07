import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { graphql } from 'graphql';
import { makeExecutableSchema } from 'apollo-server';
import createModel from '../model';
import { Context, typeDefs, resolvers } from '../schema';

const schema = makeExecutableSchema<Context>({
  typeDefs,
  resolvers: (resolvers as unknown) as {},
});

const tryParseBody = (
  body: string | undefined
):
  | {
      success: true;
      query: string;
      operationName?: string;
      variables?: { [key: string]: any };
    }
  | {
      success: false;
      errorMessage: string;
    } => {
  if (!body) {
    return { success: false, errorMessage: 'Body is required' };
  }

  let json;
  try {
    json = JSON.parse(body);
  } catch (e) {
    return { success: false, errorMessage: 'Body must be JSON' };
  }
  if (typeof json.query !== 'string') {
    return { success: false, errorMessage: 'query is required' };
  }
  if (json.operationName && typeof json.operationName !== 'string') {
    return { success: false, errorMessage: 'operationName must be a string' };
  }
  if (json.variables && typeof json.variables !== 'object') {
    return { success: false, errorMessage: 'variables must be an object' };
  }

  return {
    success: true,
    query: json.query,
    operationName: json.operationName,
  };
};

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> => {
  const tryBody = tryParseBody(event.body);

  if (!tryBody.success) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: tryBody.errorMessage }),
    };
  }

  const { success, ...body } = tryBody;

  const dummyUser = {
    id: 'test-id',
    name: 'Homer Simpson',
  };

  const model = createModel(dummyUser);
  const context: Context = {
    user: dummyUser,
    model,
  };

  const result = await graphql(
    schema,
    body.query,
    null,
    context,
    body.variables,
    body.operationName
  );
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(result),
  };
};
