import React from 'react';
import { Fab, List, useTheme } from '@material-ui/core';
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
  EditJournalEntryMutation,
  EditJournalEntryMutationVariables,
} from '../../generated/gql-types';
import { prepBlankEntry as prepBlankEntryForEditPage } from '../edit/EditPage';
import DaySection from './DaySection';
import JournalEntryListItem, {
  JOURNAL_ENTRY_LIST_ITEM_FRAGMENT,
} from './JournalEntryListItem';
import EditJournalEntry, {
  EDIT_JOURNAL_ENTRY_FRAGMENT,
} from './EditJournalEntry';

export interface JournalPageProps {
  mode?: 'show' | 'edit';
}

interface EditPageParams {
  id?: string;
}

const QUERY = gql`
  query JournalPageQuery {
    journalEntries {
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

  const { loading, error, data, client } = useQuery<JournalPageQuery>(QUERY, {
    fetchPolicy: 'network-only',
    pollInterval: 10000,
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
    if (addingId && mode === 'edit') {
      setAddingId(null);
    }
  }, [addingId, mode]);

  let inner;
  if (loading || error) {
    inner = null;
  } else {
    let entries = data!.journalEntries;
    if (addingId) {
      entries = [
        {
          __typename: 'JournalEntry',
          id: addingId,
          text: '',
          timestamp: new Date().toISOString(),
        },
        ...entries,
      ];
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
        text: '',
        timestamp: new Date().toISOString(),
      } as const;

      if (id === addingId) {
        const latestData = client.readQuery<JournalPageQuery>({
          query: QUERY,
        })!;
        const updated: JournalPageQuery = {
          ...latestData,
          journalEntries: [optimisticNewEntry, ...latestData.journalEntries],
        };
        client.writeQuery<JournalPageQuery>({
          query: QUERY,
          data: updated,
        });
        setAddingId(null);
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

    inner = Object.keys(days).map((day) => (
      <DaySection key={day} dayHeader={dateFns.format(new Date(day), 'PPPP')}>
        {
          <List>
            {days[day].map((x) => {
              if (
                x.id === addingId ||
                (mode === 'edit' && x.id === params.id)
              ) {
                return <EditJournalEntry key={x.id} journalEntry={x} onUpdate={handleUpdate} />;
              } else {
                return <JournalEntryListItem key={x.id} journalEntry={x} />;
              }
            })}
          </List>
        }
      </DaySection>
    ));
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
