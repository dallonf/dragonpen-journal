import { TypePolicies } from '@apollo/client';

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
    },
  },
} as TypePolicies;
