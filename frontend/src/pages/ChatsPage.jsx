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
    selectedChat,
  } = AppState();

  const navigate = useNavigate();

  useEffect(() => {
    // Session storage persists data even after page refresh, unlike state
    const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
    if (!user) return navigate("/");
    setLoggedInUser(user);
  }, []);

  useEffect(() => {}, [selectedChat]);
  const [fetchMsgs, setFetchMsgs] = useState(false);

  return (
    <>
      {loggedInUser && (
        <div className={`chatpage`}>
          {/* Header component */}
          <ChatpageHeader />

          <section className={`row g-1`}>
            {/* Chat List component */}
            <ChatListView setFetchMsgs={setFetchMsgs} />

            {/* Chat Messages component */}
            <MessagesView fetchMsgs={fetchMsgs} setFetchMsgs={setFetchMsgs} />
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
