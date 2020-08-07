import { gql } from 'apollo-server';
import { Model, JournalEntry as JournalEntryModel } from './model';
import {
  Resolvers,
  JournalEntry as JournalEntryGql,
} from './generated/graphql';
import { User } from './model/user';

export interface Context {
  user: User;
  model: Model;
}

export const typeDefs = gql`
  type Query {
    hello: String!
    journalEntryById(id: ID): JournalEntry
    journalEntries: [JournalEntry!]!
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

const journalEntryModelToGql = (model: JournalEntryModel): JournalEntryGql => ({
  ...model,
  timestamp: model.timestamp.toISOString(),
});

export const resolvers: Resolvers<Context> = {
  Query: {
    hello: () => 'hello, world!',
    journalEntryById: async (q, args, ctx) => {
      if (!args.id) return null;
      const result = await ctx.model.journalEntry.read(args.id);
      if (!result) return null;
      return {
        ...result,
        timestamp: result.timestamp.toISOString(),
      };
    },
    journalEntries: async (q, args, ctx) =>
      (await ctx.model.journalEntry.readList()).map(journalEntryModelToGql),
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
        journalEntry: journalEntryModelToGql(result),
      };
    },
  },
};
