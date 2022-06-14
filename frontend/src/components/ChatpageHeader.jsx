import { Notifications, Search } from "@mui/icons-material";
import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useState } from "react";
import { AppState } from "../context/ContextProvider";
import AppGif from "./utils/AppGif";
import NotificationsMenu from "./NotificationsMenu";
import ProfileSettingsMenu from "./ProfileSettingsMenu";

const ChatpageHeader = () => {
  const {
    loggedInUser,
    setLoggedInUser,
    setNotificationsMenuAnchor,
    setProfileSettingsMenuAnchor,
  } = AppState();

  const openNotificationMenu = (e) => {
    setNotificationsMenuAnchor(e.currentTarget);
  };

  const openProfileSettingsMenu = (e) => {
    setProfileSettingsMenuAnchor(e.currentTarget);
  };

  return (
    <header
      className={`chatpage__header d-flex justify-content-between align-items-center user-select-none`}
    >
      {/* Search Users to create/access chat */}
      <Tooltip title="Search Users" className={`rounded-pill`} arrow>
        <button className={`btn btn-outline-secondary text-light px-3`}>
          <Search className={`me-1`} />
          <span className={`d-none d-md-inline mb-1 fs-5`}>Search Users</span>
        </button>
      </Tooltip>

      {/* App Logo */}
      <div className={`d-flex align-items-center ms-4 ms-md-0 me-md-5`}>
        <AppGif />
        <span style={{ color: "orange" }} className={`h2`}>
          CHAT ZONED
        </span>
      </div>

      {/* User notification and profile settings icons */}
      <div>
        <Tooltip title="Notifications" arrow>
          <IconButton onClick={openNotificationMenu}>
            <Notifications className={`text-light`} />
          </IconButton>
        </Tooltip>
        <Tooltip
          title="Profile settings"
          className="mx-md-3 mx-lg-4"
          size="small"
          arrow
        >
          <IconButton onClick={openProfileSettingsMenu}>
            <Avatar alt="Logged In User" src={loggedInUser?.profilePic} />
          </IconButton>
        </Tooltip>
        <NotificationsMenu></NotificationsMenu>
        <ProfileSettingsMenu></ProfileSettingsMenu>
      </div>
    </header>
  );
};

export default ChatpageHeader;
