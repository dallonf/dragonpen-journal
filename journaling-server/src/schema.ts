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

  input JournalEntryCreateInput {
    timestamp: String!
    text: String!
  }

  type JournalEntry {
    id: ID!
    timestamp: String!
    text: String!
  }

  type JournalEntryCreateResponse {
    success: Boolean!
    journalEntry: JournalEntry
  }

  type Mutation {
    journalEntryCreate(
      input: JournalEntryCreateInput!
    ): JournalEntryCreateResponse!
  }
`;

export const resolvers: Resolvers<Context> = {
  Query: {
    hello: () => 'Hello GraphQL!',
  },
  Mutation: {
    journalEntryCreate: async (m, args, ctx) => {
      const result = await ctx.model.journalEntry.create({
        ...args.input,
        timestamp: new Date(args.input.timestamp),
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
