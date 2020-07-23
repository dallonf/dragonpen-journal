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
import theme from './theme';
import { client } from '../data/apollo-client';

const App: React.FC = ({ children }) => (
  <MuiThemeProvider theme={theme}>
    <EmotionThemeProvider theme={theme}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <ApolloProvider client={client}>
          <CssBaseline />
          <BrowserRouter>{children}</BrowserRouter>
        </ApolloProvider>
      </MuiPickersUtilsProvider>
    </EmotionThemeProvider>
  </MuiThemeProvider>
);

export default App;
