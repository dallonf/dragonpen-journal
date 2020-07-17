import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    hello: String!
    counter: Int
  }
`;

export const resolvers = {
  Query: {
    hello: () => 'Hello GraphQL!',
    counter: () => 0,
  },
};
