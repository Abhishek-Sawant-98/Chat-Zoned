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
  setGroupInfo,
  setLoggedInUser,
  setSelectedChat,
  toggleRefresh,
} from "../store/slices/AppSlice";
import {
  hideDialog,
  selectCustomDialogState,
} from "../store/slices/CustomDialogSlice";

const ChatsPage = () => {
  const {
    loggedInUser,
    refresh,
    clientSocket,
    selectedChat,
    isSocketConnected,
  } = useSelector(selectAppState);
  const { dialogData, showDialogActions } = useSelector(
    selectCustomDialogState
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [fetchMsgs, setFetchMsgs] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [dialogBody, setDialogBody] = useState(<></>);
  const [chats, setChats] = useState([]);
  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
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
          `${chat._id}---${typingUser.name || ""}`,
        ]);
        if (selectedChat && selectedChat._id === chat._id) {
          setTypingUser(typingUser);
          setTyping(true);
        }
      });

    clientSocket.off("hide typing").on("hide typing", (chat, typingUser) => {
      if (!chat || !typingUser) return;
      setTypingChatUsers([
        typingChatUsers.filter(
          (chatUser) => chatUser !== `${chat._id}---${typingUser.name || ""}`
        ),
      ]);
      if (selectedChat && selectedChat._id === chat._id) {
        setTyping(false);
      }
    });
  };

  // Listening to socket events
  useEffect(() => {
    if (!clientSocket || !isSocketConnected) return;
    groupSocketEventHandlers();
    typingSocketEventHandler();
  });

  return (
    <>
      {loggedInUser && (
        <div className={`chatpage`}>
          {/* Header component */}
          <ChatpageHeader
            chats={chats}
            setFetchMsgs={setFetchMsgs}
            setDialogBody={setDialogBody}
          />

          <section className={`row g-1`}>
            {/* Chat List component */}
            <ChatListView
              chats={chats}
              setChats={setChats}
              loadingMsgs={loadingMsgs}
              setFetchMsgs={setFetchMsgs}
              setDialogBody={setDialogBody}
              typingChatUsers={typingChatUsers}
            />

            {/* Chat Messages component */}
            <MessagesView
              loadingMsgs={loadingMsgs}
              setLoadingMsgs={setLoadingMsgs}
              fetchMsgs={fetchMsgs}
              setFetchMsgs={setFetchMsgs}
              setDialogBody={setDialogBody}
              isNewUser={chats?.length === 0}
              typing={typing}
              typingUser={typingUser}
            />
          </section>

          {/* Alert dialog */}
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
