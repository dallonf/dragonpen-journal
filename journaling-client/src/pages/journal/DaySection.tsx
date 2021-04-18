import React from 'react';
import styled from '@emotion/styled';
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
  z-index: 10;

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

const DaySection = React.forwardRef<
  HTMLElement,
  {
    dayHeader: React.ReactNode;
    children?: React.ReactNode;
  }
>(({ dayHeader, children }, ref) => (
  // TODO: Types workaround for
  // https://github.com/mui-org/material-ui/issues/17010
  <DaySectionBox {...{ ref }}>
    <HeaderLine>
      <Typography variant="subtitle1">{dayHeader}</Typography>
    </HeaderLine>
    {children}
  </DaySectionBox>
));

export default DaySection;
