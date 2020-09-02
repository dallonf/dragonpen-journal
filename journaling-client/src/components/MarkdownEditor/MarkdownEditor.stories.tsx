import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import MarkdownEditor from './MarkdownEditor';
import { MarkdownSourceRenderer } from './experiments';

export default {
  title: 'MarkdownEditor',
} as Meta;

export const Interactive: Story<{}> = () => <MarkdownEditor />;

const RendererTemplate: Story<{ text: string }> = (args) => (
  <MarkdownSourceRenderer {...args} />
);

export const Renderer = RendererTemplate.bind({});
Renderer.args = {
  text: "Hello **world**, I'm doing Markdown _stuff_!",
};
