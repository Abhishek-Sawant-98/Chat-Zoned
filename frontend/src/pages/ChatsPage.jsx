import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatpageHeader from "../components/ChatpageHeader";
import CustomDialog from "../components/utils/CustomDialog";
import ChatListView from "../components/ChatListView";
import MessagesView from "../components/MessagesView";
import { useDispatch, useSelector } from "react-redux";
import { displayToast } from "../store/slices/ToastSlice";
import {
  selectAppState,
  setDeleteNotifsOfChat,
  setGroupInfo,
  setLoggedInUser,
  setSelectedChat,
  toggleRefresh,
} from "../store/slices/AppSlice";
import {
  hideDialog,
  selectCustomDialogState,
} from "../store/slices/CustomDialogSlice";
import { getAxiosConfig, truncateString } from "../utils/appUtils";
import axios from "../utils/axios";

const ChatsPage = () => {
  const {
    loggedInUser,
    refresh,
    deleteNotifsOfChat,
    clientSocket,
    selectedChat,
    isSocketConnected,
  } = useSelector(selectAppState);
  const { dialogData, showDialogActions } = useSelector(
    selectCustomDialogState
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [dialogBody, setDialogBody] = useState(<></>);
  const [chats, setChats] = useState([]);
  const [typingChatUsers, setTypingChatUsers] = useState([]);

  useEffect(() => {
    // localStorage persists data even after page refresh, unlike state
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user) return navigate("/");

    if (Date.now() >= parseInt(user.expiryTime)) {
      navigate("/");
      return dispatch(
        displayToast({
          title: "Session Expired",
          message: "Please Login Again",
          type: "info",
          duration: 4000,
          position: "bottom-center",
        })
      );
    }

    dispatch(setLoggedInUser(user));
    dispatch(hideDialog());
    dispatch(setSelectedChat(null));
  }, []);

  const getTypingUserName = (typingUser) =>
    truncateString(typingUser.name?.toString().split(" ")[0], 12, 9) || " ";

  const getTypingChatId = (chatUser) => chatUser?.toString().split("---")[0];

  const displayInfo = (message = "Operation Executed") => {
    dispatch(
      displayToast({
        message,
        type: "info",
        duration: 5000,
        position: "bottom-center",
      })
    );
  };

  const groupSocketEventHandlers = () => {
    clientSocket
      .off("display updated grp")
      .on("display updated grp", (updatedGroupData) => {
        const { updatedGroup, createdAdmin, dismissedAdmin } = updatedGroupData;
        dispatch(toggleRefresh(!refresh));
        if (!updatedGroup) return;
        const { _id, chatName, removedUser } = updatedGroup;
        const isLoggedInUserRemoved = removedUser?._id === loggedInUser?._id;
        const isGroupInfoDialogOpen =
          dialogData.isOpen && dialogData.title === "Group Info";

        if (selectedChat?._id === _id) {
          let groupData = updatedGroup;
          if (isLoggedInUserRemoved) {
            dispatch(hideDialog());
            groupData = null;
          }
          dispatch(setSelectedChat(groupData));
          dispatch(setGroupInfo(groupData));
          if (
            isGroupInfoDialogOpen &&
            createdAdmin?._id === loggedInUser?._id
          ) {
            displayInfo(`You are now an Admin of '${chatName}' group`);
          }
          if (
            isGroupInfoDialogOpen &&
            dismissedAdmin?._id === loggedInUser?._id
          ) {
            displayInfo(`You are no longer an Admin of '${chatName}' group`);
          }
        }
        if (isLoggedInUserRemoved) {
          displayInfo(`You have been removed from '${chatName}' group`);
        }
      });

    clientSocket
      .off("remove deleted grp")
      .on("remove deleted grp", (deletedGroup) => {
        dispatch(toggleRefresh(!refresh));
        if (!deletedGroup) return;
        if (selectedChat?._id === deletedGroup?._id) {
          dispatch(hideDialog());
          dispatch(setSelectedChat(null));
          dispatch(setGroupInfo(null));
        }
        displayInfo(`'${deletedGroup.chatName}' Group Deleted by Admin`);
      });

    clientSocket.off("display new grp").on("display new grp", () => {
      dispatch(toggleRefresh(!refresh));
    });
  };

  const typingSocketEventHandler = () => {
    clientSocket
      .off("display typing")
      .on("display typing", (chat, typingUser) => {
        if (!chat || !typingUser) return;
        setTypingChatUsers([
          ...typingChatUsers,
          `${chat._id}---${getTypingUserName(typingUser)}---${
            typingUser.profilePic
          }---${chat.isGroupChat}`,
        ]);
      });

    clientSocket.off("hide typing").on("hide typing", (chat, typingUser) => {
      if (!chat || !typingUser) return;
      setTypingChatUsers(
        typingChatUsers.filter(
          (chatUser) =>
            chatUser !==
            `${chat._id}---${getTypingUserName(typingUser)}---${
              typingUser.profilePic
            }---${chat.isGroupChat}`
        )
      );
    });
  };

  // Listening to socket events
  useEffect(() => {
    if (!clientSocket || !isSocketConnected) return;
    groupSocketEventHandlers();
    typingSocketEventHandler();
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
    const notifs = [...loggedInUser?.notifications];
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
    dispatch(setDeleteNotifsOfChat(""));
  };

  useEffect(() => {
    if (!deleteNotifsOfChat) return;
    deleteNotifications(deleteNotifsOfChat);
  }, [deleteNotifsOfChat]);

  return (
    <>
      {loggedInUser && (
        <div className={`chatpage`}>
          {/* Header component */}
          <ChatpageHeader chats={chats} setDialogBody={setDialogBody} />

          <section className={`row g-1`}>
            {/* Chat List component */}
            <ChatListView
              chats={chats}
              setChats={setChats}
              loadingMsgs={loadingMsgs}
              setDialogBody={setDialogBody}
              typingChatUsers={typingChatUsers}
            />

            {/* Chat Messages component */}
            <MessagesView
              loadingMsgs={loadingMsgs}
              setLoadingMsgs={setLoadingMsgs}
              setDialogBody={setDialogBody}
              deletePersistedNotifs={deletePersistedNotifs}
              isNewUser={chats?.length === 0}
              typingChatUser={typingChatUsers.find(
                (u) => getTypingChatId(u) === selectedChat?._id
              )}
            />
          </section>

          {/* App Parent Dialog */}
          <CustomDialog
            dialogData={dialogData}
            showDialogActions={showDialogActions}
            showDialogClose={true}
          >
            {dialogBody}
          </CustomDialog>
        </div>
      )}
    </>
  );
};

export default ChatsPage;
