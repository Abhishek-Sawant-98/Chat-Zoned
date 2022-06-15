import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppState } from "../context/ContextProvider";
import ChatpageHeader from "../components/ChatpageHeader";
import CustomDialog from "../components/utils/CustomDialog";

const ChatsPage = () => {
  const {
    setLoggedInUser,
    dialogBody,
    dialogData,
    handleDialogClose,
    showDialogActions,
  } = AppState();

  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("loggedInUser"));
    if (!user) return navigate("/");
    setLoggedInUser(user);
  }, []);

  return (
    <div className={`chatpage`}>
      {/* Header component */}
      <ChatpageHeader></ChatpageHeader>

      {/* Chat List component */}

      {/* Chat Messages component */}

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
