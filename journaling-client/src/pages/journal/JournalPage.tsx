import React from 'react';
import { Fab, List } from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';
import * as lodash from 'lodash';
import { useHistory } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useQuery, gql } from '@apollo/client';
import { styledWithTheme } from '../../utils';
import Layout, { MainAreaContainer } from '../../framework/Layout';
import { JournalPageQuery } from '../../generated/gql-types';
import DaySection from './DaySection';
import JournalEntryListItemView from './JournalEntryListItemView';
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
    inner = (
      <List dense>
        {entries.map((x) => (
          <JournalEntryListItem key={x.id} journalEntry={x} />
        ))}
      </List>
    );
  }

  const handleAddClick = () => {
    history.push(`/edit/${uuidv4()}`);
  };

  return (
    <Layout pageTitle="Journal">
      <JournalPageMainAreaContainer maxWidth="md">
        {inner}
        {/* {lodash.range(3).map((i) => (
          <DaySection key={i} dayHeader="Monday, July 20, 2020">
            <List dense>
              {lodash.range(10).map((i) => (
                <JournalEntryListItemView key={i} id={i.toString()}>
                  <b>11:55 AM:</b> Ah, Superintendent Chalmers, welcome! I hope
                  you're prepared for an unforgettable luncheon!
                </JournalEntryListItemView>
              ))}
            </List>
          </DaySection>
        ))} */}
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
