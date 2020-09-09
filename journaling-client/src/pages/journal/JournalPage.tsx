import React from 'react';
import { Fab, useTheme } from '@material-ui/core';
import { Add as AddIcon, Warning as WarningIcon } from '@material-ui/icons';
import * as lodash from 'lodash';
import { useHistory, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useQuery, gql, useMutation } from '@apollo/client';
import * as dateFns from 'date-fns';
import { styledWithTheme } from '../../utils';
import Layout, { MainAreaContainer } from '../../framework/Layout';
import {
  JournalPageQuery,
  JournalPageQueryVariables,
  EditJournalEntryMutation,
  EditJournalEntryMutationVariables,
} from '../../generated/gql-types';
import EditJournalEntry, {
  EDIT_JOURNAL_ENTRY_FRAGMENT,
} from './EditJournalEntry';
import JournalList, { JOURNAL_ENTRY_LIST_ITEM_FRAGMENT } from './JournalList';

const PAGE_SIZE = 50;

export interface JournalPageProps {
  mode?: 'show' | 'edit';
}

interface EditPageParams {
  id?: string;
}

const QUERY = gql`
  query JournalPageQuery($limit: Int!, $after: String) {
    journalEntries(limit: $limit, after: $after) {
      id
      ...JournalEntryListItemFragment
      ...EditJournalEntryFragment
    }
  }
  ${JOURNAL_ENTRY_LIST_ITEM_FRAGMENT}
  ${EDIT_JOURNAL_ENTRY_FRAGMENT}
`;

const EDIT_MUTATION = gql`
  mutation EditJournalEntryMutation($input: JournalEntrySaveInput!) {
    journalEntrySave(input: $input) {
      success
      journalEntry {
        id
        timestamp
        text
      }
    }
  }
`;

const JournalPageMainAreaContainer = styledWithTheme(MainAreaContainer)(
  (props) => ({
    //  enough space for the FAB
    marginBottom: props.theme.spacing(8),
  })
);

const ActuallyFloatingActionButton = styledWithTheme(Fab)((props) => ({
  position: 'fixed',
  right: props.theme.spacing(2),
  bottom: props.theme.spacing(2),
}));

const JournalPage: React.FC<JournalPageProps> = ({ mode = 'show' }) => {
  const params = useParams<EditPageParams>();
  const theme = useTheme();
  const history = useHistory();
  const [addingId, setAddingId] = React.useState<string | null>(null);
  const [atBeginning, setAtBeginning] = React.useState(false);

  const { loading, error, data, fetchMore } = useQuery<
    JournalPageQuery,
    JournalPageQueryVariables
  >(QUERY, {
    fetchPolicy: 'network-only',
    variables: { limit: PAGE_SIZE },
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  const [mutate] = useMutation<
    EditJournalEntryMutation,
    EditJournalEntryMutationVariables
  >(EDIT_MUTATION);

  React.useEffect(() => {
    if (mode === 'edit' && !params.id) {
      history.replace('/');
    }
  }, [mode, params.id, history]);

  React.useEffect(() => {
    // This works around a bug where canceling edit mode after saving some edits would still have you
    // editing - because it's the adding entry
    if (data?.journalEntries?.some?.((x) => x.id === addingId)) {
      setAddingId(null);
    }
  }, [data, addingId]);

  const handleScrollToEnd = () => {
    const lastEntry = data?.journalEntries[data.journalEntries.length - 1];

    if (!atBeginning) {
      fetchMore({
        variables: { after: lastEntry?.timestamp },
      }).then((x) => {
        if (x.data?.journalEntries.length === 0) {
          setAtBeginning(true);
        }
      });
    }
  };

  let inner;
  if (!data || error) {
    inner = null;
  } else {
    let entries = data!.journalEntries;
    if (addingId) {
      const isMockEntryNeeded = !entries.some((x) => x.id === addingId);
      if (isMockEntryNeeded) {
        const mockAddingEntry = {
          __typename: 'JournalEntry',
          id: addingId,
          text: '',
          timestamp: new Date().toISOString(),
        } as const;
        entries = [...entries];
        // Reverse the array to satisfy sortedIndexBy's assumptions of an ascending sort
        entries.reverse();
        const index = lodash.sortedIndexBy(
          entries,
          mockAddingEntry,
          (x) => x.timestamp
        );
        entries.splice(index, 0, mockAddingEntry);
        entries.reverse();
      }
    }
    const days = lodash.groupBy(entries, (x) =>
      dateFns.startOfDay(new Date(x.timestamp)).toISOString()
    );

    const handleUpdate = (
      id: string,
      data: { text: string; timestamp: Date }
    ) => {
      const optimisticNewEntry = {
        __typename: 'JournalEntry',
        id,
        text: data.text,
        timestamp: data.timestamp.toISOString(),
      } as const;

      if (id === addingId) {
        history.replace(`/edit/${addingId}`);
      }

      mutate({
        variables: {
          input: {
            id,
            text: data.text,
            timestamp: data.timestamp.toISOString(),
          },
        },
        optimisticResponse: {
          journalEntrySave: {
            __typename: 'JournalEntrySaveResponse',
            success: true,
            journalEntry: optimisticNewEntry,
          },
        },
      });
    };

    const handleEndEdit = () => {
      if (mode === 'edit') {
        history.push('/');
      } else if (setAddingId) {
        setAddingId(null);
      }
    };

    inner = (
      <JournalList
        days={Object.entries(days).map(([k, v]) => ({
          day: new Date(k),
          entries: v,
        }))}
        isEditing={(id) =>
          (mode === 'show' && id === addingId) ||
          (mode === 'edit' && id === params.id)
        }
        renderEditing={(x) => (
          <EditJournalEntry
            journalEntry={x}
            onUpdate={handleUpdate}
            onEndEdit={handleEndEdit}
          />
        )}
        onScrollToEnd={handleScrollToEnd}
      />
    );
  }

  const handleAddClick = () => {
    const id = uuidv4();
    setAddingId(id);
    history.push(`/`);
  };

  return (
    <Layout
      pageTitle="Journal"
      loading={loading}
      leftExtras={
        error ? <WarningIcon style={{ marginLeft: theme.spacing(1) }} /> : null
      }
    >
      <JournalPageMainAreaContainer maxWidth="md">
        {inner}
        <ActuallyFloatingActionButton
          color="primary"
          aria-label="add"
          onClick={handleAddClick}
        >
          <AddIcon />
        </ActuallyFloatingActionButton>
      </JournalPageMainAreaContainer>
    </Layout>
  );
};

export default JournalPage;
