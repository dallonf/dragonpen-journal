import React from 'react';
import { Fab, List } from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';
import * as lodash from 'lodash';
import { useHistory } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useQuery, gql } from '@apollo/client';
import * as dateFns from 'date-fns';
import { styledWithTheme } from '../../utils';
import Layout, { MainAreaContainer } from '../../framework/Layout';
import { JournalPageQuery } from '../../generated/gql-types';
import DaySection from './DaySection';
import JournalEntryListItem, {
  JOURNAL_ENTRY_LIST_ITEM_FRAGMENT,
} from './JournalEntryListItem';

const QUERY = gql`
  query JournalPageQuery {
    journalEntries {
      id
      ...JournalEntryListItemFragment
    }
  }
  ${JOURNAL_ENTRY_LIST_ITEM_FRAGMENT}
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

const JournalPage: React.FC = () => {
  const history = useHistory();

  const { loading, error, data } = useQuery<JournalPageQuery>(QUERY, {
    fetchPolicy: 'network-only',
  });

  let inner;
  if (loading) {
    inner = null;
  } else if (error) {
    throw error;
  } else {
    const entries = data!.journalEntries;
    const days = lodash.groupBy(entries, (x) =>
      dateFns.startOfDay(new Date(x.timestamp)).toISOString()
    );

    inner = Object.keys(days).map((day) => (
      <DaySection key={day} dayHeader={dateFns.format(new Date(day), 'PPPP')}>
        {
          <List>
            {days[day].map((x) => (
              <JournalEntryListItem key={x.id} journalEntry={x} />
            ))}
          </List>
        }
      </DaySection>
    ));
  }

  const handleAddClick = () => {
    history.push(`/edit/${uuidv4()}`);
  };

  return (
    <Layout pageTitle="Journal" loading={loading}>
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
