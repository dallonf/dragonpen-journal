import React from 'react';
import {
  CssBaseline,
  ThemeProvider as MuiThemeProvider,
} from '@material-ui/core';
import { ThemeProvider as EmotionThemeProvider } from 'emotion-theming';
import { BrowserRouter } from 'react-router-dom';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import theme from './theme';
import Routes from './Routes';

const App: React.FC = () => (
  <MuiThemeProvider theme={theme}>
    <EmotionThemeProvider theme={theme}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <CssBaseline />
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </MuiPickersUtilsProvider>
    </EmotionThemeProvider>
  </MuiThemeProvider>
);

export default App;
