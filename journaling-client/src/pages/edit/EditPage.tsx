import React from 'react';
import styled from '@emotion/styled/macro';
import { Button, Box } from '@material-ui/core';
import Editor from 'rich-markdown-editor';
import * as dateFns from 'date-fns';
import { styledWithTheme } from '../../utils';
import Layout, { MainAreaContainer } from '../../framework/Layout';
import DateTimePickerDialog from '../../components/DateTimePickerDialog';

const FlushButtonContainer = styledWithTheme(Box)((props) => ({
  marginLeft: -props.theme.spacing(1),
  marginRight: -props.theme.spacing(1),
}));

const ButtonWithNormalText = styled(Button)`
  text-transform: none;
`;

const EditPage: React.FC = () => {
  const [body, setBody] = React.useState(
    "Ah, Superintendent Chalmers, welcome! I hope you're prepared for an unforgettable luncheon!"
  );
  const [time, setTime] = React.useState(dateFns.parseISO('2020-07-20T11:55'));
  const [timeModalOpen, setTimeModalOpen] = React.useState(false);

  return (
    <Layout pageTitle="Edit Entry" backLink="/">
      <MainAreaContainer maxWidth="md">
        <FlushButtonContainer mb={2}>
          <ButtonWithNormalText onClick={() => setTimeModalOpen(true)}>
            {dateFns.format(time, 'PPPPp')}
          </ButtonWithNormalText>
          <DateTimePickerDialog
            open={timeModalOpen}
            onClose={(value) => {
              value && setTime(value);
              setTimeModalOpen(false);
            }}
            value={time}
          />
        </FlushButtonContainer>
        <Editor defaultValue={body} onChange={setBody} />
      </MainAreaContainer>
    </Layout>
  );
};

export default EditPage;
