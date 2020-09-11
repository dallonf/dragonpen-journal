import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import {
  graphql,
  formatError as formatGqlError,
  GraphQLFormattedError,
} from 'graphql';
import { makeExecutableSchema } from 'apollo-server';
import * as yup from 'yup';
import createModel from '../model';
import { Context, typeDefs, resolvers } from '../schema';
import { validateTokenAndGetUser } from '../server/checkJwt';

const schema = makeExecutableSchema<Context>({
  typeDefs,
  resolvers: (resolvers as unknown) as {},
});

const queryYupSchema = yup.object().required().shape({
  query: yup.string().required(),
  operationName: yup.string().required(),
  variables: yup.object(),
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
  let result;
  try {
    json = JSON.parse(body);
    result = queryYupSchema.cast(json);
  } catch (e) {
    return { success: false, errorMessage: e.message };
  }

  return {
    success: true,
    ...result,
  };
};

const jsonResponse = (
  input: Omit<APIGatewayProxyStructuredResultV2, 'body'> & { body: any }
) => {
  return {
    ...input,
    headers: { ...(input.headers || {}), 'Content-Type': 'application/json' },
    body: JSON.stringify(input.body),
  };
};

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> => {
  const tryBody = tryParseBody(event.body);

  if (!tryBody.success) {
    return jsonResponse({
      statusCode: 400,
      body: { message: tryBody.errorMessage },
    });
  }

  const { success, ...body } = tryBody;

  const jwtHeader = event.headers['authorization'];
  let user;
  if (jwtHeader) {
    try {
      user = await validateTokenAndGetUser(jwtHeader);
    } catch (err) {
      console.error(err);
      return jsonResponse({
        statusCode: 401,
        body: {
          message: err.message
            ? `Error processing JWT: ${err.message}`
            : 'Error processing JWT',
        },
      });
    }
  }

  const model = createModel(user ?? null);

  const result = await graphql(
    schema,
    body.query,
    null,
    model,
    body.variables,
    body.operationName
  );

  const errors = result.errors;
  let resultBody: {
    data: typeof result['data'];
    errors?: GraphQLFormattedError[];
  } = { data: result.data };
  if (errors) {
    resultBody.errors = errors.map((x) => {
      console.error(x);
      return formatGqlError(x);
    });
  }

  return jsonResponse({
    statusCode: 200,
    body: result,
  });
};
