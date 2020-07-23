import React from 'react';
import { gql } from '@apollo/client';
import * as dateFns from 'date-fns';
import { JournalEntryListItemFragment } from '../../generated/gql-types';
import JournalEntryListItemView from './JournalEntryListItemView';

export const JOURNAL_ENTRY_LIST_ITEM_FRAGMENT = gql`
  fragment JournalEntryListItemFragment on JournalEntry {
    id
    text
    timestamp
  }
`;

export interface Props {
  journalEntry: JournalEntryListItemFragment;
}

const JournalEntryListItem: React.FC<Props> = ({ journalEntry }) => {
  return (
    <JournalEntryListItemView id={journalEntry.id}>
      <b>{dateFns.format(new Date(journalEntry.timestamp), 'p')}: </b>{' '}
      {journalEntry.text}
    </JournalEntryListItemView>
  );
};

export default JournalEntryListItem;
