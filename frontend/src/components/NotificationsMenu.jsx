import { Logout, ManageAccounts } from "@mui/icons-material";
import { ListItemIcon, MenuItem } from "@mui/material";
import Menu, { menuIconProps, menuItemProps } from "./utils/Menu";
import { useState } from "react";
import { AppState } from "../context/ContextProvider";

const NotificationsMenu = () => {
  const {
    loggedInUser,
    setLoggedInUser,
    notificationsMenuAnchor,
    setNotificationsMenuAnchor,
  } = AppState();
  const { notifications } = loggedInUser;
  return (
    <Menu
      menuAnchor={notificationsMenuAnchor}
      setMenuAnchor={setNotificationsMenuAnchor}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      {notifications?.length ? (
        notifications.map((n) => (
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
