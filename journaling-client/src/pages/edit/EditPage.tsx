import React from 'react';
import styled from '@emotion/styled/macro';
import { Button, Box } from '@material-ui/core';
import Editor from 'rich-markdown-editor';
import * as dateFns from 'date-fns';
import {
  gql,
  useQuery,
  NetworkStatus,
  useMutation,
  ApolloClient,
} from '@apollo/client';
import { useParams } from 'react-router-dom';
import { styledWithTheme } from '../../utils';
import Layout, { MainAreaContainer } from '../../framework/Layout';
import DateTimePickerDialog from '../../components/DateTimePickerDialog';
import {
  EditPageQuery,
  EditPageQueryVariables,
  EditPageMutation,
  EditPageMutationVariables,
} from '../../generated/gql-types';

const EDIT_PAGE_QUERY = gql`
  query EditPageQuery($id: ID!) {
    journalEntryById(id: $id) {
      id
      timestamp
      text
    }
  }
`;

export const prepBlankEntry = (client: ApolloClient<unknown>, id: string) => {
  client.writeQuery<EditPageQuery, EditPageQueryVariables>({
    query: EDIT_PAGE_QUERY,
    variables: { id },
    data: {
      journalEntryById: null,
    },
  });
};

const EDIT_PAGE_MUTATION = gql`
  mutation EditPageMutation($input: JournalEntrySaveInput!) {
    journalEntrySave(input: $input) {
      success
      journalEntry {
        id
        timestamp
        text
      }
    }
  }
`;

const FlushButtonContainer = styledWithTheme(Box)((props) => ({
  marginLeft: -props.theme.spacing(1),
  marginRight: -props.theme.spacing(1),
}));

const ButtonWithNormalText = styled(Button)`
  text-transform: none;
`;

interface EditPageParams {
  id: string;
}

interface FormState {
  timestamp: Date;
  initialText: string;
}

const EditPage: React.FC = () => {
  const params = useParams<EditPageParams>();
  const query = useQuery<EditPageQuery, EditPageQueryVariables>(
    EDIT_PAGE_QUERY,
    {
      fetchPolicy: 'network-only',
      variables: { id: params.id },
    }
  );

  const [formState, setFormState] = React.useState<FormState>();
  const [text, setText] = React.useState('');

  React.useEffect(() => {
    if (
      query.networkStatus === NetworkStatus.ready &&
      query.data &&
      !query.error &&
      formState == null
    ) {
      const { journalEntryById } = query.data;
      if (journalEntryById) {
        setFormState({
          timestamp: dateFns.parseISO(journalEntryById.timestamp),
          initialText: journalEntryById.text,
        });
        setText(journalEntryById.text);
      } else {
        setFormState({
          timestamp: new Date(),
          initialText: '',
        });
      }
    }
  }, [query.networkStatus, query.data, query.error, formState]);

  const [timeModalOpen, setTimeModalOpen] = React.useState(false);

  const [mutate, { loading: mutating }] = useMutation<
    EditPageMutation,
    EditPageMutationVariables
  >(EDIT_PAGE_MUTATION);

  // TODO: these update functions are not very resilient to rapid state changes
  // esp. consider React concurrent mode

  const updateTimestamp = (newTime: Date) => {
    if (!formState) return;

    const newState = {
      ...formState,
      timestamp: newTime,
    };
    setFormState(newState);

    mutate({
      variables: {
        input: {
          id: params.id,
          text: text,
          timestamp: newState.timestamp.toISOString(),
        },
      },
    });
  };

  const updateText = (newTextGetter: () => string) => {
    const newText = newTextGetter();
    setText(newText);

    if (!formState) return;
    mutate({
      variables: {
        input: {
          id: params.id,
          text: newText,
          timestamp: formState.timestamp.toISOString(),
        },
      },
    });
  };

  return (
    <Layout
      pageTitle="Edit Entry"
      backLink="/"
      loading={query.loading || mutating}
    >
      <MainAreaContainer maxWidth="md">
        <FlushButtonContainer mb={2}>
          <ButtonWithNormalText
            onClick={() => setTimeModalOpen(true)}
            disabled={query.loading}
          >
            {dateFns.format(formState?.timestamp ?? new Date(), 'PPPPp')}
          </ButtonWithNormalText>
          {formState != null && (
            <DateTimePickerDialog
              open={timeModalOpen}
              onClose={(value) => {
                value && updateTimestamp(value);
                setTimeModalOpen(false);
              }}
              value={formState.timestamp}
            />
          )}
        </FlushButtonContainer>
        <Editor
          value={formState?.initialText || ''}
          onChange={updateText}
          readOnly={query.loading}
        />
      </MainAreaContainer>
    </Layout>
  );
};

export default EditPage;
