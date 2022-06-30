import { Close, GroupAdd, Search } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import { AppState } from "../context/ContextProvider";
import {
  debounce,
  DEFAULT_GROUP_DP,
  getOneOnOneChatReceiver,
} from "../utils/appUtils";
import axios from "../utils/axios";
import AddMembersToGroup from "./dialogs/AddMembersToGroup";
import ChatListItem from "./utils/ChatListItem";
import getCustomTooltip from "./utils/CustomTooltip";
import FullSizeImage from "./utils/FullSizeImage";
import LoadingIndicator from "./utils/LoadingIndicator";
import SearchInput from "./utils/SearchInput";

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
    setSelectedChat,
    displayDialog,
    displayToast,
    setDialogBody,
    setShowDialogActions,
    chats,
    setChats,
    refresh,
    setRefresh,
    setGroupInfo,
  } = AppState();

  const [loading, setLoading] = useState(false);
  const [filteredChats, setFilteredChats] = useState(chats);
  const searchChatInput = useRef();

  const openCreateGroupChatDialog = () => {
    setGroupInfo({
      chatDisplayPic: null,
      chatDisplayPicUrl: DEFAULT_GROUP_DP,
      chatName: "",
      users: [],
    });
    setShowDialogActions(true);
    setDialogBody(<AddMembersToGroup forCreateGroup={true} />);
    displayDialog({
      title: "Add Group Members",
      nolabel: "Cancel",
      yeslabel: "Next",
      action: null,
    });
  };

  const displayFullSizeImage = (e) => {
    setShowDialogActions(false);
    setDialogBody(<FullSizeImage event={e} />);
    displayDialog({
      title: e.target?.alt || "Display Pic",
    });
  };

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
      console.log("chats : ", mappedChats);
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

  // Debouncing filterChats method to limit the no. of fn calls
  const searchChats = debounce((e) => {
    const chatNameInput = e.target?.value?.toLowerCase().trim();
    if (!chatNameInput) {
      return setFilteredChats(chats);
    }
    setFilteredChats(
      chats.filter((chat) =>
        chat?.chatName?.toLowerCase().includes(chatNameInput)
      )
    );
  }, 600);

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
              onClick={openCreateGroupChatDialog}
            >
              <GroupAdd />
            </button>
          </CustomTooltip>
        </p>
      </section>
      {/* Search Bar */}
      {chats?.length > 0 && (
        <section className="searchChat">
          <SearchInput
            ref={searchChatInput}
            searchHandler={searchChats}
            autoFocus={false}
            placeholder="Search Chat"
            clearInput={() => setFilteredChats(chats)}
          />
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
              const chatId = e.target?.dataset?.chat;
              if (!chatId) return;

              if (e.target?.className?.includes("chatListAvatar")) {
                return displayFullSizeImage(e);
              }
              const clickedChat = filteredChats.find(
                (chat) => chat._id === chatId
              );
              setSelectedChat(clickedChat);
              if (clickedChat?.isGroupChat) setGroupInfo(clickedChat);
            }}
          >
            {filteredChats
              .filter((chat) => chat.lastMessage !== undefined)
              .map((chat) => (
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
