import React from 'react';
import { AppBar, Typography, Toolbar, Fab } from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';
import { styled } from '../utils';

const ActuallyFloatingActionButton = styled(Fab)((props) => ({
  position: 'absolute',
  right: props.theme.spacing(2),
  bottom: props.theme.spacing(2),
}));

const Journal: React.FC = () => (
  <>
    <AppBar position="fixed">
      <Toolbar>
        <Typography variant="h6">Journal</Typography>
      </Toolbar>
    </AppBar>
    <ActuallyFloatingActionButton color="primary" aria-label="add">
      <AddIcon />
    </ActuallyFloatingActionButton>
  </>
);

export default Journal;
