import { useEffect, useRef, useState } from "react";
import { Avatar, IconButton } from "@mui/material";
import {
  debounce,
  FIVE_MB,
  getOneOnOneChatReceiver,
  isImageOrGifFile,
  truncateString,
} from "../utils/appUtils";
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
import { useDispatch, useSelector } from "react-redux";
import {
  selectAppState,
  setClientSocket,
  setGroupInfo,
  setSelectedChat,
  setSocketConnected,
  toggleRefresh,
} from "../store/slices/AppSlice";
import {
  selectFormfieldState,
  setLoading,
} from "../store/slices/FormfieldSlice";
import { displayToast } from "../store/slices/ToastSlice";
import {
  displayDialog,
  setShowDialogActions,
} from "../store/slices/CustomDialogSlice";
import AttachmentPreview from "./utils/AttachmentPreview";

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
const SOCKET_ENDPOINT = process.env.REACT_APP_SERVER_BASE_URL;

const MessagesView = ({
  loadingMsgs,
  setLoadingMsgs,
  fetchMsgs,
  setFetchMsgs,
  setDialogBody,
}) => {
  const letsChatGif = useRef(null);
  const {
    loggedInUser,
    selectedChat,
    refresh,
    clientSocket,
    isSocketConnected,
  } = useSelector(selectAppState);
  const { disableIfLoading } = useSelector(selectFormfieldState);
  const dispatch = useDispatch();
  const [sending, setSending] = useState(false);
  const [enableMsgSend, setEnableMsgSend] = useState(false);
  const [fileAttached, setFileAttached] = useState(false);
  const [messages, setMessages] = useState([]);
  const [clickedMsg, setClickedMsg] = useState("");
  const [attachmentData, setAttachmentData] = useState({
    attachment: null,
    attachmentPreviewUrl: "",
  });

  const msgListBottom = useRef(null);
  const msgFileInput = useRef(null);
  const msgContent = useRef(null);
  const [downloadingFileId, setDownloadingFileId] = useState("");
  const [msgOptionsMenuAnchor, setMsgOptionsMenuAnchor] = useState(null);

  const chatName = selectedChat?.isGroupChat
    ? selectedChat?.chatName
    : getOneOnOneChatReceiver(loggedInUser, selectedChat?.users)?.name;

  const resetMsgInput = (options) => {
    setAttachmentData({
      attachment: null,
      attachmentPreviewUrl: "",
    });
    msgFileInput.current.value = "";
    setFileAttached(false);
    if (options?.discardAttachmentOnly) return;
    setEnableMsgSend(false);
    msgContent.current.innerHTML = "";
  };

  const closeChat = () => {
    setLoadingMsgs(false);
    dispatch(setSelectedChat(null));
    resetMsgInput();
  };

  const viewAudioOrVideo = (src, fileData) => {
    if (!src || !fileData) return;
    const { fileName, isAudio } = fileData;
    dispatch(setShowDialogActions(false));
    setDialogBody(
      <FullSizeImage
        audioSrc={isAudio ? src : null}
        videoSrc={!isAudio ? src : null}
      />
    );
    dispatch(
      displayDialog({
        title: fileName || `${isAudio ? "Audio" : "Video"} File`,
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

  const downloadFile = async (fileId) => {
    setDownloadingFileId(fileId);
    setSending(true);
    const config = {
      headers: {
        Authorization: `Bearer ${loggedInUser.token}`,
      },
      responseType: "blob",
    };

    try {
      const { data } = await axios.get(`/api/message/files/${fileId}`, config);

      const link = document.createElement("a");
      link.href = URL.createObjectURL(new Blob([data]));
      link.setAttribute("download", fileId.split("---")[1] || fileId);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setDownloadingFileId("");
      setSending(false);
    } catch (error) {
      dispatch(
        displayToast({
          title: "Couldn't Download File",
          message: error.response?.data?.message || error.message,
          type: "error",
          duration: 4000,
          position: "bottom-center",
        })
      );
      setDownloadingFileId("");
      setSending(false);
    }
  };

  const fetchMessages = async () => {
    setLoadingMsgs(true);

    const config = {
      headers: { Authorization: `Bearer ${loggedInUser.token}` },
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
      dispatch(
        displayToast({
          title: "Couldn't Fetch Messages",
          message: error.response?.data?.message || error.message,
          type: "error",
          duration: 5000,
          position: "bottom-center",
        })
      );
      setLoadingMsgs(false);
      if (fetchMsgs) setFetchMsgs(false);
      setSending(false);
    }
  };

  const sendMessage = async () => {
    if (!attachmentData.attachment && !msgContent.current?.innerHTML) return;

    const msgData = {
      ...attachmentData,
      content: msgContent.current?.innerHTML || "",
    };
    const isNonImageFile = !isImageOrGifFile(msgData.attachment?.name);

    const newMsg = {
      _id: Date.now(),
      sender: {
        _id: loggedInUser?._id,
        profilePic: "",
        name: "",
        email: "",
      },
      fileUrl: msgData?.attachmentPreviewUrl,
      file_id: "",
      file_name:
        msgData?.attachment?.name +
        `${
          msgData?.videoDuration
            ? `===${msgData.videoDuration}`
            : isNonImageFile
            ? `===${msgData.attachment?.size || ""}`
            : ""
        }`,
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
      const apiUrl = isNonImageFile
        ? `/api/message/upload-to-s3`
        : `/api/message/`;

      const formData = new FormData();
      formData.append("attachment", msgData.attachment);
      formData.append("videoDuration", msgData?.videoDuration);
      formData.append("content", msgData.content);
      formData.append("chatId", selectedChat?._id);
      const { data } = await axios.post(apiUrl, formData, config);

      clientSocket?.emit("new msg sent", data);
      fetchMessages();
      dispatch(toggleRefresh(!refresh));
    } catch (error) {
      dispatch(
        displayToast({
          title: "Couldn't Send Message",
          message: error.response?.data?.message || error.message,
          type: "error",
          duration: 5000,
          position: "bottom-center",
        })
      );
      setSending(false);
    }
  };

  const deleteMessage = async () => {
    dispatch(setLoading(true));
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
        { messageIds: JSON.stringify([clickedMsg]) },
        config
      );

      clientSocket?.emit("msg deleted", {
        deletedMsgId: clickedMsg,
        senderId: loggedInUser?._id,
        chat: selectedChat,
      });
      dispatch(
        displayToast({
          message: "Message Deleted Successfully",
          type: "success",
          duration: 3000,
          position: "bottom-center",
        })
      );
      setMessages(messages.filter((msg) => msg?._id !== clickedMsg));
      dispatch(setLoading(false));
      dispatch(toggleRefresh(!refresh));
      setSending(false);
      return "msgActionDone";
    } catch (error) {
      dispatch(
        displayToast({
          title: "Couldn't Delete Message",
          message: error.response?.data?.message || error.message,
          type: "error",
          duration: 4000,
          position: "top-center",
        })
      );
      dispatch(setLoading(false));
      setSending(false);
    }
  };

  const updateMessage = async () => {};

  const setVideoDuration = (videoUrl, msgFile) => {
    const media = new Audio(videoUrl);
    media.onloadedmetadata = () => {
      const { duration } = media;
      const minutes = parseInt(duration / 60);
      const seconds = parseInt(duration % 60);
      setAttachmentData({
        attachment: msgFile,
        attachmentPreviewUrl: videoUrl,
        videoDuration: `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`,
      });
      setFileAttached(true);
    };
  };

  const handleMsgFileInputChange = (e) => {
    const msgFile = e.target.files[0];
    if (!msgFile) return;

    if (msgFile.size >= FIVE_MB) {
      msgFileInput.current.value = "";
      return dispatch(
        displayToast({
          message: "Please Select a File Smaller than 5 MB",
          type: "warning",
          duration: 4000,
          position: "top-center",
        })
      );
    }
    const fileUrl = URL.createObjectURL(msgFile);
    if (msgFile.type.startsWith("video/")) {
      setVideoDuration(fileUrl, msgFile);
    } else {
      setAttachmentData({
        attachment: msgFile,
        attachmentPreviewUrl: fileUrl,
      });
      setFileAttached(true);
    }
  };

  const scrollToBottom = () => {
    msgListBottom.current?.scrollIntoView({ behaviour: "smooth" });
  };

  // Socket client config
  useEffect(() => {
    dispatch(
      setClientSocket(io(SOCKET_ENDPOINT, { transports: ["websocket"] }))
    );
  }, []);

  // Listening to socket events
  useEffect(() => {
    if (!clientSocket) return;

    if (!isSocketConnected && clientSocket) {
      clientSocket.emit("init user", loggedInUser?._id);
      clientSocket.on("user connected", () => {
        console.log("socket connected");
        dispatch(setSocketConnected(true));
      });
    }

    // off() prevents on() to execute multiple times
    clientSocket.off("new msg received").on("new msg received", (newMsg) => {
      const { chat } = newMsg;
      dispatch(toggleRefresh(!refresh));
      if (selectedChat && chat && selectedChat._id === chat._id) {
        newMsg["sent"] = true;
        setMessages([newMsg, ...messages]);
      }
    });

    clientSocket
      .off("remove deleted msg")
      .on("remove deleted msg", (deletedMsgData) => {
        const { deletedMsgId, chat } = deletedMsgData;
        dispatch(toggleRefresh(!refresh));
        if (selectedChat && chat && selectedChat._id === chat._id)
          setMessages(messages.filter((msg) => msg?._id !== deletedMsgId));
      });

    clientSocket
      .off("update modified msg")
      .on("update modified msg", (updatedMsg) => {
        const { chat } = updatedMsg;
        dispatch(toggleRefresh(!refresh));
        if (selectedChat && chat && selectedChat._id === chat._id) {
          updatedMsg["sent"] = true;
          setMessages(
            messages.map((msg) => {
              return msg?._id === updatedMsg?._id ? updatedMsg : msg;
            })
          );
        }
      });

    clientSocket.off("display new grp").on("display new grp", () => {
      dispatch(toggleRefresh(!refresh));
    });
  });

  // Message input handlers
  const msgInputHandler = debounce((e) => {
    const input = e.target.innerHTML
      ?.replaceAll("<br>", "")
      .replaceAll("&nbsp;", "")
      .replaceAll("<div>", "")
      .replaceAll("</div>", "")
      .trim();
    setEnableMsgSend(Boolean(input));
  }, 500);

  const msgKeydownHandler = (e) => {
    if (e.key === "Enter" && !e.shiftKey && (enableMsgSend || fileAttached)) {
      e.preventDefault();
      sendMessage();
    }
  };

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
    dispatch(setShowDialogActions(false));
    setDialogBody(props ? <ViewProfileBody {...props} /> : <ViewProfileBody />);
    dispatch(
      displayDialog({
        title: "View Profile",
      })
    );
  };

  const openGroupInfoDialog = () => {
    // Open group info dialog
    dispatch(setGroupInfo(selectedChat));
    dispatch(setShowDialogActions(false));
    setDialogBody(<GroupInfoBody messages={messages} />);
    dispatch(
      displayDialog({
        title: "Group Info",
      })
    );
  };

  // Open delete photo confirm dialog
  const openDeleteMsgConfirmDialog = () => {
    dispatch(setShowDialogActions(true));
    setDialogBody(<>Are you sure you want to delete this message?</>);
    dispatch(
      displayDialog({
        title: "Delete Message",
        nolabel: "NO",
        yeslabel: "YES",
        loadingYeslabel: "Deleting...",
        action: deleteMessage,
      })
    );
  };

  const openMsgOptionsMenu = (e) => {
    if (sending) return;
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

            <span className="ms-3 mt-1 fs-3 text-info" title={chatName}>
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
                  const { dataset } = e.target;
                  const senderData = dataset?.sender?.split("===");
                  const msgId = dataset?.msg;
                  const fileId =
                    dataset?.download || e.target.parentNode.dataset?.download;

                  if (fileId) {
                    downloadFile(fileId);
                  } else if (dataset?.imageId) {
                    displayFullSizeImage(e);
                  } else if (senderData?.length) {
                    // Open view profile dialog
                    const props = {
                      memberProfilePic: senderData[0],
                      memberName: senderData[1],
                      memberEmail: senderData[2],
                    };
                    openViewProfileDialog(props);
                  } else if (msgId) {
                    setClickedMsg(msgId);
                    openMsgOptionsMenu(e);
                  }
                }}
                className={`msgArea overflow-auto ${
                  fileAttached ? "d-none" : "d-flex"
                } flex-column-reverse`}
              >
                <div className="msgListBottom" ref={msgListBottom}></div>
                {loadingMsgs && !sending ? (
                  <LoadingMsgs count={8} />
                ) : (
                  messages.map((m, i, msgs) => (
                    <Message
                      downloadingFileId={downloadingFileId}
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
            {fileAttached && (
              <AttachmentPreview
                attachmentData={attachmentData}
                discardAttachment={() =>
                  resetMsgInput({ discardAttachmentOnly: true })
                }
                CustomTooltip={CustomTooltip}
              />
            )}
            {/* New Message Input */}
            <div className={`msgInputDiv d-flex position-absolute`}>
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
                    className={`d-flex ms-2 my-2`}
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
                onInput={msgInputHandler}
                onKeyDown={msgKeydownHandler}
                ref={msgContent}
                className={`msgInput ${
                  fileAttached ? "addCaption" : ""
                } w-100 text-start d-flex bg-dark px-3 justify-content-start`}
                contentEditable={true}
                style={{
                  borderRadius:
                    enableMsgSend || fileAttached ? "0px" : "0px 7px 7px 0px",
                }}
              ></div>
              {/* Send button */}
              {enableMsgSend || fileAttached ? (
                <span
                  className={`d-inline-block btn btn-dark btn-sm sendButton ${disableIfLoading} pointer`}
                  onClick={sendMessage}
                >
                  <IconButton
                    className={`d-flex my-1 mx-0 mx-md-0`}
                    sx={{ margin: "4px 0px", padding: "5px", color: "#999999" }}
                  >
                    <Send style={{ fontSize: 20 }} />
                  </IconButton>
                </span>
              ) : (
                <></>
              )}
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
