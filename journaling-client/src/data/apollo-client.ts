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
    uri: 'http://localhost:4000/graphql',
  });

  const client = new ApolloClient({
    link: setAuthorizationLink.concat(httpLink),
    cache: new InMemoryCache(),
  });

  return client;
};
