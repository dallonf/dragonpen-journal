import * as http from 'http';
import type * as expressTypes from 'express';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import { typeDefs, resolvers, Context } from './src/schema';
import createModel from './src/model';
import { validateTokenAndGetUser } from './src/server/checkJwt';

const express = require('express') as () => expressTypes.Express;

const app = express();
app.get('/', (req, res) => {
  res.send('Hello World');
});

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers: (resolvers as unknown) as {},
  context: async ({ req }) => {
    const jwtHeader = req.header('authorization');
    if (!jwtHeader) {
      throw new AuthenticationError(
        'Must provide a JWT in the Authorization header'
      );
    }
    let user;
    try {
      user = await validateTokenAndGetUser(jwtHeader);
    } catch (err) {
      throw Object.assign(
        new AuthenticationError(err.message || 'Error processing JWT'),
        {
          original: err,
        }
      );
    }

    const model = createModel(user);

    const context: Context = {
      user,
      model,
    };
    return context;
  },
});
apolloServer.applyMiddleware({ app, cors: true, path: '/graphql' });
const httpServer = http.createServer(app);
apolloServer.installSubscriptionHandlers(httpServer);

const port = process.env.PORT || 4000;
httpServer.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
