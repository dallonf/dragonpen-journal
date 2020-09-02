import React from 'react';
import { render, prettyDOM } from '@testing-library/react';
import { MarkdownSourceRenderer } from './experiments';

describe('MarkdownSourceRenderer', () => {
  const getMarkdownOutput = (text: string) =>
    prettyDOM(
      render(<MarkdownSourceRenderer text={text} />).getByTestId('output')
    );

  const expectedOutput = (elements: React.ReactNode) =>
    prettyDOM(
      render(<div data-testid="output">{elements}</div>).container.firstChild as Element
    );

  it('renders just text', () => {
    expect(getMarkdownOutput('Hello World')).toEqual(
      expectedOutput(<p>Hello World</p>)
    );
  });
});
