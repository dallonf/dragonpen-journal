import React from 'react';
import { render } from '@testing-library/react';
import { MarkdownSourceRenderer } from './experiments';

describe('MarkdownSourceRenderer', () => {
  const getMarkdownOutput = (text: string) =>
    render(<MarkdownSourceRenderer text={text} />).getByTestId('output')
      .innerHTML;

  const expectedOutput = (elements: React.ReactNode) =>
    (render(<div data-testid="output">{elements}</div>).container
      .firstChild as HTMLElement).innerHTML;

  it('renders just text', () => {
    expect(getMarkdownOutput('Hello There')).toEqual(
      expectedOutput(<p>Hello There</p>)
    );
  });

  it('renders strong text with symbols', () => {
    expect(getMarkdownOutput('General Kenobi, you are a **bold** one')).toEqual(
      expectedOutput(
        <p>
          General Kenobi, you are a{' '}
          <strong>
            <span className="md-symbol">**</span>bold
            <span className="md-symbol">**</span>
          </strong>{' '}
          one
        </p>
      )
    );
  });

  it('renders strong text with alternate symbols', () => {
    expect(getMarkdownOutput('this text is also __bold__')).toEqual(
      expectedOutput(
        <p>
          this text is also{' '}
          <strong>
            <span className="md-symbol">__</span>bold
            <span className="md-symbol">__</span>
          </strong>
        </p>
      )
    );
  });
});
