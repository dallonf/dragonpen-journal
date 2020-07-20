import React from 'react';
import { Box } from '@material-ui/core';
import { styledWithTheme } from '../../utils';

const JournalEntryBox = styledWithTheme(Box)((props) => ({
  marginTop: props.theme.spacing(1),
  marginBottom: props.theme.spacing(1),
}));

const JournalEntry: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => <JournalEntryBox>{children}</JournalEntryBox>;

export default JournalEntry;
