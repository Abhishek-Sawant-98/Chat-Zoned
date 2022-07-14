import { useEffect, useRef, useState } from "react";
import { Avatar, IconButton } from "@mui/material";
import { AppState } from "../context/ContextProvider";
import { getOneOnOneChatReceiver, truncateString } from "../utils/appUtils";
import { ArrowBack, AttachFile, Close, Send } from "@mui/icons-material";
import getCustomTooltip from "./utils/CustomTooltip";
import animationData from "../animations/letsChatGif.json";
import LottieAnimation from "./utils/LottieAnimation";
import axios from "../utils/axios";
import ViewProfileBody from "./dialogs/ViewProfileBody";
import GroupInfoBody from "./dialogs/GroupInfoBody";
import LoadingMsgs from "./utils/LoadingMsgs";
import FullSizeImage from "./utils/FullSizeImage";
import Message from "./utils/Message";
import MsgOptionsMenu from "./menus/MsgOptionsMenu";
import io from "socket.io-client";

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

// const SOCKET_ENDPOINT = "http://localhost:5000";
const SOCKET_ENDPOINT = "https://chat-zoned.herokuapp.com";

const clientSocket = io(SOCKET_ENDPOINT, { transports: ["websocket"] });

const MessagesView = ({
  loadingMsgs,
  setLoadingMsgs,
  fetchMsgs,
  setFetchMsgs,
}) => {
  const letsChatGif = useRef(null);

  const {
    formClassNames,
    selectedChat,
    loggedInUser,
    displayToast,
    setSelectedChat,
    setGroupInfo,
    refresh,
    setRefresh,
    displayDialog,
    setDialogBody,
    setShowDialogActions,
  } = AppState();

  const { disableIfLoading, setLoading } = formClassNames;

  const closeChat = () => {
    setLoadingMsgs(false);
    setSelectedChat(null);
    resetMsgInput();
  };
  const [sending, setSending] = useState(false);
  const [enableMsgSend, setEnableMsgSend] = useState(false);
  const [messages, setMessages] = useState([]);
  const [clickedMsg, setClickedMsg] = useState("");
  const [newMsgData, setNewMsgData] = useState({
    attachment: null,
    attachmentPreviewUrl: "",
  });
  const msgListBottom = useRef(null);
  const msgFileInput = useRef(null);
  const msgContent = useRef(null);
  const [msgOptionsMenuAnchor, setMsgOptionsMenuAnchor] = useState(null);

  const chatName = selectedChat?.isGroupChat
    ? selectedChat?.chatName
    : getOneOnOneChatReceiver(loggedInUser, selectedChat?.users)?.name;

  const viewAudio = (audioSrc, fileName) => {
    if (!audioSrc) return;
    setShowDialogActions(false);
    setDialogBody(<FullSizeImage audioSrc={audioSrc} />);
    displayDialog({
      title: fileName || "Audio File",
    });
  };

  const viewVideo = (videoSrc, fileName) => {
    if (!videoSrc) return;
    setShowDialogActions(false);
    setDialogBody(<FullSizeImage videoSrc={videoSrc} />);
    displayDialog({
      title: fileName || "Video File",
    });
  };

  const fetchMessages = async () => {
    setLoadingMsgs(true);

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
        data.map((msg) => {
          msg["sent"] = true;
          return msg;
        })
      );
      setLoadingMsgs(false);
      if (fetchMsgs) setFetchMsgs(false);
      setSending(false);
    } catch (error) {
      displayToast({
        title: "Couldn't Fetch Messages",
        message: error.response?.data?.message || error.message,
        type: "error",
        duration: 5000,
        position: "bottom-center",
      });
      setLoadingMsgs(false);
      if (fetchMsgs) setFetchMsgs(false);
      setSending(false);
    }
  };

  const sendMessage = async () => {
    if (!newMsgData.attachment && !msgContent.current?.innerHTML) return;

    const msgData = {
      ...newMsgData,
      content:
        msgContent.current?.innerHTML ||
        newMsgData?.attachment?.name ||
        "No content",
    };

    const newMsg = {
      _id: new Date().getTime(),
      sender: {
        _id: loggedInUser?._id,
        profilePic: "",
        name: "",
        email: "",
      },
      fileUrl: msgData?.attachmentPreviewUrl,
      file_id: "",
      file_name: msgData?.attachment?.name,
      content: msgData?.content,
      createdAt: new Date().toISOString(),
      sent: false,
    };

    setMessages([newMsg, ...messages]);
    resetMsgInput();
    setSending(true);
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${loggedInUser.token}`,
      },
    };

    try {
      // Upload img/gif to cloudinary, and all other files to aws s3
      const apiUrl = /(\.png|\.jpg|\.jpeg|\.gif|\.svg)$/.test(
        msgData.attachment?.name
      )
        ? `/api/message`
        : `/api/message/upload-to-s3`;

      const formData = new FormData();
      formData.append("attachment", msgData.attachment);
      formData.append("content", msgData.content);
      formData.append("chatId", selectedChat?._id);
      const { data } = await axios.post(apiUrl, formData, config);

      clientSocket?.emit("new msg sent", data);
      fetchMessages();
      setRefresh(!refresh);
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

  const deleteMessage = async () => {
    setLoading(true);
    setSending(true);

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loggedInUser.token}`,
      },
    };

    try {
      await axios.put(
        `/api/message/delete`,
        {
          messageIds: JSON.stringify([clickedMsg]),
        },
        config
      );

      clientSocket?.emit("msg deleted", {
        deletedMsgId: clickedMsg,
        senderId: loggedInUser?._id,
        chat: selectedChat,
      });
      displayToast({
        message: "Message Deleted Successfully",
        type: "success",
        duration: 3000,
        position: "bottom-center",
      });
      setMessages(messages.filter((msg) => msg?._id !== clickedMsg));
      setLoading(false);
      setRefresh(!refresh);
      return "msgActionDone";
    } catch (error) {
      displayToast({
        title: "Couldn't Delete Message",
        message: error.response?.data?.message || error.message,
        type: "error",
        duration: 4000,
        position: "top-center",
      });
      setLoading(false);
      setSending(false);
    }
  };

  const updateMessage = async () => {};

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
    setEnableMsgSend(true);
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
    setEnableMsgSend(false);
    msgContent.current.innerHTML = "";
    msgFileInput.current.value = "";
  };

  const scrollToBottom = () => {
    msgListBottom.current?.scrollIntoView({ behaviour: "smooth" });
  };

  // Socket client config
  useEffect(() => {
    if (!clientSocket)
      return console.log("socket not defined : ", clientSocket);

    clientSocket.emit("init user", loggedInUser?._id);
    clientSocket.on("user connected", () => {
      console.log("socket connected");
    });
  }, []);

  // Listening to socket events
  useEffect(() => {
    if (!clientSocket)
      return console.log("socket not defined : ", clientSocket);

    clientSocket.on("new msg received", (newMsg) => {
      setRefresh(!refresh);
      if (selectedChat) setMessages([newMsg, ...messages]);
    });

    clientSocket.on("remove deleted msg", (deletedMsgId) => {
      setRefresh(!refresh);
      if (selectedChat)
        setMessages(messages.filter((msg) => msg?._id !== deletedMsgId));
    });

    clientSocket.on("update updated msg", (updatedMsg) => {
      setRefresh(!refresh);
      if (selectedChat)
        setMessages(
          messages.map((msg) => {
            return msg?._id === updatedMsg?._id ? updatedMsg : msg;
          })
        );
    });
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (fetchMsgs) {
      fetchMessages();
      clientSocket?.emit("join chat", selectedChat?._id);
    }
  }, [fetchMsgs]);

  const openViewProfileDialog = (props) => {
    setShowDialogActions(false);
    setDialogBody(props ? <ViewProfileBody {...props} /> : <ViewProfileBody />);
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

  // Open delete photo confirm dialog
  const openDeleteMsgConfirmDialog = () => {
    setShowDialogActions(true);
    setDialogBody(<>Are you sure you want to delete this message?</>);
    displayDialog({
      title: "Delete Message",
      nolabel: "NO",
      yeslabel: "YES",
      loadingYeslabel: "Deleting...",
      action: deleteMessage,
    });
  };

  const openMsgOptionsMenu = (e) => {
    setMsgOptionsMenuAnchor(e.target);
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
          <section className="messagesBody m-1 p-2 position-relative d-flex flex-column">
            {/* Messages list */}
            <div className="messages rounded-3 d-flex flex-column">
              <div
                // Event delegation
                onClick={(e) => {
                  const senderData = e.target?.dataset?.sender?.split("===");
                  const msgId = e.target?.dataset?.msg;
                  if (senderData?.length) {
                    // Open view profile dialog
                    const props = {
                      memberProfilePic: senderData[0],
                      memberName: senderData[1],
                      memberEmail: senderData[2],
                    };
                    return openViewProfileDialog(props);
                  }
                  if (msgId) {
                    setClickedMsg(msgId);
                    openMsgOptionsMenu(e);
                  }
                }}
                className="msgArea overflow-auto d-flex flex-column-reverse"
              >
                <div className="msgListBottom" ref={msgListBottom}></div>
                {loadingMsgs && !sending ? (
                  <LoadingMsgs count={8} />
                ) : (
                  messages.map((m, i, msgs) => (
                    <Message
                      key={m._id}
                      msgSent={m.sent}
                      currMsg={m}
                      prevMsg={i < msgs.length - 1 ? msgs[i + 1] : null}
                    />
                  ))
                )}
              </div>
            </div>
            {/* Edit/Delete Message menu */}
            <MsgOptionsMenu
              anchor={msgOptionsMenuAnchor}
              setAnchor={setMsgOptionsMenuAnchor}
              clickedMsg={clickedMsg}
              openEditMsgDialog={() => {}}
              openDeleteMsgConfirmDialog={openDeleteMsgConfirmDialog}
            />
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
                  disabled={loadingMsgs}
                />
              </span>
              {/* Content/text input */}
              <div
                onInput={(e) => {
                  const input = e.target.innerHTML;
                  setEnableMsgSend(Boolean(input));
                }}
                ref={msgContent}
                className={`msgInput border-0 w-100 text-start ${
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
