import React from 'react';
import { schema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { undo, redo, history } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';

const MarkdownEditor = () => {
  const containerRef = React.useCallback<(ref: HTMLPreElement | null) => void>(
    (ref) => {
      if (ref) {
        const state = EditorState.create({
          schema,
          plugins: [
            history(),
            keymap({ 'Mod-z': undo, 'Mod-y': redo }),
            keymap(baseKeymap),
          ],
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

  return <pre ref={containerRef} />;
};

export default MarkdownEditor;
