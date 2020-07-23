import React from 'react';
import styled from '@emotion/styled/macro';
import { Button, Box } from '@material-ui/core';
import Editor from 'rich-markdown-editor';
import * as dateFns from 'date-fns';
import { gql, useQuery, NetworkStatus } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { styledWithTheme } from '../../utils';
import Layout, { MainAreaContainer } from '../../framework/Layout';
import DateTimePickerDialog from '../../components/DateTimePickerDialog';
import {
  EditPageQuery,
  EditPageQueryVariables,
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
  text: string;
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
          text: journalEntryById.text,
        });
      } else {
        setFormState({
          timestamp: new Date(),
          text: '',
        });
      }
    }
  }, [query.networkStatus, query.data, query.error, formState]);

  const [timeModalOpen, setTimeModalOpen] = React.useState(false);

  return (
    <Layout pageTitle="Edit Entry" backLink="/">
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
                value &&
                  setFormState((prevFormState) => ({
                    ...prevFormState!,
                    timestamp: value,
                  }));
                setTimeModalOpen(false);
              }}
              value={formState.timestamp}
            />
          )}
        </FlushButtonContainer>
        {/* <Editor
          defaultValue={body}
          onChange={setBody}
          readOnly={!query.loading}
        /> */}
      </MainAreaContainer>
    </Layout>
  );
};

export default EditPage;
