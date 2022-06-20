import { Close, GroupAdd, Search } from "@mui/icons-material";
import { CircularProgress, IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import { AppState } from "../context/ContextProvider";
import { debounce, getOneOnOneChatReceiver } from "../utils/appUtils";
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
  const [filteredChats, setFilteredChats] = useState(chats);
  const [searchChatInput, setSearchChatInput] = useState("");

  const fetchChats = async () => {
    setLoading(true);

    const config = {
      headers: {
        Authorization: `Bearer ${loggedInUser?.token}`,
      },
    };

    try {
      const { data } = await axios.get(`/api/chat`, config);

      const mappedChats = data.map((chat) => {
        const { isGroupChat, users } = chat;

        if (!isGroupChat) {
          const receiver = getOneOnOneChatReceiver(loggedInUser, users);
          return {
            ...chat,
            chatName: receiver?.name,
            receiverEmail: receiver?.email,
            chatDisplayPic: receiver?.profilePic,
          };
        }
        return chat;
      });
      setChats(mappedChats);
      setFilteredChats(mappedChats);
      setLoading(false);
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

  const debouncedFilterChats = debounce((input) => {
    const chatNameInput = input?.toLowerCase()?.trim();
    if (!chatNameInput) {
      return setFilteredChats(chats);
    }
    setFilteredChats(
      chats?.filter((chat) =>
        chat?.chatName?.toLowerCase()?.includes(chatNameInput)
      )
    );
    console.log(filteredChats);
  }, 3000);

  useEffect(() => {
    fetchChats();
  }, [refresh]);

  return (
    <div
      className={`chatpageDiv chatpageView chatListView col-md-5 col-lg-4 ms-md-2 p-2 text-light ${
        selectedChat ? "d-none d-md-flex" : "d-flex"
      } flex-column user-select-none`}
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
              value={searchChatInput}
              onChange={(e) => {
                const input = e.target.value;
                setSearchChatInput(input);
                debouncedFilterChats(input);
              }}
              autoFocus
              placeholder="Search Chat"
              id="searchChatInput"
              className={`${inputFieldClassName
                .replace("text-center", "text-start")
                .replace(
                  "pill",
                  "0"
                )} border-start-0 border-end-0 d-inline-block`}
              style={{ cursor: "auto", fontSize: "20px" }}
            />
            <span
              className={`input-group-text ${disableIfLoading} bg-black bg-gradient border-secondary text-light rounded-pill rounded-start border-start-0`}
            >
              <IconButton
                onClick={() => {
                  setSearchChatInput("");
                  setFilteredChats(chats);
                }}
                disabled={loading}
                className={`${searchChatInput ? "d-inline-block" : "d-none"}`}
                style={{
                  padding: "0px 9px 2px 9px",
                  margin: "-5px",
                  color: "#999999",
                }}
                sx={{
                  ":hover": {
                    backgroundColor: "#aaaaaa20",
                  },
                }}
              >
                <Close style={{ fontSize: "19px" }} />
              </IconButton>
            </span>
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
        ) : filteredChats?.length > 0 ? (
          <div
            // 'Event delegation' (add only one event listener for
            // parent element instead of adding for each child element)
            onClick={(e) => {
              const chatId = e.target.dataset.chat;
              if (chatId)
                setSelectedChat(
                  filteredChats.find((chat) => chat._id === chatId)
                );
            }}
          >
            {filteredChats.map((chat) => (
              <ChatListItem key={chat._id} chat={chat} />
            ))}
          </div>
        ) : (
          <span className="d-inline-block w-100 text-light h4 mt-5 mx-auto">
            No Chats Found
          </span>
        )}
      </section>
    </div>
  );
};

export default ChatListView;
