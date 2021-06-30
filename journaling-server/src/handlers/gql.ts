import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import {
  graphql,
  formatError as formatGqlError,
  GraphQLFormattedError,
} from "graphql";
import { makeExecutableSchema } from "apollo-server";
import * as yup from "yup";
import createModel from "../model";
import { Context, typeDefs, resolvers } from "../schema";
import { validateTokenAndGetUser } from "../server/checkJwt";

const schema = makeExecutableSchema<Context>({
  typeDefs,
  resolvers: resolvers as unknown as {},
});

const queryYupSchema = yup.object().required().shape({
  query: yup.string().required(),
  operationName: yup.string().required(),
  variables: yup.object(),
});
type Query = yup.InferType<typeof queryYupSchema>;

const batchYupSchema = yup.array().required().of(queryYupSchema);

const tryParseBody = (
  body: string | undefined
):
  | {
      type: "batch";
      queries: yup.InferType<typeof batchYupSchema>;
    }
  | {
      type: "single";
      query: Query;
    }
  | {
      type: "error";
      errorMessage: string;
    } => {
  if (!body) {
    return { type: "error", errorMessage: "Body is required" };
  }

  try {
    const json = JSON.parse(body);
    if (Array.isArray(json)) {
      return {
        type: "batch",
        queries: batchYupSchema.cast(json) as yup.InferType<
          typeof batchYupSchema
        >,
      };
    } else {
      return {
        type: "single",
        query: queryYupSchema.cast(json) as yup.InferType<
          typeof queryYupSchema
        >,
      };
    }
  } catch (e) {
    return { type: "error", errorMessage: e.message };
  }
};

const jsonResponse = (
  input: Omit<APIGatewayProxyStructuredResultV2, "body"> & { body: any }
) => {
  return {
    ...input,
    headers: { ...(input.headers || {}), "Content-Type": "application/json" },
    body: JSON.stringify(input.body),
  };
};

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> => {
  const tryBody = tryParseBody(event.body);

  if (tryBody.type === "error") {
    return jsonResponse({
      statusCode: 400,
      body: { message: tryBody.errorMessage },
    });
  }

  const jwtHeader = event.headers["authorization"];
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
            : "Error processing JWT",
        },
      });
    }
  }

  const model = createModel(user ?? null);

  const getResult = async (query: Query) => {
    const result = await graphql(
      schema,
      query.query,
      null,
      model,
      query.variables,
      query.operationName
    );

    const errors = result.errors;
    let resultBody: {
      data: typeof result["data"];
      errors?: GraphQLFormattedError[];
    } = { data: result.data };
    if (errors) {
      resultBody.errors = errors.map((x) => {
        console.error(x);
        return formatGqlError(x);
      });
    }

    return resultBody;
  };

  if (tryBody.type === "batch") {
    return jsonResponse({
      statusCode: 200,
      body: await Promise.all(tryBody.queries!.map(getResult)),
    });
  } else {
    return jsonResponse({
      statusCode: 200,
      body: getResult(tryBody.query),
    });
  }
};
