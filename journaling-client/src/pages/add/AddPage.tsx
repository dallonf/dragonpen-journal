import React from 'react';
import styled from '@emotion/styled/macro';
import { Button, Box } from '@material-ui/core';
import Editor from 'rich-markdown-editor';
import { format } from 'date-fns';
import { styledWithTheme } from '../../utils';
import Layout, { MainAreaContainer } from '../../framework/Layout';
import DateTimePickerDialog from './DateTimePickerDialog';

const FlushButtonContainer = styledWithTheme(Box)((props) => ({
  marginLeft: -props.theme.spacing(1),
  marginRight: -props.theme.spacing(1),
}));

const ButtonWithNormalText = styled(Button)`
  text-transform: none;
`;

const AddPage: React.FC = () => {
  const [_body, setBody] = React.useState('');
  const [time, setTime] = React.useState(new Date());
  const [timeModalOpen, setTimeModalOpen] = React.useState(false);

  return (
    <Layout pageTitle="Add Entry" backLink="/">
      <MainAreaContainer maxWidth="md">
        <FlushButtonContainer mb={2}>
          <ButtonWithNormalText onClick={() => setTimeModalOpen(true)}>
            {format(time, 'PPPPp')}
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
        <Editor defaultValue={''} onChange={setBody} />
      </MainAreaContainer>
    </Layout>
  );
};

export default AddPage;
