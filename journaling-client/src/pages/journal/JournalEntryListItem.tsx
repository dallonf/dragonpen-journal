import React from 'react';
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@material-ui/core';
import { MoreVert as MoreVertIcon } from '@material-ui/icons';

const JournalEntryListItem: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const [hovering, setHovering] = React.useState(0);
  const incrementHovering = () => setHovering((x) => x + 1);
  const decrementHovering = () => setHovering((x) => x - 1);
  return (
    <ListItem
      button
      onMouseEnter={(e) => incrementHovering()}
      onMouseLeave={(e) => decrementHovering()}
    >
      <ListItemText primary={children} />
      <ListItemSecondaryAction
        onMouseEnter={(e) => incrementHovering()}
        onMouseLeave={(e) => decrementHovering()}
        style={{ visibility: hovering > 0 ? 'visible' : 'hidden' }}
      >
        <IconButton edge="end" aria-label="menu">
          <MoreVertIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default JournalEntryListItem;
