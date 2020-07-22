import { gql, PubSub } from 'apollo-server';
import createModel, { TestCounterState } from './model';
import { Resolvers } from './generated/graphql';

export interface Context {
  counterState: TestCounterState;
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
    counter: (q, args, ctx) => ctx.counterState.counter,
  },
  Mutation: {
    counterIncrement: (m, args, ctx) => {
      ctx.counterState.counter += 1;
      ctx.pubSub.publish('COUNTER_INCREMENTED', {
        counterIncremented: ctx.counterState.counter,
      });
      return ctx.counterState.counter;
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
