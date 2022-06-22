import { Notifications, Search } from "@mui/icons-material";
import { Avatar, IconButton } from "@mui/material";
import { useRef, useState } from "react";
import { AppState } from "../context/ContextProvider";
import NotificationsMenu from "./NotificationsMenu";
import ProfileSettingsMenu from "./ProfileSettingsMenu";
import SearchUsersDrawer from "./SearchUsersDrawer";
import getCustomTooltip from "./utils/CustomTooltip";
import animationData from "../animations/chat-gif.json";
import LottieAnimation from "./utils/LottieAnimation";

const arrowStyles = {
  color: "#777",
};
const tooltipStyles = {
  maxWidth: 250,
  color: "#eee",
  fontFamily: "Mirza",
  fontSize: 17,
  backgroundColor: "#777",
};
const CustomTooltip = getCustomTooltip(arrowStyles, tooltipStyles);

const ChatpageHeader = () => {
  const { loggedInUser, formClassNames } = AppState();
  const { loading } = formClassNames;
  const appGif = useRef();

  const [notificationsMenuAnchor, setNotificationsMenuAnchor] = useState(null);
  const [profileSettingsMenuAnchor, setProfileSettingsMenuAnchor] =
    useState(null);

  const openNotificationMenu = (e) => {
    setNotificationsMenuAnchor(e.target);
  };

  const openProfileSettingsMenu = (e) => {
    setProfileSettingsMenuAnchor(e.target);
  };

  // For opening/closing 'search users' left drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <header
      className={`chatpageDiv d-flex justify-content-between align-items-center user-select-none`}
    >
      {/* Search Users to create/access chat */}
      <CustomTooltip
        title="Search Users to Start or Open a Chat"
        placement="bottom-start"
        arrow
      >
        <button
          style={{ borderRadius: "20px" }}
          className={`btn btn-outline-secondary text-light px-3`}
          onClick={() => setIsDrawerOpen(true)}
        >
          <Search className={`me-1`} />
          <span className={`d-none d-md-inline mb-1 fs-5`}>Search Users</span>
        </button>
      </CustomTooltip>
      <SearchUsersDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
      />

      {/* App Logo */}
      <div className={`d-flex align-items-center ms-3 ms-md-0`}>
        <LottieAnimation
          ref={appGif}
          className={"d-none d-sm-inline-block mt-2 me-sm-1 me-md-2"}
          style={{ width: "35px", height: "35px" }}
          animationData={animationData}
        />
        <span style={{ color: "orange" }} className="fs-3 fw-bold">
          CHAT ZONED
        </span>
      </div>

      {/* User notification and profile settings icons */}
      <div>
        <CustomTooltip title="Notifications" placement="bottom-end" arrow>
          <IconButton
            onClick={openNotificationMenu}
            sx={{
              color: "#999999",
              ":hover": {
                backgroundColor: "#aaaaaa20",
              },
            }}
          >
            <Notifications className={`text-light`} />
          </IconButton>
        </CustomTooltip>
        <CustomTooltip
          title="Profile Settings"
          size="small"
          placement="bottom-end"
          arrow
        >
          <IconButton
            className="mx-md-3 mx-lg-4"
            sx={{
              color: "#999999",
              ":hover": {
                backgroundColor: "#aaaaaa20",
              },
            }}
            onClick={openProfileSettingsMenu}
          >
            <Avatar
              alt="LoggedInUser"
              className="img-fluid"
              src={loggedInUser?.profilePic}
            />
          </IconButton>
        </CustomTooltip>
        <NotificationsMenu
          anchor={notificationsMenuAnchor}
          setAnchor={setNotificationsMenuAnchor}
        />
        <ProfileSettingsMenu
          anchor={profileSettingsMenuAnchor}
          setAnchor={setProfileSettingsMenuAnchor}
        />
      </div>
    </header>
  );
};

export default ChatpageHeader;
