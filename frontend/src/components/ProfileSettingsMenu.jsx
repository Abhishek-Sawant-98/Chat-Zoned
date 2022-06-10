import { Logout, ManageAccounts } from "@mui/icons-material";
import { ListItemIcon, MenuItem } from "@mui/material";
import Menu, { menuIconProps, menuItemProps } from "./Menu";
import { useState } from "react";
import { AppState } from "../context/ContextProvider";

const ProfileSettingsMenu = ({
  openEditProfileDialog,
  openLogoutConfirmDialog,
}) => {
  const { profileSettingsMenuAnchor, setProfileSettingsMenuAnchor } =
    AppState();
  return (
    <Menu
      menuAnchor={profileSettingsMenuAnchor}
      setMenuAnchor={setProfileSettingsMenuAnchor}
    >
      <MenuItem sx={menuItemProps}>
        <ListItemIcon sx={menuIconProps} onClick={openEditProfileDialog}>
          <ManageAccounts />
        </ListItemIcon>
        Edit Profile
      </MenuItem>
      <MenuItem sx={menuItemProps} onClick={openLogoutConfirmDialog}>
        <ListItemIcon sx={menuIconProps}>
          <Logout />
        </ListItemIcon>
        Logout
      </MenuItem>
    </Menu>
  );
};

export default ProfileSettingsMenu;
