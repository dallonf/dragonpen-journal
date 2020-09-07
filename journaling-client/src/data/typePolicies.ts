import { TypePolicies } from '@apollo/client';

export default {
  Query: {
    fields: {
      // Blocked by
      // https://github.com/apollographql/apollo-client/issues/6844
      // journalEntryById: {
      //   read: (q, { args, toReference }) =>
      //     args!.id
      //       ? toReference({ __typename: 'JournalEntry', id: args!.id })
      //       : null,
      // },
    },
  },
} as TypePolicies;
