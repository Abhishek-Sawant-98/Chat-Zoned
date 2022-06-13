import { useEffect, useState } from "react";
import axios from "../config/axios";
import { useNavigate, useLocation } from "react-router-dom";
import { AppState } from "../context/ContextProvider";
import ChatpageHeader from "../components/ChatpageHeader";
import CustomDialog from "../components/CustomDialog";

const ChatsPage = () => {
  const { loggedInUser, setLoggedInUser, dialogBody } = AppState();

  const navigate = useNavigate();
  const location = useLocation().pathname;

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
      <CustomDialog>{dialogBody}</CustomDialog>
    </div>
  );
};

export default ChatsPage;
