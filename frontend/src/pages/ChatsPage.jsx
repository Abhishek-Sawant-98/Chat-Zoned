import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppState } from "../context/ContextProvider";
import ChatpageHeader from "../components/ChatpageHeader";
import CustomDialog from "../components/utils/CustomDialog";
import ChatListView from "../components/ChatListView";
import MessagesView from "../components/MessagesView";

const ChatsPage = () => {
  const {
    loggedInUser,
    setLoggedInUser,
    dialogBody,
    dialogData,
    closeDialog,
    showDialogActions,
    setSelectedChat,
    socket,
  } = AppState();

  const navigate = useNavigate();
  const [fetchMsgs, setFetchMsgs] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  useEffect(() => {
    // Session storage persists data even after page refresh, unlike state
    const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
    if (!user) return navigate("/");
    setLoggedInUser(user);
    closeDialog();
    setSelectedChat(null);
  }, []);

  // Socket client config
  useEffect(() => {
    socket.emit("init user", loggedInUser?._id);
    socket.on("user connected", () => {
      console.log("socket connected");
    });
  }, []);

  return (
    <>
      {loggedInUser && (
        <div className={`chatpage`}>
          {/* Header component */}
          <ChatpageHeader setFetchMsgs={setFetchMsgs} />

          <section className={`row g-1`}>
            {/* Chat List component */}
            <ChatListView
              loadingMsgs={loadingMsgs}
              setFetchMsgs={setFetchMsgs}
            />

            {/* Chat Messages component */}
            <MessagesView
              loadingMsgs={loadingMsgs}
              setLoadingMsgs={setLoadingMsgs}
              fetchMsgs={fetchMsgs}
              setFetchMsgs={setFetchMsgs}
            />
          </section>

          {/* Alert dialog */}
          <CustomDialog
            dialogData={dialogData}
            handleDialogClose={closeDialog}
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
