import { useEffect, useRef, useState } from "react";
import { Avatar, IconButton } from "@mui/material";
import { AppState } from "../context/ContextProvider";
import { getOneOnOneChatReceiver, truncateString } from "../utils/appUtils";
import {
  ArrowBack,
  AttachFile,
  Close,
  Search,
  Send,
} from "@mui/icons-material";
import getCustomTooltip from "./utils/CustomTooltip";
import animationData from "../animations/letsChatGif.json";
import LottieAnimation from "./utils/LottieAnimation";
import axios from "../utils/axios";
import ViewProfileBody from "./dialogs/ViewProfileBody";
import GroupInfoBody from "./dialogs/GroupInfoBody";
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
const iconStyles = {
  margin: "4px 0px",
  padding: "5px",
  color: "#999999",
  ":hover": {
    backgroundColor: "#aaaaaa20",
  },
};
const CustomTooltip = getCustomTooltip(arrowStyles, tooltipStyles);

const MessagesView = ({ fetchMsgs, setFetchMsgs }) => {
  const letsChatGif = useRef(null);

  const {
    formClassNames,
    selectedChat,
    loggedInUser,
    displayToast,
    setSelectedChat,
    setShowDialogActions,
    setDialogBody,
    displayDialog,
    setGroupInfo,
  } = AppState();

  const { disableIfLoading } = formClassNames;

  const closeChat = () => {
    setSelectedChat(null);
    resetMsgInput();
  };
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enableMsgSend, setEnableMsgSend] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMsgData, setNewMsgData] = useState({
    attachment: null,
    attachmentPreviewUrl: "",
  });
  const msgListBottom = useRef(null);
  const msgFileInput = useRef(null);
  const msgContent = useRef(null);

  const chatName = selectedChat?.isGroupChat
    ? selectedChat?.chatName
    : getOneOnOneChatReceiver(loggedInUser, selectedChat?.users)?.name;

  const fetchMessages = async () => {
    setLoading(true);

    const config = {
      headers: {
        Authorization: `Bearer ${loggedInUser.token}`,
      },
    };

    try {
      const { data } = await axios.get(
        `/api/message/${selectedChat?._id}`,
        config
      );
      setMessages(
        data.messages?.map((m) => {
          return {
            ...m,
            fileUrl: !m.fileUrl
              ? null
              : m.fileUrl.startsWith("https://res.cloudinary.com")
              ? m.fileUrl
              : `${data.baseUrl}${m.fileUrl}`,
          };
        })
      );
      setLoading(false);
      if (fetchMsgs) setFetchMsgs(false);
    } catch (error) {
      displayToast({
        title: "Couldn't Fetch Messages",
        message: error.response?.data?.message || error.message,
        type: "error",
        duration: 5000,
        position: "bottom-center",
      });
      setLoading(false);
      if (fetchMsgs) setFetchMsgs(false);
    }
  };

  const sendMessage = async () => {
    console.log("sending message");
    resetMsgInput();
    if (!newMsgData.attachment || msgContent.current?.innerText) return;

    setSending(true);
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${loggedInUser.token}`,
      },
    };

    try {
      const formData = new FormData();
      formData.append("attachment", newMsgData.attachment);
      formData.append("content", newMsgData.content);
      formData.append("chatId", selectedChat?._id);
      await axios.post(`/api/message`, formData, config);

      setSending(false);
      fetchMessages();
    } catch (error) {
      displayToast({
        title: "Couldn't Send Messages",
        message: error.response?.data?.message || error.message,
        type: "error",
        duration: 5000,
        position: "bottom-center",
      });
      setSending(false);
    }
  };

  const handleMsgFileInputChange = (e) => {
    const msgFile = e.target.files[0];
    if (!msgFile) return;

    if (msgFile.size >= 3145728) {
      msgFileInput.current.value = "";
      return displayToast({
        message: "Please Select a File Smaller than 3 MB",
        type: "warning",
        duration: 4000,
        position: "top-center",
      });
    }
    setNewMsgData({
      ...newMsgData,
      attachment: msgFile,
      attachmentPreviewUrl: URL.createObjectURL(msgFile),
    });
  };

  const resetMsgInput = () => {
    setNewMsgData({
      attachment: null,
      attachmentPreviewUrl: "",
    });
    msgContent.current.innerHTML = "";
    msgFileInput.current.value = "";
  };

  const scrollToBottom = () => {
    msgListBottom.current?.scrollIntoView({ behaviour: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (fetchMsgs) fetchMessages();
  }, [fetchMsgs]);

  const openViewProfileDialog = () => {
    setShowDialogActions(false);
    setDialogBody(<ViewProfileBody />);
    displayDialog({
      title: "View Profile",
    });
  };

  const openGroupInfoDialog = () => {
    // Open group info dialog
    setGroupInfo(selectedChat);
    setShowDialogActions(false);
    setDialogBody(<GroupInfoBody messages={messages} />);
    displayDialog({
      title: "Group Info",
    });
  };

  return (
    <div
      className={`chatpageDiv chatpageView messagesView col text-light mx-0 mx-md-1 ${
        selectedChat ? "d-flex" : "d-none d-md-flex"
      } flex-column p-2 user-select-none`}
    >
      {selectedChat ? (
        <>
          <section className="messagesHeader d-flex justify-content-start position-relative w-100 fw-bold fs-4 bg-info bg-opacity-10 py-2">
            <CustomTooltip title="Go Back" placement="bottom-start" arrow>
              <IconButton
                onClick={closeChat}
                className={`d-flex d-md-none ms-3`}
                sx={{
                  color: "#999999",
                  ":hover": {
                    backgroundColor: "#aaaaaa20",
                  },
                }}
              >
                <ArrowBack />
              </IconButton>
            </CustomTooltip>
            <CustomTooltip
              title={selectedChat?.isGroupChat ? "Group Info" : "View Profile"}
              placement="bottom-start"
              arrow
            >
              <IconButton
                sx={{
                  margin: "-8px",
                  ":hover": {
                    backgroundColor: "#aaaaaa20",
                  },
                }}
                className="pointer ms-1 ms-md-4"
                onClick={
                  selectedChat?.isGroupChat
                    ? openGroupInfoDialog
                    : openViewProfileDialog
                }
              >
                <Avatar
                  src={
                    selectedChat?.isGroupChat
                      ? selectedChat?.chatDisplayPic
                      : getOneOnOneChatReceiver(
                          loggedInUser,
                          selectedChat?.users
                        )?.profilePic || ""
                  }
                  alt={"receiverAvatar"}
                />
              </IconButton>
            </CustomTooltip>

            <span className="ms-3 mt-1 text-info" title={chatName}>
              {truncateString(chatName, 22, 17)}
            </span>

            <CustomTooltip title="Close Chat" placement="bottom-end" arrow>
              <IconButton
                onClick={closeChat}
                className="d-none d-md-flex"
                sx={{
                  position: "absolute",
                  right: 15,
                  top: 8,
                  color: "#999999",
                  ":hover": {
                    backgroundColor: "#aaaaaa20",
                  },
                }}
              >
                <Close />
              </IconButton>
            </CustomTooltip>
          </section>
          <section className="messagesBody m-1 p-2 position-relative">
            {/* Messages list */}
            <div className="messages d-flex flex-column justify-content-end">
              {loading ? (
                <>
                  <LoadingIndicator
                    message={"Fetching Messages..."}
                    msgStyleClasses={"text-light h3"}
                  />
                </>
              ) : (
                <div className="overflow-auto">
                  {messages.map((m) => (
                    <div
                      key={m._id}
                      className={`d-flex justify-content-${
                        m.sender._id === loggedInUser._id ? "end" : "start"
                      }`}
                    >
                      <span
                        className={`d-inline-block border mx-4 mx-md-5 my-1`}
                      >
                        {m.content}
                      </span>
                    </div>
                  ))}
                  <div className="msgListBottom" ref={msgListBottom}></div>
                </div>
              )}
            </div>

            {/* New Message Input */}
            <div className="msgInputDiv d-flex position-absolute">
              <span
                className={`d-inline-block attachFile ${disableIfLoading} pointer bg-dark`}
              >
                <CustomTooltip
                  title="Attach File"
                  placement="bottom-start"
                  arrow
                >
                  <IconButton
                    onClick={() => {
                      msgFileInput.current?.click();
                    }}
                    className={`d-flex ms-2 my-1`}
                    sx={{ ...iconStyles, transform: "rotateZ(45deg)" }}
                  >
                    <AttachFile style={{ fontSize: 22 }} />
                  </IconButton>
                </CustomTooltip>
                {/* Attachment File input */}
                <input
                  type="file"
                  accept="*"
                  onChange={handleMsgFileInputChange}
                  name="attachment"
                  id="attachMsgFile"
                  ref={msgFileInput}
                  className={`d-none`}
                  disabled={loading}
                />
              </span>
              {/* Content/text input */}
              <div
                onInput={(e) => {
                  const input = e.target.textContent;
                  setEnableMsgSend(Boolean(input));
                }}
                ref={msgContent}
                className={`msgInput ${
                  !enableMsgSend ? "disabledSend" : ""
                } d-flex bg-dark px-3 py-2 justify-content-start`}
                contentEditable={true}
              ></div>
              {/* Send button */}
              <span
                className={`d-inline-block sendButton ${disableIfLoading} pointer bg-dark`}
              >
                {enableMsgSend ? (
                  <IconButton
                    onClick={sendMessage}
                    className={`d-flex my-1 mx-2 mx-md-3`}
                    sx={iconStyles}
                  >
                    <Send style={{ fontSize: 20 }} />
                  </IconButton>
                ) : (
                  <></>
                )}
              </span>
            </div>
          </section>
        </>
      ) : (
        <div className="d-flex flex-column justify-content-start align-items-center h-100">
          <h2 className="mx-3 mt-1">
            Hello{" "}
            <span
              className="fw-bold"
              style={{ color: "#A798F2" }}
            >{`${loggedInUser?.name?.split(" ")[0]?.toUpperCase()}`}</span>{" "}
            👋
          </h2>
          <LottieAnimation
            ref={letsChatGif}
            className={"d-inline-block mt-3"}
            style={{ marginBottom: "50px", height: "50%" }}
            animationData={animationData}
          />
          <p
            className="h4 mx-5"
            style={{ marginTop: "-20px", color: "#99C5EE" }}
          >
            Search or Click a Chat, Search a User, or Create a Group to start or
            open a chat.
          </p>
          <p className="h2" style={{ color: "#99C5EE" }}>
            Happy Chatting!😀
          </p>
        </div>
      )}
    </div>
  );
};

export default MessagesView;
