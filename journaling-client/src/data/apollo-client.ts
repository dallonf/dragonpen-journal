import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

export const createClient = ({
  getAccessToken,
}: {
  getAccessToken: () => Promise<string>;
}) => {
  const setAuthorizationLink = setContext(async (req) => {
    return {
      headers: {
        authorization: `Bearer ${await getAccessToken()}`,
      },
    };
  });

  const httpLink = new HttpLink({
    uri: process.env.REACT_APP_GQL_URL,
  });

  const client = new ApolloClient({
    link: setAuthorizationLink.concat(httpLink),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            // Blocked by 
            // https://github.com/apollographql/apollo-client/issues/6844
            // journalEntryById: {
            //   read: (q, { args, toReference }) =>
            //     args!.id
            //       ? toReference({ __typename: 'JournalEntry', id: args!.id })
            //       : null,
            // },
          },
        },
      },
    }),
  });

  return client;
};
