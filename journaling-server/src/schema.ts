import { gql } from 'apollo-server';
import { Model } from './model';
import { Resolvers } from './generated/graphql';

export interface Context {
  model: Model;
}

export const typeDefs = gql`
  type Query {
    hello: String!
  }

  input JournalEntrySaveInput {
    id: ID!
    timestamp: String!
    text: String!
  }

  type JournalEntry {
    id: ID!
    timestamp: String!
    text: String!
  }

  type JournalEntrySaveResponse {
    success: Boolean!
    journalEntry: JournalEntry
  }

  type Mutation {
    journalEntrySave(input: JournalEntrySaveInput!): JournalEntrySaveResponse!
  }
`;

export const resolvers: Resolvers<Context> = {
  Query: {
    hello: () => 'Hello GraphQL!',
  },
  Mutation: {
    journalEntrySave: async (m, args, ctx) => {
      const { input } = args;
      const result = await ctx.model.journalEntry.save({
        id: input.id,
        timestamp: new Date(input.timestamp),
        text: input.text,
      });

      return {
        success: true,
        journalEntry: {
          ...result,
          timestamp: result.timestamp.toISOString(),
        },
      };
    },
  },
};
