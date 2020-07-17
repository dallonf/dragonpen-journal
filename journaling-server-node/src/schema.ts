import { gql } from 'apollo-server';
import { ModelState } from './model';
import { Resolvers } from './generated/graphql';

export interface Context {
  modelState: ModelState;
}

export const typeDefs = gql`
  type Query {
    hello: String!
    counter: Int
  }

  type Mutation {
    counterIncrement: Int
  }
`;

export const resolvers: Resolvers<Context> = {
  Query: {
    hello: () => 'Hello GraphQL!',
    counter: (q, args, context) => context.modelState.counter,
  },
  Mutation: {
    counterIncrement: (m, args, context) => {
      context.modelState.counter += 1;
      return context.modelState.counter;
    },
  },
};
