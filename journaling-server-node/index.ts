import type * as expressTypes from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers } from './src/schema';
const express = require('express') as () => expressTypes.Express;

const app = express();
app.get('/', (req, res) => {
  res.send('Hello World');
});

const apolloServer = new ApolloServer({ typeDefs, resolvers });
apolloServer.applyMiddleware({ app, path: '/graphql' });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
