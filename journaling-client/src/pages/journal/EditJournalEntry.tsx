import React from 'react';
import styled from '@emotion/styled/macro';
import { Button, Box, Paper } from '@material-ui/core';
import Editor from 'rich-markdown-editor';
import * as dateFns from 'date-fns';
import { gql, ApolloClient } from '@apollo/client';
import { useClickAway } from 'react-use';
import { styledWithTheme } from '../../utils';
import DateTimePickerDialog from '../../components/DateTimePickerDialog';
import {
  EditJournalEntryQuery,
  EditJournalEntryQueryVariables,
  EditJournalEntryFragment,
} from '../../generated/gql-types';

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

const EDIT_JOURNAL_ENTRY_QUERY = gql`
  query EditJournalEntryQuery($id: ID!) {
    journalEntryById(id: $id) {
      id
      timestamp
      text
    }
  }
`;

export const prepBlankEntry = (client: ApolloClient<unknown>, id: string) => {
  client.writeQuery<EditJournalEntryQuery, EditJournalEntryQueryVariables>({
    query: EDIT_JOURNAL_ENTRY_QUERY,
    variables: { id },
    data: {
      journalEntryById: null,
    },
  });
};

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
  initialText: string;
}

const EditJournalEntry: React.FC<EditJournalEntryProps> = ({
  journalEntry,
  onUpdate,
  onEndEdit,
}) => {
  const [formState, setFormState] = React.useState<FormState>(() => ({
    timestamp: dateFns.parseISO(journalEntry.timestamp),
    initialText: journalEntry.text,
  }));
  const [text, setText] = React.useState('');

  const [timeModalOpen, setTimeModalOpen] = React.useState(false);

  const containerRef = React.useRef(null);
  useClickAway(containerRef, () => onEndEdit && onEndEdit());

  // TODO: these update functions are not very resilient to rapid state changes
  // esp. consider React concurrent mode

  const updateTimestamp = (newTime: Date) => {
    if (!formState) return;

    const newState = {
      ...formState,
      timestamp: newTime,
    };
    setFormState(newState);

    onUpdate(journalEntry.id, {
      text,
      timestamp: newState.timestamp,
    });
  };

  const updateText = (newTextGetter: () => string) => {
    const newText = newTextGetter();
    setText(newText);

    if (!formState) return;
    onUpdate(journalEntry.id, {
      text: newText,
      timestamp: formState.timestamp,
    });
  };

  return (
    <JournalEntryPaper ref={containerRef}>
      <FlushButtonContainer mb={2}>
        <ButtonWithNormalText onClick={() => setTimeModalOpen(true)}>
          {dateFns.format(formState?.timestamp ?? new Date(), 'PPPPp')}
        </ButtonWithNormalText>
        {formState != null && (
          <DateTimePickerDialog
            open={timeModalOpen}
            onClose={(value) => {
              value && updateTimestamp(value);
              setTimeModalOpen(false);
            }}
            value={formState.timestamp}
          />
        )}
      </FlushButtonContainer>
      <Editor
        defaultValue={formState.initialText}
        value={formState.initialText}
        onChange={updateText}
      />
    </JournalEntryPaper>
  );
};

export default EditJournalEntry;
