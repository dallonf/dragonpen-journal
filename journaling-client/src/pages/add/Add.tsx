import React from 'react';
import styled from '@emotion/styled/macro';
import { Typography, Box, AppBar, Toolbar, Container } from '@material-ui/core';
import { styledWithTheme } from '../../utils';

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

const AddPage: React.FC = () => (
  <AppBox>
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">Journal</Typography>
      </Toolbar>
    </AppBar>
    <AppBoxCell>
      <MainAreaContainer maxWidth="md">
        add
      </MainAreaContainer>
    </AppBoxCell>
  </AppBox>
);

export default AddPage;
