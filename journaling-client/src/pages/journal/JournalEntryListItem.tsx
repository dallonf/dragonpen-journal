import React from 'react';
import { gql } from '@apollo/client';
import * as dateFns from 'date-fns';
import { JournalEntryListItemFragment } from '../../generated/gql-types';
import JournalEntryListItemView from './JournalEntryListItemView';
import Markdown from 'react-markdown';

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
      {/* Replacing some of the weird slashes inserted by the weird Markdown editor */}
      <Markdown
        disallowedTypes={['link']}
        unwrapDisallowed={true}
        source={journalEntry.text.replace(/\n\\\n/g, '\n')}
      />
    </JournalEntryListItemView>
  );
};

export default JournalEntryListItem;
