import { Server as HttpServer } from 'http';
import { Application as ExpressApp } from 'express';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import { typeDefs, resolvers, Context } from '../schema';
import createModel from '../model';
import { validateTokenAndGetUser } from '../server/checkJwt';

export const installApolloServer = ({
  app,
  httpServer,
}: {
  app: ExpressApp;
  httpServer: HttpServer;
}) => {
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

      return model;
    },
  });
  apolloServer.applyMiddleware({ app, cors: true, path: '/graphql' });
  apolloServer.installSubscriptionHandlers(httpServer);
};
