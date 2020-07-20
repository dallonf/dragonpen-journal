import React from 'react';
import {
  CssBaseline,
  ThemeProvider as MuiThemeProvider,
} from '@material-ui/core';
import { ThemeProvider as EmotionThemeProvider } from 'emotion-theming';
import { BrowserRouter } from 'react-router-dom';
import theme from './theme';
import Routes from './Routes';

const App: React.FC = () => (
  <MuiThemeProvider theme={theme}>
    <EmotionThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    </EmotionThemeProvider>
  </MuiThemeProvider>
);

export default App;
