import React from 'react';
import {
  AppBar,
  Typography,
  Toolbar,
  Fab,
  Container,
  Box,
} from '@material-ui/core';
import styled from '@emotion/styled/macro';
import { Add as AddIcon } from '@material-ui/icons';
import * as lodash from 'lodash';
import { useHistory } from 'react-router-dom';
import { styledWithTheme } from '../../utils';
import DaySection from './DaySection';
import JournalEntry from './JournalEntry';

const AppBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
});

const AppBoxCell = styled(Box)({
  position: 'relative',
  flex: 1,
  overflowY: 'auto',
});

const MainAreaContainer = styledWithTheme(Container)((props) => ({
  marginTop: props.theme.spacing(2),
  // enough space for the FAB
  marginBottom: props.theme.spacing(8),
}));

const ActuallyFloatingActionButton = styledWithTheme(Fab)((props) => ({
  position: 'fixed',
  right: props.theme.spacing(2),
  bottom: props.theme.spacing(2),
}));

const JournalPage: React.FC = () => {
  const history = useHistory();

  // TODO: Replace with React Router Link?
  const handleAddClick = () => {
    history.push('/add');
  };

  return (
    <AppBox>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Journal</Typography>
        </Toolbar>
      </AppBar>
      <AppBoxCell>
        <MainAreaContainer maxWidth="md">
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
          <ActuallyFloatingActionButton
            color="primary"
            aria-label="add"
            onClick={handleAddClick}
          >
            <AddIcon />
          </ActuallyFloatingActionButton>
        </MainAreaContainer>
      </AppBoxCell>
    </AppBox>
  );
};

export default JournalPage;
