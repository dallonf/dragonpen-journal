import React from 'react';
import styled from '@emotion/styled/macro';
import {
  AppBar,
  Typography,
  Toolbar,
  Container,
  Box,
  IconButton,
} from '@material-ui/core';
import { ArrowBack as ArrowBackIcon } from '@material-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { LocationDescriptor } from 'history';
import { styledWithTheme } from '../utils';

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

export const MainAreaContainer = styledWithTheme(Container)((props) => ({
  marginTop: props.theme.spacing(2),
}));

export interface LayoutProps {
  children?: React.ReactNode;
  pageTitle: React.ReactNode;
  backLink?: LocationDescriptor;
}

const Layout: React.FC<LayoutProps> = ({ children, pageTitle, backLink }) => (
  <AppBox>
    <AppBar position="static">
      <Toolbar>
        {backLink && (
          <IconButton
            edge="start"
            aria-label="back"
            color="inherit"
            component={RouterLink}
            to={backLink}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography variant="h6">{pageTitle}</Typography>
      </Toolbar>
    </AppBar>
    <AppBoxCell>{children}</AppBoxCell>
  </AppBox>
);

export default Layout;
