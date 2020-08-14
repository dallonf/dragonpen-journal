/** @jsx jsx */
import React from 'react';
import styled from '@emotion/styled/macro';
import { jsx, css, keyframes } from '@emotion/core';
import {
  AppBar,
  Typography,
  Toolbar,
  Container,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@material-ui/core';
import {
  ArrowBack as ArrowBackIcon,
  AccountCircle as AccountCircleIcon,
  Autorenew as AutorenewIcon,
} from '@material-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { LocationDescriptor } from 'history';
import { useAuth0 } from '@auth0/auth0-react';
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

const spinAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const StyledAutorenewIcon = styledWithTheme(AutorenewIcon)(
  (props) => css`
    margin-left: ${props.theme.spacing(1)}px;
    animation: ${spinAnimation} 1.5s linear infinite;
  `
);

export const MainAreaContainer = styledWithTheme(Container)((props) => ({
  marginTop: props.theme.spacing(2),
}));

export interface LayoutProps {
  children?: React.ReactNode;
  pageTitle: React.ReactNode;
  backLink?: LocationDescriptor;
  loading?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  pageTitle,
  backLink,
  loading,
}) => {
  const { user, logout } = useAuth0();
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const open = Boolean(anchorEl);

  if (!user) {
    throw new Error('Should have been logged in to get this far');
  }

  const handleMenu: React.MouseEventHandler = (e) => {
    setAnchorEl(e.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
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
          {loading && <StyledAutorenewIcon aria-label="loading..." />}
          <Box
            css={css`
              flex-grow: 1;
            `}
          />
          <Box>
            <IconButton
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircleIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted={true}
              open={open}
              onClose={handleCloseMenu}
            >
              <MenuItem>{user.name}</MenuItem>
              <MenuItem onClick={() => logout()}>Log out</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <AppBoxCell>{children}</AppBoxCell>
    </AppBox>
  );
};

export default Layout;
