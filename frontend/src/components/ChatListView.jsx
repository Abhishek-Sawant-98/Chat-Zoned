import React from "react";
import { AppState } from "../context/ContextProvider";

const ChatListView = () => {
  const { selectedChat } = AppState();
  return (
    <div
      className={`chatpageDiv chatpageView chatListView col-md-5 col-lg-4 ms-md-2 p-2 text-light ${
        selectedChat ? "d-none d-md-flex" : "d-flex"
      } flex-column`}
    >
      ChatListView
    </div>
  );
};

export default ChatListView;
