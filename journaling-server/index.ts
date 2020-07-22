import * as http from 'http';
import type * as expressTypes from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers, Context } from './src/schema';
import createModel from './src/model';

const express = require('express') as () => expressTypes.Express;

const app = express();
app.get('/', (req, res) => {
  res.send('Hello World');
});

const model = createModel();

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers: (resolvers as unknown) as {},
  context: () => {
    const context: Context = {
      model,
    };
    return context;
  },
});
apolloServer.applyMiddleware({ app, path: '/graphql' });
const httpServer = http.createServer(app);
apolloServer.installSubscriptionHandlers(httpServer);

const port = process.env.PORT || 4000;
httpServer.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
