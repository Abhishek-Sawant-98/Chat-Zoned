import { Logout, ManageAccounts } from "@mui/icons-material";
import { ListItemIcon, MenuItem } from "@mui/material";
import Menu, { menuIconProps, menuItemProps } from "../utils/Menu";
import { useState } from "react";
import { AppState } from "../../context/ContextProvider";

const NotificationsMenu = ({ anchor, setAnchor }) => {
  const { loggedInUser, setLoggedInUser } = AppState();
  const notifs = loggedInUser?.notifications;
  return (
    <Menu
      menuAnchor={anchor}
      setMenuAnchor={setAnchor}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      {notifs?.length ? (
        notifs.map((n) => (
          <MenuItem
            key={n._id}
            sx={menuItemProps}
            onClick={() => {}}
          >{`1 message from ${n.sender}`}</MenuItem>
        ))
      ) : (
        <MenuItem sx={menuItemProps}>No notifications</MenuItem>
      )}
    </Menu>
  );
};

export default NotificationsMenu;
