import React from "react";
import { AppState } from "../context/ContextProvider";

const MessagesView = () => {
  const { selectedChat } = AppState();
  return (
    <div
      className={`chatpageDiv chatpageView messagesView col text-light ms-2 ms-md-0 ${
        selectedChat ? "d-flex" : "d-none d-md-flex"
      } flex-column`}
    >
      MessagesView
    </div>
  );
};

export default MessagesView;
