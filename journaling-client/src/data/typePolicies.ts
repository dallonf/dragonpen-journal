import type { TypePolicies, Reference } from '@apollo/client';
import * as lodash from 'lodash';

export default {
  Query: {
    fields: {
      journalEntryById: {
        read: (existing, { args, toReference, canRead }) => {
          const ref = args!.id
            ? toReference({ __typename: 'JournalEntry', id: args!.id })
            : null;
          return canRead(ref) ? ref : existing;
        },
      },

      journalEntries: {
        keyArgs: (args) =>
          args &&
          Object.keys(args).filter((x) => x !== 'limit' && x !== 'after'),

        read: (
          existing: { timestamp: string }[] | undefined,
          { args: _args }
        ) => {
          if (!existing) return existing;
          const args = _args as { after?: string; limit?: number };

          if (args.after) {
            const startIndex = existing.findIndex(
              (x) => x.timestamp > args.after!
            );
            return existing.slice(startIndex);
          } else {
            return existing;
          }
        },

        merge: (
          existing: Reference[] | undefined,
          incoming: Reference[],
          { args: _args, readField }
        ) => {
          const args = _args as { after?: string; limit?: number };

          const castRequired = <T extends any>(x: T | undefined): T => {
            if (x === undefined) {
              throw new Error(
                'JournalEntry was queried without all required fields for caching: timestamp and id'
              );
            }
            return x;
          };

          const incomingEntries = incoming.map((x) => ({
            ref: x,
            values: {
              id: castRequired(readField('id', x) as string | undefined),
              timestamp: castRequired(
                readField('timestamp', x) as string | undefined
              ),
            },
          }));

          if (!existing || !args.after) {
            // TODO: this might not cache appropriately based on limit
            return incoming;
          }
          const after = args.after!;

          const existingEntries = existing.map((x) => ({
            ref: x,
            values: {
              id: readField('id', x) as string,
              timestamp: readField('timestamp', x) as string,
            },
          }));

          let insertPoint = existingEntries.findIndex(
            (x) => x.values.timestamp < after
          );
          if (insertPoint === -1) insertPoint = existingEntries.length;

          // merge everything "after"
          // make sure any new entries overwrite existing ones
          const incomingSet = new Set(incomingEntries.map((x) => x.values.id));
          let mergedAfterEntries = existingEntries
            .slice(insertPoint)
            .filter((x) => !incomingSet.has(x.values.id))
            .concat(incomingEntries);

          mergedAfterEntries = lodash.orderBy(
            mergedAfterEntries,
            (x) => x.values.timestamp,
            ['desc']
          );

          return existing
            .slice(0, insertPoint)
            .concat(mergedAfterEntries.map((x) => x.ref));
        },
      },
    },
  },
} as TypePolicies;
