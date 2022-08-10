import React from 'react';
import { gql } from '@apollo/client';
import * as dateFns from 'date-fns';
import * as lodash from 'lodash';
import { JournalEntryListItemFragmentFragment } from '../../generated/gql-types';
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
  journalEntry: JournalEntryListItemFragmentFragment;
}

const JournalEntryListItem: React.FC<Props> = React.memo(({ journalEntry }) => {
  return (
    <JournalEntryListItemView id={journalEntry.id}>
      <Markdown
        disallowedTypes={['link']}
        unwrapDisallowed={true}
        // Replacing some of the weird slashes inserted by the weird Markdown editor
        // TODO: also don't love this approach of adding the date - I think it creates a bug where the first item could be messed up
        source={
          `**${dateFns.format(new Date(journalEntry.timestamp), 'p')}**: ` +
          journalEntry.text.replace(/\n\\\n/g, '\n')
        }
      />
    </JournalEntryListItemView>
  );
}, lodash.isEqual);

export default JournalEntryListItem;
