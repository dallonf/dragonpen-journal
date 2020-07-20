import React from 'react';
import { AppBar, Typography, Toolbar, Fab, Container } from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';
import { styledWithTheme } from '../../utils';
import DaySection from './DaySection';

const ActuallyFloatingActionButton = styledWithTheme(Fab)((props) => ({
  position: 'fixed',
  right: props.theme.spacing(2),
  bottom: props.theme.spacing(2),
}));

const AppContainer = styledWithTheme(Container)((props) => ({
  // enough space for the navbar
  marginTop: props.theme.spacing(8 + 2),
  // enough space for the FAB
  marginBottom: props.theme.spacing(8),
}));

const Journal: React.FC = () => (
  <>
    <AppBar position="fixed">
      <Toolbar>
        <Typography variant="h6">Journal</Typography>
      </Toolbar>
    </AppBar>
    <AppContainer maxWidth="md">
      <DaySection dayHeader="Monday, July 20, 2020">
        <b>11:55 AM:</b> Ah, Superintendent Chalmers, welcome! I hope you're
        prepared for an unforgettable luncheon!
      </DaySection>
    </AppContainer>
    <ActuallyFloatingActionButton color="primary" aria-label="add">
      <AddIcon />
    </ActuallyFloatingActionButton>
  </>
);

export default Journal;
