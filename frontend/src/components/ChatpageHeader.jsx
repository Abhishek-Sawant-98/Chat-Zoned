import { Notifications, Search } from "@mui/icons-material";
import { Avatar, IconButton } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import NotificationsMenu from "./menus/NotificationsMenu";
import ProfileSettingsMenu from "./menus/ProfileSettingsMenu";
import SearchUsersDrawer from "./utils/SearchUsersDrawer";
import getCustomTooltip from "./utils/CustomTooltip";
import animationData from "../animations/chat-gif.json";
import LottieAnimation from "./utils/LottieAnimation";
import { useSelector } from "react-redux";
import { selectAppState } from "../store/slices/AppSlice";

const arrowStyles = { color: "#666" };
const tooltipStyles = {
  maxWidth: 250,
  color: "#eee",
  fontFamily: "Trebuchet MS",
  fontSize: 16,
  padding: "5px 15px",
  backgroundColor: "#666",
};
const CustomTooltip = getCustomTooltip(arrowStyles, tooltipStyles);

const ChatpageHeader = ({ chats, setFetchMsgs, setDialogBody }) => {
  const { loggedInUser } = useSelector(selectAppState);
  const appGif = useRef();
  const notifCount = loggedInUser?.notifications?.length || "";

  const [animateNotif, setAnimateNotif] = useState(false);
  const [notificationsMenuAnchor, setNotificationsMenuAnchor] = useState(null);
  const [profileSettingsMenuAnchor, setProfileSettingsMenuAnchor] =
    useState(null);

  const openNotificationMenu = (e) => setNotificationsMenuAnchor(e.target);
  const openProfileSettingsMenu = (e) => setProfileSettingsMenuAnchor(e.target);

  // For opening/closing 'search users' left drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (animateNotif) return;
    setAnimateNotif(true);
    let timeout = setTimeout(() => {
      setAnimateNotif(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [notifCount]);

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
        setFetchMsgs={setFetchMsgs}
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
        <span style={{ color: "orange" }} className="fs-4 fw-bold mt-1">
          CHAT ZONED
        </span>
      </div>

      {/* User notification and profile settings icons */}
      <div>
        <CustomTooltip title={`Notifications`} placement="bottom-end" arrow>
          <IconButton
            className="position-relative mx-1"
            onClick={openNotificationMenu}
            sx={{
              color: "#999999",
              ":hover": { backgroundColor: "#aaaaaa20" },
            }}
          >
            {notifCount && (
              <span
                className={`notifBadge ${
                  animateNotif ? "notifCountChange" : ""
                } badge rounded-circle bg-danger 
               position-absolute`}
                style={{
                  fontSize: notifCount > 99 ? 12 : 13,
                  top: -2,
                  right: notifCount > 99 ? -11 : notifCount > 9 ? -5 : -2,
                  padding:
                    notifCount > 99
                      ? "6px 5px"
                      : notifCount > 9
                      ? "4px 5px"
                      : "4px 7px",
                }}
              >
                {!notifCount ? "" : notifCount > 99 ? "99+" : notifCount}
              </span>
            )}
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
              ":hover": { backgroundColor: "#aaaaaa20" },
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
          chats={chats}
          setFetchMsgs={setFetchMsgs}
          anchor={notificationsMenuAnchor}
          setAnchor={setNotificationsMenuAnchor}
        />
        <ProfileSettingsMenu
          anchor={profileSettingsMenuAnchor}
          setAnchor={setProfileSettingsMenuAnchor}
          setDialogBody={setDialogBody}
        />
      </div>
    </header>
  );
};

export default ChatpageHeader;
