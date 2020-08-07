import * as http from 'http';
import * as qs from 'querystring';
import type * as expressTypes from 'express';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import axios from 'axios';
import { typeDefs, resolvers, Context } from './src/schema';
// import createModel from './src/model';
import { handler as helloHandler } from './src/handlers/hello';
import { validateTokenAndGetUser } from './src/server/checkJwt';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

const express = require('express') as () => expressTypes.Express;

const app = express();
app.get('/', (req, res) => {
  res.json({ healthy: true });
});

app.get('/hello', (req, res, next) => {
  // TODO: this could be refactored to be more reusable and more robust
  const querystring = req.url.split('?')[1] ?? '';
  helloHandler({
    headers: (req.headers as unknown) as {
      [key: string]: string;
    },
    isBase64Encoded: false,
    rawPath: req.path,
    rawQueryString: querystring,
    requestContext: ({} as unknown) as APIGatewayProxyEventV2['requestContext'],
    routeKey: req.path,
    version: '1',
    body: req.body,
    cookies: req.cookies,
    pathParameters: req.params,
    queryStringParameters: (qs.parse(querystring) as unknown) as {
      [key: string]: string;
    },
  })
    .then((result) => {
      const { headers, cookies, statusCode, body, isBase64Encoded } = result;
      if (statusCode) {
        res.status(statusCode);
      }
      if (cookies) {
        throw new Error('cookies not supported');
      }
      if (isBase64Encoded) {
        throw new Error('isBase64Encoded not supported');
      }
      if (headers) {
        Object.keys(headers).forEach((k) => {
          let val = headers[k];
          if (typeof val == 'number' || typeof val == 'boolean') {
            val = val.toString();
          }
          res.header(k, val);
        });
      }

      res.send(body);
    })
    .catch(next);
});

// TODO: this might be better for env
const baseUrl = 'http://localhost:4000';

if (process.env.NODE_ENV === 'development') {
  app.get('/jwt', (req, res, next) => {
    (async () => {
      const code = req.param('code');

      if (code) {
        const response = await axios.post(
          `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
          qs.encode({
            grant_type: 'authorization_code',
            client_id: process.env.AUTH0_TEST_CLIENT_ID,
            client_secret: process.env.AUTH0_TEST_CLIENT_SECRET,
            redirect_uri: `${baseUrl}/jwt`,
            code,
          }),
          {}
        );
        res.send(`Bearer ${response.data.access_token}`);
      } else {
        const url = `https://${process.env.AUTH0_DOMAIN}/authorize?${qs.encode({
          audience: process.env.AUTH0_IDENTIFIER,
          response_type: 'code',
          client_id: process.env.AUTH0_TEST_CLIENT_ID,
          redirect_uri: `${baseUrl}/jwt`,
        })}`;
        res.redirect(url);
      }
    })().catch(next);
  });
}

// const apolloServer = new ApolloServer({
//   typeDefs,
//   resolvers: (resolvers as unknown) as {},
//   context: async ({ req }) => {
//     const jwtHeader = req.header('authorization');
//     if (!jwtHeader) {
//       throw new AuthenticationError(
//         'Must provide a JWT in the Authorization header'
//       );
//     }
//     let user;
//     try {
//       user = await validateTokenAndGetUser(jwtHeader);
//     } catch (err) {
//       throw Object.assign(
//         new AuthenticationError(err.message || 'Error processing JWT'),
//         {
//           original: err,
//         }
//       );
//     }

//     const model = createModel(user);

//     const context: Context = {
//       user,
//       model,
//     };
//     return context;
//   },
// });
// apolloServer.applyMiddleware({ app, cors: true, path: '/graphql' });
const httpServer = http.createServer(app);
// apolloServer.installSubscriptionHandlers(httpServer);

const port = process.env.PORT || 4000;
httpServer.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
