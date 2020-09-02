import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import MarkdownEditor from './MarkdownEditor';

export default {
  title: 'MarkdownEditor',
} as Meta;

const Interactive: Story<{}> = () => <MarkdownEditor />;

export { Interactive };
