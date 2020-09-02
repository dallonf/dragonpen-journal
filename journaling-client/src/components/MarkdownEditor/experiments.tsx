import React from 'react';
import styled from '@emotion/styled/macro';
import unified from 'unified';
import mdParse from 'remark-parse';
import disable from 'remark-disable-tokenizers';

const MarkdownSourceStylesContainer = styled.div`
  .md-symbol {
    opacity: 0.5;
  }
`;

export const MarkdownSourceRenderer = ({ text }: { text: string }) => {
  const processor = unified()
    .use(mdParse)
    .use(disable, {
      block: [
        'blankLine',
        'indentedCode',
        'fencedCode',
        'blockquote',
        'atxHeading',
        'thematicBreak',
        'list',
        'setextHeading',
        'html',
        'definition',
        'table',
        // 'paragraph',
      ],
      inline: [
        'escape',
        'autoLink',
        'url',
        'email',
        'html',
        'link',
        'reference',
        // 'strong',
        'emphasis',
        'deletion',
        'code',
        'break',
        // 'text',
      ],
    });

  const ast = processor.parse(text);

  const renderBlock = (block: any, i: number) => {
    if (block.type === 'paragraph') {
      return <p key={i}>{block.children.map(renderInline)}</p>;
    } else {
      return (
        <code key={i} style={{ display: 'block' }}>
          I don't know what a {block.type} is
        </code>
      );
    }
  };

  const renderInline = (inline: any, i: number) => {
    if (inline.type === 'text') {
      return <React.Fragment key={i}>{inline.value}</React.Fragment>;
    } else if (inline.type === 'strong') {

      const start = inline.position.start.offset;
      const end = inline.position.end.offset;
      const firstChildStart = inline.children[0].position.start.offset;
      const lastChildEnd = inline.children[inline.children.length - 1].position.end.offset;

      const prefix = text.slice(start, firstChildStart);
      const suffix = text.slice(lastChildEnd, end);

      return (
        <strong key={i}>
          <span className="md-symbol">{prefix}</span>
          {inline.children.map(renderInline)}
          <span className="md-symbol">{suffix}</span>
        </strong>
      );
    } else {
      return <code key={i}>I don't know what a {inline.type} is</code>;
    }
  };

  const elements = (ast as any).children.map(renderBlock);

  return (
    <>
      <MarkdownSourceStylesContainer>
        <div data-testid="output">{elements}</div>
      </MarkdownSourceStylesContainer>
      <pre>{JSON.stringify(ast, null, 2)}</pre>
    </>
  );
};
