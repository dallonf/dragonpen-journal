import React from 'react';
import { AppBar, Typography, Toolbar, Fab, Container } from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';
import * as lodash from 'lodash';
import { styledWithTheme } from '../../utils';
import DaySection from './DaySection';
import JournalEntry from './JournalEntry';

const ActuallyFloatingActionButton = styledWithTheme(Fab)((props) => ({
  position: 'fixed',
  right: props.theme.spacing(2),
  bottom: props.theme.spacing(2),
}));

const AppContainer = styledWithTheme(Container)((props) => ({
  marginTop: props.theme.spacing(2),
  // enough space for the FAB
  marginBottom: props.theme.spacing(8),
}));

const Journal: React.FC = () => (
  <>
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">Journal</Typography>
      </Toolbar>
    </AppBar>
    <AppContainer maxWidth="md">
      {lodash.range(5).map((x) => (
        <DaySection dayHeader="Monday, July 20, 2020">
          {lodash.range(100).map((x) => (
            <JournalEntry>
              <b>11:55 AM:</b> Ah, Superintendent Chalmers, welcome! I hope
              you're prepared for an unforgettable luncheon!
            </JournalEntry>
          ))}
        </DaySection>
      ))}
    </AppContainer>
    <ActuallyFloatingActionButton color="primary" aria-label="add">
      <AddIcon />
    </ActuallyFloatingActionButton>
  </>
);

export default Journal;
