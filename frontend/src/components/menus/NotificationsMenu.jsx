import { MenuItem } from "@mui/material";
import Menu, { menuItemProps } from "../utils/Menu";
import MenuItemText from "../utils/MenuItemText";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAppState,
  setGroupInfo,
  setLoggedInUser,
  setSelectedChat,
} from "../../store/slices/AppSlice";
import {
  getAxiosConfig,
  getOneToOneChatReceiver,
  truncateString,
} from "../../utils/appUtils";
import axios from "../../utils/axios";

const NotificationsMenu = ({ chats, setFetchMsgs, anchor, setAnchor }) => {
  const { loggedInUser } = useSelector(selectAppState);
  const dispatch = useDispatch();
  const notifs = [...loggedInUser?.notifications];
  const notifGroups = {};

  notifs.forEach((notif) => {
    // Notifications grouped by 'chat'
    const notifChat = notif.chat;
    const chatId = notifChat._id;
    const chatName = notifChat.isGroupChat
      ? `group===${notifChat.chatName}`
      : getOneToOneChatReceiver(loggedInUser, notifChat.users).name;
    const notifGroupId = `${chatId}---${chatName}`;
    if (notifGroups[notifGroupId]) {
      ++notifGroups[notifGroupId];
    } else {
      notifGroups[notifGroupId] = 1;
    }
  });

  const deletePersistedNotifs = async (notifsToBeDeleted) => {
    const config = getAxiosConfig({ loggedInUser });
    try {
      await axios.put(
        `/api/user/delete/notifications`,
        { notificationIds: JSON.stringify(notifsToBeDeleted) },
        config
      );
    } catch (error) {
      console.log("Couldn't Delete Notifications : ", error.message);
    }
  };

  const deleteNotifications = (clickedChatId) => {
    // Delete notifs from global state and localStorage
    const notifsToBeDeleted = [];
    for (let i = 0; i < notifs.length; ++i) {
      if (notifs[i].chat._id === clickedChatId) {
        const deletedNotif = notifs.splice(i, 1)[0];
        notifsToBeDeleted.push(deletedNotif._id);
        // After deleting element at 'i', next element (i+1) shifts back
        // to 'i' index
        --i;
      }
    }
    const updatedUser = { ...loggedInUser, notifications: notifs };
    localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
    dispatch(setLoggedInUser(updatedUser));

    // Delete notifs that were persisted in mongodb
    deletePersistedNotifs(notifsToBeDeleted);
  };

  const chatNotifClickHandler = (e) => {
    const chatNotifId =
      e.target.dataset.notifGroup || e.target.parentNode.dataset.notifGroup;
    if (!chatNotifId) return;

    const chatId = chatNotifId.split("---")[0];
    const chatToBeOpened = chats.find((chat) => chat._id === chatId);
    dispatch(setSelectedChat(chatToBeOpened));
    setFetchMsgs(true); // To fetch selected chat msgs
    deleteNotifications(chatId);
    if (chatToBeOpened?.isGroupChat) dispatch(setGroupInfo(chatToBeOpened));
  };

  return (
    <Menu
      menuAnchor={anchor}
      setMenuAnchor={setAnchor}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      {Object.keys(notifGroups).length ? (
        <div onClick={chatNotifClickHandler}>
          {Object.keys(notifGroups).map((notifGroupId) => {
            const fromGroup = notifGroupId.includes("group===");
            const notifCount = notifGroups[notifGroupId];
            let chatName = notifGroupId.split("---")[1];
            chatName = fromGroup ? chatName.split("===")[1] : chatName;
            return (
              <MenuItem
                key={notifGroupId}
                data-notif-group={notifGroupId}
                sx={menuItemProps}
              >
                <MenuItemText>
                  {`${notifCount} message${notifCount > 1 ? "s" : ""} ${
                    fromGroup ? "in" : "from"
                  } `}
                  <span
                    title={chatName}
                    data-notif-group={notifGroupId}
                    className="text-info"
                  >
                    {`${truncateString(
                      fromGroup ? chatName : chatName.split(" ")[0],
                      12,
                      9
                    )}`}
                  </span>
                </MenuItemText>
              </MenuItem>
            );
          })}
        </div>
      ) : (
        <MenuItem sx={menuItemProps}>
          <MenuItemText>No notifications</MenuItemText>
        </MenuItem>
      )}
    </Menu>
  );
};

export default NotificationsMenu;
