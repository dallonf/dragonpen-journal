import React from 'react';
import * as dateFns from 'date-fns';
import { List } from '@material-ui/core';
import styled from '@emotion/styled/macro';
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

  windowSize?: number;
}

const OlderEntriesPlaceholder = styled.div`
  height: 1px;
  background: tomato;
`;

const JournalList = <TEntry extends JournalEntryListItemFragment>({
  days,
  isEditing,
  renderEditing,
  windowSize = 3,
}: JournalListProps<TEntry>) => {
  const olderEntriesRef = React.useRef<HTMLElement | null>(null);
  const intersectionObserver = React.useMemo(
    () =>
      new window.IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            console.log('intersection!', entries);
          }
        },
        {
          threshold: 0,
        }
      ),
    []
  );
  const daysWindow = days.slice(0, windowSize);

  const olderEntriesRefCallback = (el: HTMLElement) => {
    if (olderEntriesRef.current) {
      intersectionObserver.unobserve(olderEntriesRef.current);
    }
    if (el) {
      intersectionObserver.observe(el);
    }
    olderEntriesRef.current = el;
  };

  return (
    <>
      {daysWindow.map(({ day, entries }) => (
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
      <OlderEntriesPlaceholder ref={olderEntriesRefCallback} />
    </>
  );
};

export default JournalList;
