import React from 'react';
import { Typography, Box } from '@material-ui/core';
import { styledWithTheme } from '../../utils';

const HeaderLine = styledWithTheme(Box)`
  display: flex;
  align-items: center;

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
  <Box>
    <HeaderLine>
      <Typography variant="subtitle1">{dayHeader}</Typography>
    </HeaderLine>
    {children}
  </Box>
);

export default DaySection;
