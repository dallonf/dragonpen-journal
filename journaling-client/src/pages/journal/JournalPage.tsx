import React from 'react';
import { Fab, List, useTheme } from '@material-ui/core';
import { Add as AddIcon, Warning as WarningIcon } from '@material-ui/icons';
import * as lodash from 'lodash';
import { useHistory } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useQuery, gql } from '@apollo/client';
import * as dateFns from 'date-fns';
import { css } from '@emotion/core';
import { styledWithTheme } from '../../utils';
import Layout, { MainAreaContainer } from '../../framework/Layout';
import { JournalPageQuery } from '../../generated/gql-types';
import { prepBlankEntry as prepBlankEntryForEditPage } from '../edit/EditPage';
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
  const theme = useTheme();
  const history = useHistory();

  const { loading, error, data, client } = useQuery<JournalPageQuery>(QUERY, {
    fetchPolicy: 'network-only',
    pollInterval: 10000,
  });

  let inner;
  if (loading || error) {
    inner = null;
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
    const id = uuidv4();
    prepBlankEntryForEditPage(client, id);
    history.push(`/edit/${id}`);
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
