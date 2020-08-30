tmux new-session \; \
  split-window -h \; \
  select-pane -t 0 \; \
  split-window -v \; \
  select-pane -t 0 \; \
  \
  send-keys 'npm run typecheck -- --watch' C-m \; \
  select-pane -t 1 \; \
  send-keys 'npm run typegen:gql -- --watch' C-m \; \
  select-pane -t 2 \; \
  send-keys 'npm run start' C-m \; \
