import React from 'react';
import * as dateFns from 'date-fns';
import { List } from '@material-ui/core';
import immer, { Draft as ImmerDraft } from 'immer';
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

type ScalarKey = string | number;

const useCallbackRef = <T extends unknown>(fn: T) => {
  const ref = React.useRef(fn);
  React.useEffect(() => {
    ref.current = fn;
  }, [fn]);
  return { ref, fn };
};

const useInitRef = <T extends unknown>(
  /** This must be stable across renders to avoid resetting the ref prematurely */
  init: () => T,
  /** This must be stable across renders to avoid resetting the ref prematurely */
  teardown?: (value: T) => void
): React.MutableRefObject<T> => {
  const prevInit = React.useRef<(() => T) | null>(null);
  const ref = React.useRef<T | null>(null);
  if (init !== prevInit.current) {
    ref.current = init();
  }
  prevInit.current = init;

  React.useEffect(() => {
    return () => teardown?.(ref.current!);
  }, [init, teardown]);
  return React.useMemo(
    () => ({
      get current() {
        return ref.current!;
      },
    }),
    []
  );
};

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

  const intersectionObserver = useInitRef(
    React.useCallback(
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
    )
  );

  const { refCallbackForKey, getKeyForElement } = useElementList({
    onElementAdded: React.useCallback(
      (ref, key) => {
        intersectionObserver.current.observe(ref);
      },
      [intersectionObserver]
    ),
    onElementRemoved: React.useCallback(
      (ref, key) => {
        intersectionObserver.current.unobserve(ref);
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
  const dayKeys = days.map((x) => x.day.getTime());
  const { refCallbackForKey, visibleElementKeys } = useVisibleElements({
    keys: dayKeys,
  });

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
    </>
  );
};

export default JournalList;
