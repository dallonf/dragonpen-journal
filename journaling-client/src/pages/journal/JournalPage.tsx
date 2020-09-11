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
  JournalPageEditingExistsQuery,
  JournalPageEditingExistsQueryVariables,
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
  query JournalPageQuery($limit: Int!, $after: String, $editingId: ID) {
    journalEntries(limit: $limit, after: $after) {
      id
      ...JournalEntryListItemFragment
      ...EditJournalEntryFragment
    }
    editingEntry: journalEntryById(id: $editingId) {
      id
    }
  }
  ${JOURNAL_ENTRY_LIST_ITEM_FRAGMENT}
  ${EDIT_JOURNAL_ENTRY_FRAGMENT}
`;

const EDITING_EXISTS_QUERY = gql`
  query JournalPageEditingExistsQuery($id: ID) {
    journalEntryById(id: $id) {
      id
    }
  }
`;

const EDIT_MUTATION = gql`
  mutation EditJournalEntryMutation($input: JournalEntrySaveInput!) {
    journalEntrySave(input: $input) {
      success
      journalEntry {
        id
        ...JournalEntryListItemFragment
        ...EditJournalEntryFragment
      }
    }
  }
  ${JOURNAL_ENTRY_LIST_ITEM_FRAGMENT}
  ${EDIT_JOURNAL_ENTRY_FRAGMENT}
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
  const [atBeginning, setAtBeginning] = React.useState(false);

  const editingId = (mode === 'edit' && params.id) || null;

  const { loading, error, data, fetchMore, client } = useQuery<
    JournalPageQuery,
    JournalPageQueryVariables
  >(QUERY, {
    fetchPolicy: 'network-only',
    variables: { limit: PAGE_SIZE, editingId },
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

  const handleUpdate = React.useCallback(
    (id: string, data: { text: string; timestamp: Date }) => {
      const optimisticNewEntry = {
        __typename: 'JournalEntry',
        id,
        text: data.text,
        timestamp: data.timestamp.toISOString(),
      } as const;

      const variables = { limit: 1, after: null };
      const currentData = client.readQuery<
        JournalPageQuery,
        JournalPageQueryVariables
      >({
        query: QUERY,
        variables,
      });
      if (currentData) {
        if (
          !currentData.journalEntries.some(
            (x) => x.id === optimisticNewEntry.id
          )
        ) {
          client.writeQuery<JournalPageQuery, JournalPageQueryVariables>({
            query: QUERY,
            variables,
            data: {
              ...currentData,
              journalEntries: [
                optimisticNewEntry,
                ...currentData.journalEntries,
              ],
            },
          });
        }
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
      }).then((result) => {
        if (result.data && result.data.journalEntrySave.success) {
          const newEntry = result.data.journalEntrySave.journalEntry!;
          const variables = { limit: 1, after: null };
          const currentData = client.readQuery<
            JournalPageQuery,
            JournalPageQueryVariables
          >({
            query: QUERY,
            variables,
          });
          if (currentData) {
            if (!currentData.journalEntries.some((x) => x.id === newEntry.id)) {
              client.writeQuery<JournalPageQuery, JournalPageQueryVariables>({
                query: QUERY,
                variables,
                data: {
                  ...currentData,
                  journalEntries: [newEntry, ...currentData.journalEntries],
                },
              });
            }
          } else {
            fetchMore({});
          }
        }
      });
    },
    [client, mutate, fetchMore]
  );

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
    if (editingId) {
      const isMockEntryNeeded = !data!.editingEntry && !entries.some(x => x.id === editingId);
      if (isMockEntryNeeded) {
        const mockAddingEntry = {
          __typename: 'JournalEntry',
          id: editingId,
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

    const handleEndEdit = () => {
      if (mode === 'edit') {
        history.push('/');
      }
    };

    inner = (
      <JournalList
        days={Object.entries(days).map(([k, v]) => ({
          day: new Date(k),
          entries: v,
        }))}
        isEditing={(id) => id === editingId}
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
    client.writeQuery<
      JournalPageEditingExistsQuery,
      JournalPageEditingExistsQueryVariables
    >({
      query: EDITING_EXISTS_QUERY,
      variables: { id },
      data: { journalEntryById: null },
    });
    history.push(`/edit/${id}`);
  };

  const handleReload = () => {
    setAtBeginning(false);
    client.cache.modify({
      id: 'ROOT_QUERY',
      fields: {
        journalEntries: (e, { DELETE }) => {
          return DELETE;
        },
      },
    });
    fetchMore({});
  };

  return (
    <Layout
      pageTitle="Journal"
      loading={loading}
      onReload={() => {
        handleReload();
      }}
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
