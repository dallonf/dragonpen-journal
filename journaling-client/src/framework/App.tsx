import React from 'react';
import {
  CssBaseline,
  ThemeProvider as MuiThemeProvider,
  createMuiTheme,
} from '@material-ui/core';
import { ThemeProvider as EmotionThemeProvider } from 'emotion-theming';
import Journal from '../pages/Journal';
import theme from './theme';

const App: React.FC = () => (
  <MuiThemeProvider theme={theme}>
    <EmotionThemeProvider theme={theme}>
      <CssBaseline />
      <Journal />
    </EmotionThemeProvider>
  </MuiThemeProvider>
);

export default App;
