import React from 'react';
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Menu,
  MenuItem,
} from '@material-ui/core';
import { MoreVert as MoreVertIcon } from '@material-ui/icons';

const JournalEntryListItem: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const menuElRef = React.useRef();
  const [listItemHover, setListItemHover] = React.useState(false);
  const [menuButtonHover, setMenuButtonHover] = React.useState(false);

  const hovering = listItemHover || menuButtonHover;

  const [menuEl, setMenuEl] = React.useState<null | HTMLElement>();

  const showMenu = (menuEl: HTMLElement) => {
    setMenuEl(menuEl);
  };
  const closeMenu = () => {
    setMenuEl(null);
  };

  return (
    <ListItem
      button
      onMouseEnter={() => setListItemHover(true)}
      onMouseLeave={() => setListItemHover(false)}
      onContextMenu={(e) => {
        e.preventDefault();
        if (menuElRef.current) showMenu(menuElRef.current!);
      }}
    >
      <ListItemText primary={children} />
      <ListItemSecondaryAction
        onMouseEnter={() => setMenuButtonHover(true)}
        onMouseLeave={() => setMenuButtonHover(false)}
        style={{ visibility: hovering ? 'visible' : 'hidden' }}
      >
        {
          <IconButton
            edge="end"
            aria-label="menu"
            onClick={(e) => showMenu(e.currentTarget)}
            // IconButton doesn't appear to type its `ref` correctly
            ref={menuElRef as any}
          >
            <MoreVertIcon />
          </IconButton>
        }
        <Menu open={Boolean(menuEl)} anchorEl={menuEl} onClose={closeMenu}>
          <MenuItem>Edit</MenuItem>
          <MenuItem>Delete</MenuItem>
        </Menu>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default JournalEntryListItem;
