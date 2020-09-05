import React from 'react';
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { undo, redo, history } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import { Schema, MarkSpec } from 'prosemirror-model';
import type OrderedMap from 'orderedmap';
import styled from '@emotion/styled/macro';

const MarkdownSourceStylesContainer = styled.div`
  white-space: pre;

  .md-syntax {
    opacity: 0.5;
  }
`;

const MarkdownEditor = () => {
  const containerRef = React.useCallback<(ref: HTMLPreElement | null) => void>(
    (ref) => {
      if (ref) {
        const schema = new Schema({
          nodes: basicSchema.spec.nodes,
          marks: (basicSchema.spec.marks as OrderedMap<MarkSpec>).addToEnd(
            'mdSyntax',
            {
              inclusive: false,
              toDOM: (mark) => ['span', { class: 'md-syntax' }, 0],
            }
          ),
        });

        const document = schema.node('doc', undefined, [
          schema.node('paragraph', undefined, [
            schema.text('Hello '),
            schema.text('**', [schema.mark('mdSyntax')]),
            schema.text('world', [schema.mark('strong')]),
            schema.text('**', [schema.mark('mdSyntax')]),
            schema.text(", I'm doing Markdown "),
            schema.text('_', [schema.mark('mdSyntax')]),
            schema.text('stuff', [schema.mark('em')]),
            schema.text('_', [schema.mark('mdSyntax')]),
            schema.text('!'),
          ]),
        ]);

        const state = EditorState.create({
          schema,
          plugins: [
            history(),
            keymap({ 'Mod-z': undo, 'Mod-y': redo }),
            keymap(baseKeymap),
          ],
          doc: document,
        });
        const view = new EditorView(ref, {
          state,
          dispatchTransaction(transaction) {
            console.log(
              'Document size went from',
              transaction.before.content.size,
              'to',
              transaction.doc.content.size
            );
            const newState = view.state.apply(transaction);
            view.updateState(newState);
          },
        });
      }
    },
    []
  );

  return (
    <MarkdownSourceStylesContainer>
      <pre ref={containerRef} />
    </MarkdownSourceStylesContainer>
  );
};

export default MarkdownEditor;
