import { gql, PubSub } from 'apollo-server';
import { ModelState } from './model';
import { Resolvers } from './generated/graphql';

export interface Context {
  modelState: ModelState;
  pubSub: PubSub;
}

export const typeDefs = gql`
  type Query {
    hello: String!
    counter: Int!
  }

  type Mutation {
    counterIncrement: Int!
  }

  type Subscription {
    counterIncremented: Int!
  }
`;

export const resolvers: Resolvers<Context> = {
  Query: {
    hello: () => 'Hello GraphQL!',
    counter: (q, args, ctx) => ctx.modelState.counter,
  },
  Mutation: {
    counterIncrement: (m, args, ctx) => {
      ctx.modelState.counter += 1;
      ctx.pubSub.publish('COUNTER_INCREMENTED', {
        counterIncremented: ctx.modelState.counter,
      });
      return ctx.modelState.counter;
    },
  },
  Subscription: {
    counterIncremented: {
      subscribe: (s, args, ctx) => {
        return ctx.pubSub.asyncIterator(['COUNTER_INCREMENTED']);
      },
    },
  },
};
