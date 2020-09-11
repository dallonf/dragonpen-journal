import React from 'react';
import styled from '@emotion/styled/macro';
import { Button, Box, Paper, ClickAwayListener } from '@material-ui/core';
import Editor from 'rich-markdown-editor';
import * as dateFns from 'date-fns';
import { gql } from '@apollo/client';
import { useKeyPressEvent } from 'react-use';
import { styledWithTheme } from '../../utils';
import DateTimePickerDialog from '../../components/DateTimePickerDialog';
import { EditJournalEntryFragment } from '../../generated/gql-types';

const THROTTLE_TIME = 1000;

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

interface UpdateTimeout {
  timeout: NodeJS.Timeout;
  update: {
    id: string;
    payload: { text: string; timestamp: Date };
  };
}

const EditJournalEntry: React.FC<EditJournalEntryProps> = ({
  journalEntry,
  onUpdate,
  onEndEdit,
}) => {
  useKeyPressEvent('Escape', () => onEndEdit?.());

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

  const updateTimeoutRef = React.useRef<UpdateTimeout | null>(null);
  // Tear it down on unmount, or when the targeted journal entry changes
  // In the latter case, this needs to come first, so that it can use the old value of
  // updateTimeoutRef
  React.useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        const { timeout, update } = updateTimeoutRef.current;
        clearTimeout(timeout);
        onUpdate(update.id, update.payload);
        updateTimeoutRef.current = null;
      }
    };
    // This also uses onUpdate, but that callback and its dependencies unfortunately aren't stable enough
    // to list as a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journalEntry.id]);
  // Update dirty form, but on a delay
  React.useEffect(() => {
    const update = {
      id: journalEntry.id,
      payload: {
        timestamp:
          dirtyFormState?.timestamp ?? new Date(journalEntry.timestamp),
        text: dirtyFormState?.getText?.() ?? journalEntry.text,
      },
    };

    if (!updateTimeoutRef.current && dirtyFormState) {
      const timeout = setTimeout(() => {
        const { update } = updateTimeoutRef.current!;
        onUpdate(update.id, update.payload);
        setDirtyFormState(null);
        updateTimeoutRef.current = null;
      }, THROTTLE_TIME);
      updateTimeoutRef.current = {
        timeout,
        update,
      };
    } else if (updateTimeoutRef.current) {
      updateTimeoutRef.current.update = update;
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
          autoFocus={true}
        />
      </JournalEntryPaper>
    </ClickAwayListener>
  );
};

export default EditJournalEntry;
