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
`;

const JournalList = <TEntry extends JournalEntryListItemFragment>({
  days,
  isEditing,
  renderEditing,
  windowSize = 3,
}: JournalListProps<TEntry>) => {
  const [endIndex, setEndIndex] = React.useState(windowSize);

  const daysForRef = React.useRef<WeakMap<HTMLElement, Date>>(new WeakMap());

  const olderEntriesRef = React.useRef<HTMLElement | null>(null);
  const handleIntersection = React.useCallback(() => {
    setEndIndex((x) => x + windowSize);
  }, [windowSize]);
  const handleIntersectionRef = React.useRef(handleIntersection);
  React.useEffect(() => {
    handleIntersectionRef.current = handleIntersection;
  }, [handleIntersection]);
  // TODO: useMemo isn't semantically appropriate for this
  const intersectionObserver = React.useMemo(
    () =>
      new window.IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            handleIntersectionRef.current();
          }
        },
        {
          threshold: 0,
        }
      ),
    []
  );
  const daysWindow = days.slice(0, endIndex);

  const olderEntriesRefCallback = (el: HTMLElement | null) => {
    if (olderEntriesRef.current) {
      intersectionObserver.unobserve(olderEntriesRef.current);
    }
    if (el) {
      intersectionObserver.observe(el);
    }
    olderEntriesRef.current = el;
  };

  const daysForRefCallback = (day: Date) => (el: HTMLElement) => {
    if (el) {
      daysForRef.current.set(el, day);
      console.log(daysForRef);
    }
  };

  return (
    <>
      {daysWindow.map(({ day, entries }) => (
        <DaySection
          key={day.getTime()}
          dayHeader={dateFns.format(day, 'PPPP')}
          ref={daysForRefCallback(day)}
        >
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
