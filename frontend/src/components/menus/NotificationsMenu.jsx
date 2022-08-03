import { MenuItem } from "@mui/material";
import Menu, { menuItemProps } from "../utils/Menu";
import MenuItemText from "../utils/MenuItemText";
import { useDispatch, useSelector } from "react-redux";
import { selectAppState } from "../../store/slices/AppSlice";
import { useEffect } from "react";
import { getOneOnOneChatReceiver, truncateString } from "../../utils/appUtils";

const NotificationsMenu = ({ anchor, setAnchor }) => {
  const { loggedInUser } = useSelector(selectAppState);
  const dispatch = useDispatch();
  const notifs = loggedInUser?.notifications;
  const notifGroups = {};
  notifs.forEach((notif) => {
    // Group notifications by 'chat'
    const notifChat = notif.chat;
    const chatId = notifChat._id;
    const chatName = notifChat.isGroupChat
      ? notifChat.chatName
      : getOneOnOneChatReceiver(loggedInUser, notifChat.users).name.split(
          " "
        )[0];
    const notifGroupId = `${chatId}---${chatName}`;
    if (notifGroups[notifGroupId]) {
      ++notifGroups[notifGroupId];
    } else {
      notifGroups[notifGroupId] = 1;
    }
  });

  useEffect(() => {
    console.log("notifications : ", loggedInUser.notifications);
  }, []);

  return (
    <Menu
      menuAnchor={anchor}
      setMenuAnchor={setAnchor}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      onClick={(e) => {
        const chatNotifId =
          e.target.dataset?.notifItem || e.target.parentNode.dataset?.notifItem;
        if (chatNotifId) {
          console.log("chat notif clicked");
        }
      }}
    >
      {Object.keys(notifGroups).length ? (
        Object.keys(notifGroups).map((notifGroupId) => (
          <MenuItem
            className={`notifItem`}
            key={notifGroupId}
            data-notif-group={notifGroupId}
            sx={menuItemProps}
          >
            <MenuItemText>
              {`${notifGroups[notifGroupId]} message${
                notifGroups[notifGroupId] > 1 ? "s" : ""
              } from `}
              <span className="text-info">
                {`${truncateString(notifGroupId.split("---")[1], 12, 9)}`}
              </span>
            </MenuItemText>
          </MenuItem>
        ))
      ) : (
        <MenuItem sx={menuItemProps}>
          <MenuItemText>No notifications</MenuItemText>
        </MenuItem>
      )}
    </Menu>
  );
};

export default NotificationsMenu;
