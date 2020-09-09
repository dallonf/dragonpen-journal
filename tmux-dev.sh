tmux new-session \;\
  set-option destroy-unattached \;\
  new-window -n Server -c journaling-server \;\
  split-window -h -c journaling-server \;\
  select-pane -t 0 \;\
  split-window -v -c journaling-server \;\
  select-pane -t 0 \;\
  \
  send-keys 'npm run typecheck -- --watch' C-m \;\
  select-pane -t 1 \;\
  send-keys 'npm run generate:types:gql -- --watch' C-m \;\
  select-pane -t 2 \;\
  send-keys 'npm run start:dev' C-m \;\
  new-window -n Client -c journaling-client \;\
  split-window -h -c journaling-client \;\
  select-pane -t 0 \;\
  split-window -v -c journaling-client \;\
  select-pane -t 0 \;\
  \
  send-keys 'npm run typecheck -- --watch' C-m \;\
  select-pane -t 1 \;\
  send-keys 'npm run typegen:gql -- --watch' C-m \;\
  select-pane -t 2 \;\
  send-keys 'npm run start' C-m \;\
  kill-window -t 0 \;\
