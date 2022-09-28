import { useEffect, useState } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import ChatpageHeader from "../components/ChatpageHeader";
import CustomDialog from "../components/utils/CustomDialog";
import ChatListView from "../components/ChatListView";
import MessagesView from "../components/MessagesView";
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
import { useAppDispatch, useAppSelector } from "../store/storeHooks";
import { ChatType, MessageType, ToastData, UserType } from "../utils/AppTypes";
import { AxiosRequestConfig } from "axios";

const ChatsPage = () => {
  const {
    loggedInUser,
    deleteNotifsOfChat,
    clientSocket,
    selectedChat,
    isSocketConnected,
  } = useAppSelector(selectAppState);
  const { dialogData, showDialogActions } = useAppSelector(
    selectCustomDialogState
  );
  const dispatch = useAppDispatch();
  const navigate: NavigateFunction = useNavigate();
  const [loadingMsgs, setLoadingMsgs] = useState<boolean>(false);
  const [dialogBody, setDialogBody] = useState<React.ReactNode>(<></>);
  const [chats, setChats] = useState<ChatType[]>([]);
  const [typingChatUsers, setTypingChatUsers] = useState<string[]>([]);

  useEffect(() => {
    // localStorage persists data even after page refresh, unlike state
    const user = JSON.parse(localStorage.getItem("loggedInUser") as string);
    if (!user) {
      navigate("/");
      return;
    }

    if (Date.now() >= parseInt(user.expiryTime)) {
      navigate("/");
      dispatch(
        displayToast({
          title: "Session Expired",
          message: "Please Login Again",
          type: "info",
          duration: 4000,
          position: "bottom-center",
        } as ToastData)
      );
      return;
    }

    dispatch(setLoggedInUser(user));
    dispatch(hideDialog());
    dispatch(setSelectedChat(null));
  }, []);

  const getTypingUserName = (typingUser: UserType) =>
    truncateString(typingUser?.name?.toString().split(" ")[0], 12, 9) || " ";

  const getTypingChatId = (chatUser: string) =>
    chatUser?.toString().split("---")[0];

  const displayInfo = (message = "Operation Executed") => {
    dispatch(
      displayToast({
        message,
        type: "info",
        duration: 5000,
        position: "bottom-center",
      } as ToastData)
    );
  };

  const groupSocketEventHandlers = () => {
    clientSocket
      .off("display_updated_grp")
      .on(
        "display_updated_grp",
        (updatedGroupData: {
          updatedGroup: ChatType;
          createdAdmin: UserType;
          dismissedAdmin: UserType;
        }) => {
          const { updatedGroup, createdAdmin, dismissedAdmin } =
            updatedGroupData;
          dispatch(toggleRefresh());
          if (!updatedGroup) return;
          const { _id, chatName, removedUser } = updatedGroup;
          const isLoggedInUserRemoved = removedUser?._id === loggedInUser?._id;
          const isGroupInfoDialogOpen =
            dialogData.isOpen && dialogData.title === "Group Info";

          if (selectedChat?._id === _id) {
            let groupData = updatedGroup as ChatType;
            if (isLoggedInUserRemoved) {
              dispatch(hideDialog());
              groupData = null;
            }
            dispatch(setSelectedChat(groupData));
            dispatch(setGroupInfo(groupData as ChatType));
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
        }
      );

    clientSocket
      .off("remove_deleted_grp")
      .on("remove_deleted_grp", (deletedGroup: ChatType) => {
        dispatch(toggleRefresh());
        if (!deletedGroup) return;
        if (selectedChat?._id === deletedGroup?._id) {
          dispatch(hideDialog());
          dispatch(setSelectedChat(null));
          dispatch(setGroupInfo(null));
        }
        displayInfo(`'${deletedGroup.chatName}' Group Deleted by Admin`);
      });

    clientSocket.off("display_new_grp").on("display_new_grp", () => {
      dispatch(toggleRefresh());
    });
  };

  const typingSocketEventHandler = () => {
    clientSocket
      .off("display_typing")
      .on("display_typing", (chat: ChatType, typingUser: UserType) => {
        if (!chat || !typingUser) return;
        setTypingChatUsers([
          ...typingChatUsers,
          `${chat._id}---${getTypingUserName(typingUser)}---${
            typingUser.profilePic
          }---${chat.isGroupChat}`,
        ]);
      });

    clientSocket
      .off("hide_typing")
      .on("hide_typing", (chat: ChatType, typingUser: UserType) => {
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

  const deletePersistedNotifs = async (notifsToBeDeleted: string[]) => {
    const config = getAxiosConfig({ loggedInUser });
    try {
      await axios.put(
        `/api/user/delete/notifications`,
        { notificationIds: JSON.stringify(notifsToBeDeleted) },
        config as AxiosRequestConfig
      );
    } catch (error) {
      console.log("Couldn't Delete Notifications : ", (error as Error).message);
    }
  };

  const deleteNotifications = (clickedChatId: string) => {
    // Delete notifs from global state and localStorage
    const notifs = [...(loggedInUser?.notifications as MessageType[])];
    const notifsToBeDeleted = [];
    if (!notifs) return;
    for (let i = 0; i < notifs.length; ++i) {
      if ((notifs[i]?.chat as ChatType)?._id === clickedChatId) {
        const deletedNotif = notifs.splice(i, 1)[0];
        notifsToBeDeleted.push(deletedNotif?._id);
        // After deleting element at 'i', next element (i+1) shifts back
        // to 'i' index
        --i;
      }
    }
    const updatedUser = { ...loggedInUser, notifications: notifs };
    localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
    dispatch(setLoggedInUser(updatedUser as UserType));

    // Delete notifs that were persisted in mongodb
    deletePersistedNotifs(notifsToBeDeleted as string[]);
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
              typingChatUser={
                typingChatUsers.find(
                  (u) => getTypingChatId(u) === selectedChat?._id
                ) as string
              }
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
