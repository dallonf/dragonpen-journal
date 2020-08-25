import React from 'react';
import {
  CssBaseline,
  ThemeProvider as MuiThemeProvider,
} from '@material-ui/core';
import { ThemeProvider as EmotionThemeProvider } from 'emotion-theming';
import { BrowserRouter } from 'react-router-dom';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { ApolloProvider } from '@apollo/client';
import DateFnsUtils from '@date-io/date-fns';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import theme from './theme';
import { createClient } from '../data/apollo-client';
import * as env from '../env.json';
import LoadingPlaceholder from './LoadingPlaceholderPage';

const RequireLogin: React.FC = ({ children }) => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const unauthenticated = !isAuthenticated && !isLoading;

  (globalThis as any).loginWithRedirect = loginWithRedirect;
  React.useEffect(() => {
    if (unauthenticated) {
      loginWithRedirect();
    }
  });

  if (isLoading || unauthenticated) {
    return <LoadingPlaceholder />;
  } else {
    return <>{children}</>;
  }
};

const AuthenticatedApolloProvider: React.FC = ({ children }) => {
  const { getAccessTokenSilently } = useAuth0();

  // TODO: would this create a bunch of clients if re-rendered?
  // Would anything actually cause it to re-render?
  const client = createClient({
    getAccessToken: () =>
      getAccessTokenSilently({
        audience: env.auth0ApiId,
      }),
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

const App: React.FC = ({ children }) => (
  <MuiThemeProvider theme={theme}>
    <EmotionThemeProvider theme={theme}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Auth0Provider
          domain={env.auth0Domain}
          clientId={env.auth0ClientId}
          redirectUri={window.location.origin}
          audience={env.auth0ApiId}
        >
          <RequireLogin>
            <AuthenticatedApolloProvider>
              <CssBaseline />
              <BrowserRouter>{children}</BrowserRouter>
            </AuthenticatedApolloProvider>
          </RequireLogin>
        </Auth0Provider>
      </MuiPickersUtilsProvider>
    </EmotionThemeProvider>
  </MuiThemeProvider>
);

export default App;
