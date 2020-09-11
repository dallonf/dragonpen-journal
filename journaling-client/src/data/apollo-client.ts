import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import * as env from '../env.json';
import typePolicies from './typePolicies';

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
    uri: process.env.NODE_ENV === 'development' ? '/graphql' : env.gqlUrl,
  });

  const client = new ApolloClient({
    link: setAuthorizationLink.concat(httpLink),
    cache: new InMemoryCache({
      typePolicies,
    }),
  });

  return client;
};
