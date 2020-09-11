import React from 'react';
import styled from '@emotion/styled/macro';
import { Button, Box, Paper } from '@material-ui/core';
import Editor from 'rich-markdown-editor';
import * as dateFns from 'date-fns';
import { gql } from '@apollo/client';
import { useClickAway } from 'react-use';
import { styledWithTheme } from '../../utils';
import DateTimePickerDialog from '../../components/DateTimePickerDialog';
import { EditJournalEntryFragment } from '../../generated/gql-types';

export const EDIT_JOURNAL_ENTRY_FRAGMENT = gql`
  fragment EditJournalEntryFragment on JournalEntry {
    id
    text
    timestamp
  }
`;

export interface EditJournalEntryProps {
  journalEntry: EditJournalEntryFragment;
  onUpdate: (id: string, data: { text: string; timestamp: Date }) => void;
  onEndEdit?: () => void;
}

const JournalEntryPaper = styledWithTheme(Paper)((props) => ({
  padding: props.theme.spacing(2),
}));

const FlushButtonContainer = styledWithTheme(Box)((props) => ({
  marginLeft: -props.theme.spacing(1),
  marginRight: -props.theme.spacing(1),
}));

const ButtonWithNormalText = styled(Button)`
  text-transform: none;
`;

export interface FormState {
  timestamp: Date;
  text: string;
}

const EditJournalEntry: React.FC<EditJournalEntryProps> = ({
  journalEntry,
  onUpdate,
  onEndEdit,
}) => {
  const [timeModalOpen, setTimeModalOpen] = React.useState(false);

  const containerRef = React.useRef(null);
  useClickAway(containerRef, () => onEndEdit && onEndEdit());

  const renderTimestamp = new Date();
  const updateTimestamp = (newTimestamp: Date) => {};

  const renderText = '';
  const updateText = (getNewString: () => string) => {};

  return (
    <JournalEntryPaper ref={containerRef}>
      <FlushButtonContainer mb={2}>
        <ButtonWithNormalText onClick={() => setTimeModalOpen(true)}>
          {dateFns.format(renderTimestamp, 'PPPPp')}
        </ButtonWithNormalText>
        <DateTimePickerDialog
          open={timeModalOpen}
          onClose={(value) => {
            value && updateTimestamp(value);
            setTimeModalOpen(false);
          }}
          value={renderTimestamp}
        />
      </FlushButtonContainer>
      <Editor defaultValue={renderText} value={renderText} onChange={updateText} />
    </JournalEntryPaper>
  );
};

export default EditJournalEntry;
