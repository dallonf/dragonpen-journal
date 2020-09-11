import React from 'react';
import styled from '@emotion/styled/macro';
import { Button, Box, Paper, ClickAwayListener } from '@material-ui/core';
import Editor from 'rich-markdown-editor';
import * as dateFns from 'date-fns';
import { gql } from '@apollo/client';
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

interface DirtyFormState {
  timestamp?: Date;
  getText?: () => string;
}

const EditJournalEntry: React.FC<EditJournalEntryProps> = ({
  journalEntry,
  onUpdate,
  onEndEdit,
}) => {
  const [timeModalOpen, setTimeModalOpen] = React.useState(false);
  const [
    dirtyFormState,
    setDirtyFormState,
  ] = React.useState<DirtyFormState | null>(null);
  const updateDirtyFormState = (input: DirtyFormState) =>
    setDirtyFormState((prev) => ({ ...(prev ?? {}), ...input }));

  // The editor is extremely sensitive to text changes and resets
  // the cursor position, among other things, when it happens
  // So make sure the value we bind it do doesn't change unless
  // absolutely necessary (like if we start editing a different journalEntry)
  const [_stabilizedText, setStabilizedText] = React.useState<{
    id: string;
    text: string;
  }>({ id: journalEntry.id, text: journalEntry.text });
  const stabilizedText = _stabilizedText.text;
  React.useEffect(() => {
    if (journalEntry.id !== _stabilizedText.id) {
      setStabilizedText({ id: journalEntry.id, text: journalEntry.text });
    }
  }, [journalEntry, _stabilizedText]);

  React.useEffect(() => {
    if (dirtyFormState) {
      onUpdate(journalEntry.id, {
        timestamp:
          dirtyFormState?.timestamp ?? new Date(journalEntry.timestamp),
        text: dirtyFormState?.getText?.() ?? journalEntry.text,
      });
      setDirtyFormState(null);
    }
  }, [dirtyFormState, journalEntry, onUpdate]);

  const renderTimestamp =
    dirtyFormState?.timestamp ?? new Date(journalEntry.timestamp);
  const updateTimestamp = (newTimestamp: Date) =>
    updateDirtyFormState({ timestamp: newTimestamp });

  const renderText = stabilizedText;
  const updateText = (getNewText: () => string) =>
    updateDirtyFormState({ getText: getNewText });

  return (
    <ClickAwayListener onClickAway={() => onEndEdit?.()}>
      <JournalEntryPaper>
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
        <Editor
          defaultValue={renderText}
          value={renderText}
          onChange={updateText}
        />
      </JournalEntryPaper>
    </ClickAwayListener>
  );
};

export default EditJournalEntry;
