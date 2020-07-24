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
    return null;
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
        audience: process.env.REACT_APP_AUTH0_API_ID,
      }),
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

const App: React.FC = ({ children }) => (
  <MuiThemeProvider theme={theme}>
    <EmotionThemeProvider theme={theme}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Auth0Provider
          domain={process.env.REACT_APP_AUTH0_DOMAIN}
          clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
          redirectUri={window.location.origin}
          audience={process.env.REACT_APP_AUTH0_API_ID}
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
