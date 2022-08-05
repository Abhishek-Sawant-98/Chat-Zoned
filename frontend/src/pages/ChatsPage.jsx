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
  const { loggedInUser, refresh, clientSocket, selectedChat } =
    useSelector(selectAppState);
  const { dialogData, showDialogActions } = useSelector(
    selectCustomDialogState
  );

  const dispatch = useDispatch();

  const navigate = useNavigate();
  const [fetchMsgs, setFetchMsgs] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [dialogBody, setDialogBody] = useState(<></>);
  const [chats, setChats] = useState([]);

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

  // Listening to socket events
  useEffect(() => {
    if (!clientSocket) return;

    clientSocket
      .off("display updated grp")
      .on("display updated grp", (updatedGroup) => {
        dispatch(toggleRefresh(!refresh));
        if (!updatedGroup || !selectedChat) return;
        if (selectedChat._id === updatedGroup._id) {
          let groupData = updatedGroup;
          if (updatedGroup.removedUser?._id === loggedInUser._id) {
            dispatch(hideDialog());
            groupData = null;
          }
          dispatch(setSelectedChat(groupData));
          dispatch(setGroupInfo(groupData));
        }
      });

    clientSocket
      .off("remove deleted grp")
      .on("remove deleted grp", (deletedGroup) => {
        dispatch(toggleRefresh(!refresh));
        if (!deletedGroup || !selectedChat) return;
        if (selectedChat._id === deletedGroup._id) {
          dispatch(hideDialog());
          dispatch(setSelectedChat(null));
          dispatch(setGroupInfo(null));
          dispatch(
            displayToast({
              message: `'${deletedGroup.chatName}' Group Deleted by Admin`,
              type: "info",
              duration: 4000,
              position: "bottom-center",
            })
          );
        }
      });

    clientSocket.off("display new grp").on("display new grp", () => {
      dispatch(toggleRefresh(!refresh));
    });
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
            />

            {/* Chat Messages component */}
            <MessagesView
              loadingMsgs={loadingMsgs}
              setLoadingMsgs={setLoadingMsgs}
              fetchMsgs={fetchMsgs}
              setFetchMsgs={setFetchMsgs}
              setDialogBody={setDialogBody}
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
