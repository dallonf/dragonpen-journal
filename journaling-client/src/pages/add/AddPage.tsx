import React from 'react';
import styled from '@emotion/styled/macro';
import {
  Typography,
  Box,
  AppBar,
  Toolbar,
  Container,
  useTheme,
  Button,
  IconButton,
} from '@material-ui/core';
import { ArrowBack as ArrowBackIcon } from '@material-ui/icons';
import Editor from 'rich-markdown-editor';
import { format } from 'date-fns';
import { Link as RouterLink } from 'react-router-dom';
import { styledWithTheme } from '../../utils';
import DateTimePickerDialog from './DateTimePickerDialog';

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

const FlushButtonContainer = styledWithTheme(Box)((props) => ({
  marginLeft: -props.theme.spacing(1),
  marginRight: -props.theme.spacing(1),
}));

const ButtonWithNormalText = styled(Button)`
  text-transform: none;
`;

const AddPage: React.FC = () => {
  const theme = useTheme();
  const [_body, setBody] = React.useState('');
  const [time, setTime] = React.useState(new Date());
  const [timeModalOpen, setTimeModalOpen] = React.useState(false);

  return (
    <AppBox>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            aria-label="back"
            color="inherit"
            component={RouterLink}
            to="/"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">Add Entry</Typography>
        </Toolbar>
      </AppBar>
      <AppBoxCell>
        <MainAreaContainer maxWidth="md">
          <FlushButtonContainer mb={2}>
            <ButtonWithNormalText onClick={() => setTimeModalOpen(true)}>
              {format(time, 'PPPPp')}
            </ButtonWithNormalText>
            <DateTimePickerDialog
              open={timeModalOpen}
              onClose={(value) => {
                value && setTime(value);
                setTimeModalOpen(false);
              }}
              value={time}
            />
          </FlushButtonContainer>
          <Editor
            defaultValue={''}
            onChange={setBody}
            style={{ background: theme.palette.background.default }}
          />
        </MainAreaContainer>
      </AppBoxCell>
    </AppBox>
  );
};

export default AddPage;
