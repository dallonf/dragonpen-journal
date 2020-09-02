import React from 'react';
import unified from 'unified';
import mdParse from 'remark-parse';
import disable from 'remark-disable-tokenizers';

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
        'strong',
        'emphasis',
        'deletion',
        'code',
        'break',
        // 'text',
      ],
    });

  const ast = processor.parse(text);

  const renderBlock = (block: any) => {
    if (block.type === 'paragraph') {
      return <p>{block.children.map(renderInline)}</p>;
    } else {
      return (
        <code style={{ display: 'block' }}>
          I don't know what a {block.type} is
        </code>
      );
    }
  };

  const renderInline = (inline: any) => {
    if (inline.type === 'text') {
      return <>{inline.value}</>
    } else {
      return <code>I don't know what a {inline.type} is</code>;
    }
  }

  const elements = (ast as any).children.map(renderBlock);

  return (
    <>
      <div data-testid="output">{elements}</div>
      <pre>{JSON.stringify(ast, null, 2)}</pre>
    </>
  );
};
