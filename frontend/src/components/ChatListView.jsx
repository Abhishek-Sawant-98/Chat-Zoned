import { GroupAdd } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import {
  debounce,
  getAxiosConfig,
  getOneToOneChatReceiver,
  truncateString,
} from "../utils/appUtils";
import axios from "../utils/axios";
import AddMembersToGroup from "./dialogs/AddMembersToGroup";
import ChatListItem from "./utils/ChatListItem";
import getCustomTooltip from "./utils/CustomTooltip";
import FullSizeImage from "./utils/FullSizeImage";
import LoadingList from "./utils/LoadingList";
import SearchInput from "./utils/SearchInput";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAppState,
  setGroupInfo,
  setSelectedChat,
} from "../store/slices/AppSlice";
import {
  displayDialog,
  setShowDialogActions,
} from "../store/slices/CustomDialogSlice";
import { displayToast } from "../store/slices/ToastSlice";
import GettingStarted from "./GettingStarted";

const DEFAULT_GROUP_DP = process.env.REACT_APP_DEFAULT_GROUP_DP;

const arrowStyles = { color: "#666" };
const tooltipStyles = {
  maxWidth: 250,
  color: "#eee",
  fontFamily: "Trebuchet MS",
  fontSize: 16,
  padding: "5px 12px",
  backgroundColor: "#666",
};
const CustomTooltip = getCustomTooltip(arrowStyles, tooltipStyles);

const ChatListView = ({
  chats,
  setChats,
  loadingMsgs,
  setFetchMsgs,
  setDialogBody,
  typingChatUsers,
  deleteNotifications,
}) => {
  const { loggedInUser, selectedChat, refresh } = useSelector(selectAppState);
  const notifs = [...loggedInUser?.notifications];
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [filteredChats, setFilteredChats] = useState(chats);
  const searchChatInput = useRef();

  const openCreateGroupChatDialog = () => {
    dispatch(
      setGroupInfo({
        chatDisplayPic: null,
        chatDisplayPicUrl: DEFAULT_GROUP_DP,
        chatName: "",
        users: [],
      })
    );
    dispatch(setShowDialogActions(true));
    setDialogBody(<AddMembersToGroup forCreateGroup={true} />);
    dispatch(
      displayDialog({
        title: "Add Group Members",
        nolabel: "Cancel",
        yeslabel: "Next",
        action: null,
      })
    );
  };

  const displayFullSizeImage = (e) => {
    dispatch(setShowDialogActions(false));
    setDialogBody(<FullSizeImage event={e} />);
    dispatch(
      displayDialog({
        isFullScreen: true,
        title: e.target?.alt || "Display Pic",
      })
    );
  };

  const fetchChats = async () => {
    const config = getAxiosConfig({ loggedInUser });
    try {
      const { data } = await axios.get(`/api/chat`, config);

      const mappedChats = data
        .map((chat) => {
          const { isGroupChat, users } = chat;

          if (!isGroupChat) {
            const receiver = getOneToOneChatReceiver(loggedInUser, users);
            chat["chatName"] = receiver?.name;
            chat["receiverEmail"] = receiver?.email;
            chat["chatDisplayPic"] = receiver?.profilePic;
          }
          return chat;
        })
        .filter((chat) => chat.lastMessage !== undefined || chat.isGroupChat);

      setChats(mappedChats);
      setFilteredChats(mappedChats);
      if (loading) setLoading(false);
    } catch (error) {
      dispatch(
        displayToast({
          title: "Couldn't Fetch Chats",
          message: error.response?.data?.message || error.message,
          type: "error",
          duration: 5000,
          position: "bottom-center",
        })
      );
      if (loading) setLoading(false);
    }
  };

  // Debouncing filterChats method to limit the no. of fn calls
  const searchChats = debounce((e) => {
    const chatNameInput = e.target.value?.toLowerCase().trim();
    if (!chatNameInput) return setFilteredChats(chats);
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
      className={`chatpageDiv chatpageView chatListView text-light ${
        selectedChat ? "d-none d-md-flex" : "d-flex"
      } flex-column user-select-none mx-1 p-2 ${
        loadingMsgs ? "pe-none" : "pe-auto"
      }`}
    >
      <section className="position-relative">
        <p className="chatListHeader fw-bold fs-4 rounded-pill bg-info bg-opacity-10 py-2">
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
          <LoadingList listOf="Chat" dpRadius={"49px"} count={8} />
        ) : filteredChats?.length > 0 ? (
          <div
            // 'Event delegation' (add only one event listener for
            // parent element instead of adding for each child element)
            onClick={(e) => {
              const { dataset } = e.target;
              const parentDataset = e.target.parentNode.dataset;
              const clickedChatId = dataset.chat || parentDataset.chat;
              const hasNotifs = dataset.hasNotifs || parentDataset.hasNotifs;
              if (!clickedChatId) return;

              if (e.target.className?.toString().includes("MuiAvatar-img")) {
                return displayFullSizeImage(e);
              }
              const clickedChat = filteredChats.find(
                (chat) => chat._id === clickedChatId
              );
              if (clickedChat._id === selectedChat?._id) return;
              dispatch(setSelectedChat(clickedChat));
              setFetchMsgs(true); // To fetch selected chat msgs
              if (clickedChat?.isGroupChat) dispatch(setGroupInfo(clickedChat));

              // Delete notifications if notif badge is present
              if (hasNotifs) deleteNotifications(clickedChatId);
            }}
          >
            {filteredChats.map((chat) => {
              let chatNotifCount = 0;
              notifs?.forEach((notif) => {
                if (notif.chat._id === chat._id) ++chatNotifCount;
              });
              return (
                <ChatListItem
                  key={chat._id}
                  chat={chat}
                  chatNotifCount={chatNotifCount || ""}
                  typingChatUser={typingChatUsers?.find(
                    (u) => u?.toString()?.split("---")[0] === chat._id
                  )}
                />
              );
            })}
          </div>
        ) : (
          <>
            <span className="d-inline-block w-100 text-light fs-3 mt-4 mx-auto">
              {chats?.length === 0
                ? `Hi ${
                    truncateString(loggedInUser?.name?.split(" ")[0], 12, 9) ||
                    "There"
                  } 😎`
                : "No Chats Found"}
            </span>
            {chats?.length === 0 && <GettingStarted />}
          </>
        )}
      </section>
    </div>
  );
};

export default ChatListView;
