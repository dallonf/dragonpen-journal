import React from 'react';
import styled from '@emotion/styled/macro';
import { Typography, Box } from '@material-ui/core';
import { styledWithTheme } from '../../utils';

const DaySectionBox = styled(Box)`
  position: relative;
`;

const HeaderLine = styledWithTheme(Box)`
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  background: ${(props) => props.theme.palette.background.default};

  &:before,
  &:after {
    content: '';
    display: block;
    height: 1px;
    background: ${(props) => props.theme.palette.text.primary};
    flex: 1;
  }

  &:before {
    margin-right: 8px;
  }

  &:after {
    margin-left: 8px;
  }
`;

const DaySection: React.FC<{
  dayHeader: React.ReactNode;
  children?: React.ReactNode;
}> = ({ dayHeader, children }) => (
  <DaySectionBox>
    <HeaderLine>
      <Typography variant="subtitle1">{dayHeader}</Typography>
    </HeaderLine>
    {children}
  </DaySectionBox>
);

export default DaySection;
