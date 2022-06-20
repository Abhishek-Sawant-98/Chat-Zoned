import { GroupAdd, Search } from "@mui/icons-material";
import { CircularProgress, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import { AppState } from "../context/ContextProvider";
import axios from "../utils/axios";
import ChatListItem from "./utils/ChatListItem";
import getCustomTooltip from "./utils/CustomTooltip";
import LoadingIndicator from "./utils/LoadingIndicator";

const arrowStyles = {
  color: "#777",
};
const tooltipStyles = {
  maxWidth: 250,
  color: "#eee",
  fontFamily: "Mirza",
  fontSize: 16,
  backgroundColor: "#777",
};
const CustomTooltip = getCustomTooltip(arrowStyles, tooltipStyles);

const ChatListView = () => {
  const {
    setLoggedInUser,
    formClassNames,
    selectedChat,
    loggedInUser,
    displayToast,
    setSelectedChat,
    chats,
    setChats,
    refresh,
  } = AppState();

  const { disableIfLoading, formFieldClassName, inputFieldClassName } =
    formClassNames;

  const [loading, setLoading] = useState(false);

  const fetchChats = async () => {
    setLoading(true);

    const config = {
      headers: {
        Authorization: `Bearer ${loggedInUser?.token}`,
      },
    };

    try {
      const { data } = await axios.get(`/api/chat`, config);

      setChats(data);
      setLoading(false);
      console.log("Chats : ", data);
    } catch (error) {
      displayToast({
        title: "Couldn't Fetch Chats",
        message: error.response?.data?.message || "Oops! Server Down",
        type: "error",
        duration: 5000,
        position: "bottom-center",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [refresh]);

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
              className={`btnCreateGroup pointer btn btn-outline-secondary text-light px-3`}
              onClick={() => {}}
            >
              <GroupAdd />
            </button>
          </CustomTooltip>
        </p>
      </section>
      {/* Search Bar */}
      {chats?.length > 0 && (
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
              placeholder="Search Chat"
              id="searchChatInput"
              className={`${inputFieldClassName.replace(
                "text-center",
                "text-start"
              )} border-start-0 rounded-start d-inline-block`}
              style={{ cursor: "auto", fontSize: "17px" }}
            />
          </div>
        </section>
      )}
      {/* Chat list */}
      <section className="chatList m-1 p-1 overflow-auto position-relative">
        {loading ? (
          <LoadingIndicator
            message={"Fetching Chats..."}
            msgStyleClasses={"text-light h3"}
          />
        ) : chats?.length > 0 ? (
          <div
            // 'Event delegation' (add only one event listener for
            // parent element instead of adding for each child element)
            onClick={(e) => {
              const chatId = e.target.dataset.chat;
              if (chatId)
                setSelectedChat(chats.find((chat) => chat._id === chatId));
            }}
          >
            {chats.map((chat) => (
              <ChatListItem key={chat._id} chat={chat} />
            ))}
          </div>
        ) : (
          <>No Chats Found</>
        )}
      </section>
    </div>
  );
};

export default ChatListView;
