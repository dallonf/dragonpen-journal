import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { SchemaLink } from '@apollo/client/link/schema';
import { buildSchema } from 'graphql';
import * as dateFns from 'date-fns';
import typePolicies from './typePolicies';

describe('journalEntries', () => {
  const journalEntriesTypePolicies = typePolicies.Query.fields?.journalEntries!;

  const sampleSchema = buildSchema(`
    type Query {
      journalEntries(after: String, limit: Int): [JournalEntry!]!
    }

    type JournalEntry {
      id: ID!
      timestamp: String!
      text: String!
    }
  `);

  const makeClient = () => {
    let dateCursor = new Date();
    const sampleData = Array.from({ length: 100 }, (x, i) => {
      dateCursor = dateFns.subMinutes(dateCursor, Math.random() * 60 * 12 + 30);
      return {
        id: Math.random().toString(),
        timestamp: dateCursor.toISOString(),
        text: `Randomized entry ${i}`,
      };
    });
    const query = {
      journalEntries: (args: any) => {
        let result = [...sampleData];
        if (args.after) {
          const index = result.findIndex((x) => x.timestamp < args.after);
          if (index === -1) {
            return [];
          }
          result = result.slice(index);
        }

        if (args.limit) {
          return result.slice(0, args.limit);
        } else {
          return result;
        }
      },
    };

    const link = new SchemaLink({
      schema: sampleSchema,
      rootValue: query,
    });

    return new ApolloClient({
      link,
      cache: new InMemoryCache({
        typePolicies: {
          Query: { fields: { journalEntries: journalEntriesTypePolicies } },
        },
      }),
    });
  };

  it('paginates with fetchMore', async () => {
    const client = makeClient();
    const allQuery = gql`
      {
        journalEntries {
          id
          timestamp
          text
        }
      }
    `;

    const paginatedQuery = gql`
      query Paginated($after: String) {
        journalEntries(after: $after, limit: 7) {
          id
          timestamp
          text
        }
      }
    `;

    const standardResult = (
      await client.query({
        query: allQuery,
        fetchPolicy: 'no-cache',
      })
    ).data;

    const pagedObsQuery = client.watchQuery({
      query: paginatedQuery,
    });

    let paginatedResult = (await pagedObsQuery.result()).data;

    let lastLength;
    do {
      lastLength = paginatedResult.journalEntries.length;
      await pagedObsQuery.fetchMore({
        variables: {
          after:
            paginatedResult.journalEntries[
              paginatedResult.journalEntries.length - 1
            ].timestamp,
        },
      });
      paginatedResult = (await pagedObsQuery.result()).data;
    } while (paginatedResult.journalEntries.length > lastLength);

    expect(paginatedResult).toEqual(standardResult);
  });
});
