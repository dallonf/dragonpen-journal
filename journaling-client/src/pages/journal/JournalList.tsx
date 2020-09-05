import React from 'react';
import * as dateFns from 'date-fns';
import { List } from '@material-ui/core';
import styled from '@emotion/styled/macro';
import immer, { Draft as ImmerDraft } from 'immer';
import * as lodash from 'lodash';
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

type ScalarKey = string | number;

const useElementList = <TKey extends ScalarKey>({
  onElementAdded,
  onElementRemoved,
}: {
  /** This callback must be stable across renders (see useCallback) to avoid infinite loops */
  onElementAdded?: (ref: HTMLElement, key: TKey) => void;
  /** This callback must be stable across renders (see useCallback) to avoid infinite loops */
  onElementRemoved?: (ref: HTMLElement, key: TKey) => void;
}) => {
  const elementToKeyMap = React.useRef(new Map<HTMLElement, TKey>());
  const keyToElementMap = React.useRef(new Map<TKey, HTMLElement>());

  const refCallbackForKey = React.useMemo(() => {
    const memoMap = new Map<TKey, (el: HTMLElement | null) => void>();
    const makeRefCallbackForKey = (key: TKey) => (el: HTMLElement | null) => {
      const prevEl = keyToElementMap.current.get(key);
      if (prevEl && el !== prevEl) {
        keyToElementMap.current.delete(key);
        elementToKeyMap.current.delete(prevEl);
        onElementRemoved && onElementRemoved(prevEl, key);
      }
      if (el && el !== prevEl) {
        elementToKeyMap.current.set(el, key);
        keyToElementMap.current.set(key, el);
        onElementAdded && onElementAdded(el, key);
      }
    };
    return (key: TKey) => {
      let fn = memoMap.get(key);
      if (!fn) {
        fn = makeRefCallbackForKey(key);
        memoMap.set(key, fn);
      }
      return fn;
    };
  }, [onElementAdded, onElementRemoved]);

  const getKeyForElement = (element: HTMLElement): TKey | null => {
    return elementToKeyMap.current.get(element) ?? null;
  };
  return { refCallbackForKey, getKeyForElement };
};

const useCallbackRef = <T extends unknown>(fn: T) => {
  const ref = React.useRef(fn);
  React.useEffect(() => {
    ref.current = fn;
  }, [fn]);
  return { ref, fn };
};

const useVisibleElements = <TKey extends ScalarKey>({
  keys,
}: {
  keys: TKey[];
}) => {
  const [visibleMap, setVisibleMap] = React.useState(new Map<TKey, boolean>());

  const { ref: handleIntersection } = useCallbackRef(
    (entry: IntersectionObserverEntry) => {
      const key = getKeyForElement(entry.target as HTMLElement);
      if (key) {
        setVisibleMap((prev) =>
          immer(prev, (draft) => {
            draft.set(key as ImmerDraft<TKey>, entry.isIntersecting);
          })
        );
      }
    }
  );

  // TODO: useMemo isn't semantically appropriate for this
  const intersectionObserver = React.useMemo(
    () =>
      new window.IntersectionObserver(
        (entries) => {
          entries.forEach(handleIntersection.current);
        },
        {
          threshold: 0,
        }
      ),
    [handleIntersection]
  );

  const { refCallbackForKey, getKeyForElement } = useElementList({
    onElementAdded: React.useCallback(
      (ref, key) => {
        intersectionObserver.observe(ref);
      },
      [intersectionObserver]
    ),
    onElementRemoved: React.useCallback(
      (ref, key) => {
        intersectionObserver.unobserve(ref);
        setVisibleMap((prev) =>
          immer(prev, (draft) => {
            draft.delete(key as ImmerDraft<TKey>);
          })
        );
      },
      [intersectionObserver]
    ),
  });

  return {
    refCallbackForKey,
    visibleElementKeys: keys.filter((x) => {
      return visibleMap.has(x) && visibleMap.get(x);
    }),
  };
};

const JournalList = <TEntry extends JournalEntryListItemFragment>({
  days,
  isEditing,
  renderEditing,
  windowSize = 3,
}: JournalListProps<TEntry>) => {
  const [endIndex, setEndIndex] = React.useState(windowSize);

  const olderEntriesRef = React.useRef<HTMLElement | null>(null);
  const handleIntersection = React.useCallback(() => {
    // setEndIndex((x) => x + windowSize);
  }, []);
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

  const dayKeys = days.map((x) => x.day.getTime());
  const { refCallbackForKey, visibleElementKeys } = useVisibleElements({
    keys: dayKeys,
  });

  console.log(
    'visibleElementKeys',
    visibleElementKeys.map((x) => new Date(x))
  );
  const lastVisibleDate = visibleElementKeys[visibleElementKeys.length - 1];
  const lastVisibleIndex = (() => {
    if (!lastVisibleDate) return 0;

    for (let index = 0; index < days.length; index++) {
      const day = days[index];
      if (day.day.getTime() < lastVisibleDate) {
        return index - 1;
      }
    }
    return days.length - 1;
  })();

  const daysWindow = days.slice(0, lastVisibleIndex + windowSize);

  const olderEntriesRefCallback = (el: HTMLElement | null) => {
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
        <DaySection
          key={day.getTime()}
          dayHeader={dateFns.format(day, 'PPPP')}
          ref={refCallbackForKey(day.getTime())}
        >
          <List>
            {entries.map((x) => {
              if (isEditing(x.id)) {
                return (
                  <React.Fragment key={x.id}>{renderEditing(x)}</React.Fragment>
                );
              } else {
                return <JournalEntryListItem key={x.id} journalEntry={x} />;
              }
            })}
          </List>
        </DaySection>
      ))}
      <OlderEntriesPlaceholder ref={olderEntriesRefCallback} />
    </>
  );
};

export default JournalList;
