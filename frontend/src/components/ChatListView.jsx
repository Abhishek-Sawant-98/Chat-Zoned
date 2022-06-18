import { GroupAdd, Search } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import React from "react";
import { AppState } from "../context/ContextProvider";
import getCustomTooltip from "./utils/CustomTooltip";

const arrowStyles = {
  color: "#777",
};
const tooltipStyles = {
  maxWidth: 250,
  color: "#eee",
  fontFamily: "Mirza",
  fontSize: 17,
  backgroundColor: "#777",
};
const CustomTooltip = getCustomTooltip(arrowStyles, tooltipStyles);

const ChatListView = () => {
  const {
    formClassNames,
    selectedChat,
    loggedInUser,
    displayToast,
    setSelectedChat,
  } = AppState();

  const {
    loading,
    setLoading,
    disableIfLoading,
    formFieldClassName,
    inputFieldClassName,
  } = formClassNames;

  return (
    <div
      className={`chatpageDiv chatpageView chatListView col-md-5 col-lg-4 ms-md-2 p-2 text-light ${
        selectedChat ? "d-none d-md-flex" : "d-flex"
      } flex-column`}
    >
      <section className="position-relative">
        <p className="chatListHeader fw-bold fs-3 rounded-pill bg-info bg-opacity-10 py-2">
          CHATS
          {/* Create Group Chat */}
          <CustomTooltip
            title="Create New Group Chat"
            placement="bottom-end"
            arrow
          >
            <button
              style={{ borderRadius: "20px" }}
              className={`btnCreateGroup pointer btn btn-outline-secondary text-light px-3`}
              onClick={() => {}}
            >
              <GroupAdd />
            </button>
          </CustomTooltip>
        </p>
      </section>
      {/* Search Bar */}
      <section className={`searchChat ${formFieldClassName} pt-3 pb-2 mx-1`}>
        <div className="input-group">
          <span
            className={`input-group-text ${disableIfLoading} bg-black bg-gradient border-secondary text-light rounded-pill rounded-end border-end-0`}
          >
            <Search className="ms-1" />
          </span>
          <input
            type="text"
            onChange={null}
            autoFocus
            placeholder="Search by User or Chat"
            id="searchChatInput"
            className={`${inputFieldClassName.replace(
              "text-center",
              "text-start"
            )} border-start-0 rounded-start d-inline-block`}
            style={{ cursor: "auto", fontSize: "17px" }}
          />
        </div>
      </section>
    </div>
  );
};

export default ChatListView;
