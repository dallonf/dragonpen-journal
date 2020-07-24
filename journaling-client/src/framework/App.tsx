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
import { client } from '../data/apollo-client';

const RequireLogin: React.FC = ({ children }) => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const unauthenticated = !isAuthenticated && !isLoading;

  (globalThis as any).loginWithRedirect = loginWithRedirect;
  React.useEffect(() => {
    if (unauthenticated) {
      loginWithRedirect();
    }
  });

  if (isLoading) {
    return null;
  } else {
    return <>{children}</>;
  }
};

const App: React.FC = ({ children }) => (
  <MuiThemeProvider theme={theme}>
    <EmotionThemeProvider theme={theme}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Auth0Provider
          domain={process.env.REACT_APP_AUTH0_DOMAIN}
          clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
          redirectUri={window.location.origin}
        >
          <ApolloProvider client={client}>
            <RequireLogin>
              <CssBaseline />
              <BrowserRouter>{children}</BrowserRouter>
            </RequireLogin>
          </ApolloProvider>
        </Auth0Provider>
      </MuiPickersUtilsProvider>
    </EmotionThemeProvider>
  </MuiThemeProvider>
);

export default App;
