import { gql } from 'apollo-server';
import { ModelState } from './model';

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

export const resolvers = {
  Query: {
    hello: () => 'Hello GraphQL!',
    counter: (q, args, context: Context) => context.modelState.counter,
  },
  Mutation: {
    counterIncrement: (m, args, context: Context) => {
      context.modelState.counter += 1;
      return context.modelState.counter;
    },
  },
};
