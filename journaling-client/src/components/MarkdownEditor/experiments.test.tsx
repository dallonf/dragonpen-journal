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

  const MD = (props: any) => <span className="md-symbol" {...props} />;

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
            <MD>**</MD>bold
            <MD>**</MD>
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
            <MD>__</MD>bold
            <MD>__</MD>
          </strong>
        </p>
      )
    );
  });

  it('renders emphasized text', () => {
    expect(getMarkdownOutput('This should be _italic_')).toEqual(
      expectedOutput(
        <p>
          This should be{' '}
          <em>
            <MD>_</MD>italic
            <MD>_</MD>
          </em>
        </p>
      )
    );
  });

  it('nests em and strong', () => {
    expect(getMarkdownOutput('_**strong** in emph_')).toEqual(
      expectedOutput(
        <p>
          <em>
            <MD>_</MD>
            <strong>
              <MD>**</MD>
              strong
              <MD>**</MD>
            </strong>{' '}
            in emph
            <MD>_</MD>
          </em>
        </p>
      )
    );
  });
});
