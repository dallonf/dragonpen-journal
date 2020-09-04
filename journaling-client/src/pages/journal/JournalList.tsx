import React from 'react';
import * as dateFns from 'date-fns';
import { List } from '@material-ui/core';
import DaySection from './DaySection';
import JournalEntryListItem, {
  JOURNAL_ENTRY_LIST_ITEM_FRAGMENT,
} from './JournalEntryListItem';
import { JournalEntryListItemFragment } from '../../generated/gql-types';

export { JOURNAL_ENTRY_LIST_ITEM_FRAGMENT };
export interface JournalListProps<TEntry extends JournalEntryListItemFragment> {
  days: {
    day: Date;
    entries: TEntry[];
  }[];
  isEditing: (id: string) => boolean;
  renderEditing: (entry: TEntry) => React.ReactNode;
}

const JournalList = <TEntry extends JournalEntryListItemFragment>({
  days,
  isEditing,
  renderEditing,
}: JournalListProps<TEntry>) => {
  return (
    <>
      {days.map(({ day, entries }) => (
        <DaySection key={day.getTime()} dayHeader={dateFns.format(day, 'PPPP')}>
          {
            <List>
              {entries.map((x) => {
                if (isEditing(x.id)) {
                  return (
                    <React.Fragment key={x.id}>
                      {renderEditing(x)}
                    </React.Fragment>
                  );
                } else {
                  return <JournalEntryListItem key={x.id} journalEntry={x} />;
                }
              })}
            </List>
          }
        </DaySection>
      ))}
    </>
  );
};

export default JournalList;
