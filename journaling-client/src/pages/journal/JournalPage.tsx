import React from 'react';
import { Fab, List } from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';
import * as lodash from 'lodash';
import { useHistory } from 'react-router-dom';
import { styledWithTheme } from '../../utils';
import Layout, { MainAreaContainer } from '../../framework/Layout';
import DaySection from './DaySection';
import JournalEntryListItem from './JournalEntryListItem';

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

  // TODO: Replace with React Router Link?
  const handleAddClick = () => {
    history.push('/add');
  };

  return (
    <Layout pageTitle="Journal">
      <JournalPageMainAreaContainer maxWidth="md">
        {lodash.range(3).map((i) => (
          <DaySection key={i} dayHeader="Monday, July 20, 2020">
            <List dense>
              {lodash.range(10).map((i) => (
                <JournalEntryListItem key={i}>
                  <b>11:55 AM:</b> Ah, Superintendent Chalmers, welcome! I hope
                  you're prepared for an unforgettable luncheon!
                </JournalEntryListItem>
              ))}
            </List>
          </DaySection>
        ))}
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
