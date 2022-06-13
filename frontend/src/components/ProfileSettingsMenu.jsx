import { Edit, Key, Logout, ManageAccounts } from "@mui/icons-material";
import { ListItemIcon, MenuItem } from "@mui/material";
import Menu, { menuIconProps, menuItemProps } from "./Menu";
import { useState } from "react";
import { AppState } from "../context/ContextProvider";
import { useNavigate } from "react-router-dom";

const ProfileSettingsMenu = ({ openEditProfileDialog }) => {
  const {
    profileSettingsMenuAnchor,
    setProfileSettingsMenuAnchor,
    displayAlertDialog,
    displayToast,
    setDialogBody,
  } = AppState();

  const navigate = useNavigate();

  const openLogoutConfirmDialog = () => {
    displayAlertDialog({
      title: "Logout Confirmation",
      nolabel: "NO",
      yeslabel: "YES",
      action: () => {
        sessionStorage.removeItem("loggedInUser");
        navigate("/");
        displayToast({
          message: "Logged Out",
          type: "info",
          duration: 2000,
          position: "bottom-center",
        });
      },
    });
    setDialogBody(<>Are you sure you want to log out?</>);
  };

  const openEditPasswordDialog = () => {
    // display
  };

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
      <MenuItem sx={menuItemProps}>
        <ListItemIcon sx={menuIconProps} onClick={openEditPasswordDialog}>
          <Key />
        </ListItemIcon>
        Change Password
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
