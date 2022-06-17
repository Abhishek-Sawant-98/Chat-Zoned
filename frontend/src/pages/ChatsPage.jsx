import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppState } from "../context/ContextProvider";
import ChatpageHeader from "../components/ChatpageHeader";
import CustomDialog from "../components/utils/CustomDialog";
import ChatListView from "../components/ChatListView";
import MessagesView from "../components/MessagesView";

const ChatsPage = () => {
  const {
    setLoggedInUser,
    dialogBody,
    dialogData,
    handleDialogClose,
    showDialogActions,
    selectedChat,
  } = AppState();

  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
    if (!user) return navigate("/");
    setLoggedInUser(user);
  }, []);

  useEffect(() => {}, [selectedChat]);

  return (
    <div className={`chatpage`}>
      {/* Header component */}
      <ChatpageHeader />

      <section className={`row g-1`}>
        {/* Chat List component */}
        <ChatListView />

        {/* Chat Messages component */}
        <MessagesView />
      </section>

      {/* Alert dialog */}
      <CustomDialog
        dialogData={dialogData}
        handleDialogClose={handleDialogClose}
        showDialogActions={showDialogActions}
      >
        {dialogBody}
      </CustomDialog>
    </div>
  );
};

export default ChatsPage;
