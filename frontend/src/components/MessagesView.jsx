import { useEffect, useRef, useState } from "react";
import { IconButton } from "@mui/material";
import {
  debounce,
  FIVE_MB,
  getAxiosConfig,
  isImageOrGifFile,
  parseInnerHTML,
  setCaretPosition,
} from "../utils/appUtils";
import { AttachFile, EmojiEmotions, Send } from "@mui/icons-material";
import getCustomTooltip from "./utils/CustomTooltip";
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
  setLoggedInUser,
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
import WelcomeBanner from "./WelcomeBanner";
import MsgsHeader from "./MsgsHeader";
import TypingIndicator from "./utils/TypingIndicator";
import EmojiPicker from "emoji-picker-react";

const arrowStyles = { color: "#111" };
const tooltipStyles = {
  maxWidth: 230,
  color: "#eee",
  fontFamily: "Trebuchet MS",
  fontSize: 16,
  padding: "5px 10px",
  borderRadius: 5,
  border: "1px solid #555",
  backgroundColor: "#111",
};
const iconStyles = {
  margin: "4px 0px",
  padding: "5px",
  color: "#999999",
  ":hover": { backgroundColor: "#aaaaaa20" },
};

const CustomTooltip = getCustomTooltip(arrowStyles, tooltipStyles);
const SOCKET_ENDPOINT = process.env.REACT_APP_SERVER_BASE_URL;
let msgFileAlreadyExists = false;
let currentlyTyping = false;
let preventStopTyping = true;

const MessagesView = ({
  loadingMsgs,
  setLoadingMsgs,
  fetchMsgs,
  setFetchMsgs,
  setDialogBody,
  deletePersistedNotifs,
  deleteNotifications,
  isNewUser,
  typingChatUser,
}) => {
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
  const [msgFileRemoved, setMsgFileRemoved] = useState(false);
  const [enableMsgSend, setEnableMsgSend] = useState(false);
  const [fileAttached, setFileAttached] = useState(false);
  const [messages, setMessages] = useState([]);
  const [clickedMsgId, setClickedMsgId] = useState("");
  const [dontScrollToBottom, setDontScrollToBottom] = useState(false);
  const [attachmentData, setAttachmentData] = useState({
    attachment: null,
    attachmentPreviewUrl: "",
  });
  const msgListBottom = useRef(null);
  const msgFileInput = useRef(null);
  const msgContent = useRef(null);
  const editableMsgContent = useRef(null);
  const [downloadingFileId, setDownloadingFileId] = useState("");
  const [loadingMediaId, setLoadingMediaId] = useState("");
  const [msgEditMode, setMsgEditMode] = useState(false);
  const [msgOptionsMenuAnchor, setMsgOptionsMenuAnchor] = useState(null);

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

  // Emoji picker config
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const onEmojiIconClick = () => {
    preventStopTyping = true;
    setShowEmojiPicker(!showEmojiPicker);
  };
  const hideEmojiPicker = () => {
    if (showEmojiPicker) setShowEmojiPicker(false);
  };
  const onEmojiClick = (event, emojiObject) => {
    msgContent.current.innerHTML += emojiObject.emoji;
    setCaretPosition(msgContent.current);
    setEnableMsgSend(true);
  };

  const selectAttachment = () => {
    preventStopTyping = true;
    hideEmojiPicker();
    msgFileInput.current?.click();
  };

  const discardAttachment = () =>
    resetMsgInput({ discardAttachmentOnly: true });

  const persistUpdatedUser = (updatedUser) => {
    // localStorage persists updated user even after page refresh
    localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
    dispatch(setLoggedInUser(updatedUser));
  };

  const displayError = (
    error = "Oops! Something went wrong",
    title = "Operation Failed"
  ) => {
    dispatch(
      displayToast({
        title,
        message: error.response?.data?.message || error.message,
        type: "error",
        duration: 5000,
        position: "bottom-center",
      })
    );
  };

  const displaySuccess = (message = "Operation Successful") => {
    dispatch(
      displayToast({
        message,
        type: "success",
        duration: 1500,
        position: "bottom-center",
      })
    );
  };

  const closeChat = () => {
    setLoadingMsgs(false);
    dispatch(setSelectedChat(null));
    resetMsgInput();
    setMsgFileRemoved(false);
    setMsgEditMode(false);
    setDontScrollToBottom(false);
  };

  const viewMedia = (src, fileData) => {
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
        isFullScreen: true,
        title: fileName || `${isAudio ? "Audio" : "Video"} File`,
      })
    );
    setLoadingMediaId("");
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

  const loadMedia = async (fileId, options) => {
    if (!fileId || !options) return;
    setLoadingMediaId(fileId);
    const { fileName, isAudio } = options;
    const config = getAxiosConfig({ loggedInUser, blob: true });
    try {
      const { data } = await axios.get(`/api/message/files/${fileId}`, config);

      const mediaSrc = URL.createObjectURL(new Blob([data]));
      viewMedia(mediaSrc, { fileName, isAudio });
    } catch (error) {
      displayError(error, "Couldn't Load Media");
      setLoadingMediaId("");
    }
  };

  const downloadFile = async (fileId) => {
    if (!fileId) return;
    setDownloadingFileId(fileId);
    setSending(true);
    const config = getAxiosConfig({ loggedInUser, blob: true });
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
      displayError(error, "Couldn't Download File");
      setDownloadingFileId("");
      setSending(false);
    }
  };

  const fetchMessages = async (options) => {
    setLoadingMsgs(true);
    const config = getAxiosConfig({ loggedInUser });
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
      if (options?.updatingMsg) displaySuccess("Message Updated Successfully");
      setSending(false);
    } catch (error) {
      displayError(error, "Couldn't Fetch Messages");
      setLoadingMsgs(false);
      if (fetchMsgs) setFetchMsgs(false);
      setSending(false);
    }
  };

  const sendMessage = async () => {
    preventStopTyping = false;
    emitStopTyping();
    hideEmojiPicker();
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
          msgData?.mediaDuration
            ? `===${msgData.mediaDuration}`
            : isNonImageFile
            ? `===${msgData.attachment?.size || ""}`
            : ""
        }`,
      content: msgData?.content,
      createdAt: new Date().toISOString(),
      sent: false,
    };
    setDontScrollToBottom(false);
    setMessages([newMsg, ...messages]);
    resetMsgInput();
    setSending(true);
    const config = getAxiosConfig({ loggedInUser, formData: true });

    try {
      // Upload img/gif to cloudinary, and all other files to aws s3
      const apiUrl = isNonImageFile
        ? `/api/message/upload-to-s3`
        : `/api/message/`;

      const formData = new FormData();
      formData.append("attachment", msgData.attachment);
      formData.append("mediaDuration", msgData?.mediaDuration);
      formData.append("content", msgData.content);
      formData.append("chatId", selectedChat?._id);
      const { data } = await axios.post(apiUrl, formData, config);

      if (isSocketConnected) clientSocket?.emit("new msg sent", data);
      fetchMessages();
      dispatch(toggleRefresh(!refresh));
    } catch (error) {
      displayError(error, "Couldn't Send Message");
      setSending(false);
    }
  };

  const deleteMessage = async () => {
    dispatch(setLoading(true));
    setSending(true);
    const config = getAxiosConfig({ loggedInUser });

    try {
      await axios.put(
        `/api/message/delete`,
        { messageIds: JSON.stringify([clickedMsgId]) },
        config
      );
      if (isSocketConnected) {
        clientSocket?.emit("msg deleted", {
          deletedMsgId: clickedMsgId,
          senderId: loggedInUser?._id,
          chat: selectedChat,
        });
      }
      displaySuccess("Message Deleted Successfully");
      setMessages(messages.filter((msg) => msg?._id !== clickedMsgId));
      dispatch(setLoading(false));
      dispatch(toggleRefresh(!refresh));
      setSending(false);
      return "msgActionDone";
    } catch (error) {
      displayError(error, "Couldn't Delete Message");
      dispatch(setLoading(false));
      setSending(false);
    }
  };

  const updateMessage = async (updatedMsgContent, msgDate) => {
    if (
      !(
        attachmentData.attachment ||
        (msgFileAlreadyExists && !msgFileRemoved)
      ) &&
      !parseInnerHTML(updatedMsgContent)
    ) {
      return dispatch(
        displayToast({
          message: "A Message Must Contain Either a File or some Text Content",
          type: "warning",
          duration: 5000,
          position: "top-center",
        })
      );
    }
    setMsgEditMode(false);
    setDontScrollToBottom(true);

    const msgData = {
      ...attachmentData,
      content: updatedMsgContent || "",
    };
    const isNonImageFile = !isImageOrGifFile(msgData.attachment?.name);

    const updatedMsg = {
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
          msgData?.mediaDuration
            ? `===${msgData.mediaDuration}`
            : isNonImageFile
            ? `===${msgData.attachment?.size || ""}`
            : ""
        }`,
      content: msgData?.content,
      createdAt: msgDate,
      sent: false,
    };
    setMessages(
      messages.map((msg) => (msg._id === clickedMsgId ? updatedMsg : msg))
    );
    discardAttachment();
    setSending(true);
    const config = getAxiosConfig({ loggedInUser, formData: true });

    try {
      // Upload img/gif to cloudinary, and all other files to aws s3
      const apiUrl = isNonImageFile
        ? `/api/message/update-in-s3`
        : `/api/message/update`;

      const formData = new FormData();
      formData.append("attachment", msgData.attachment);
      formData.append("msgFileRemoved", msgFileRemoved);
      formData.append("mediaDuration", msgData?.mediaDuration);
      formData.append("updatedContent", msgData.content);
      formData.append("messageId", clickedMsgId);
      const { data } = await axios.put(apiUrl, formData, config);

      if (isSocketConnected) clientSocket?.emit("msg updated", data);
      fetchMessages({ updatingMsg: true });
      dispatch(toggleRefresh(!refresh));
      setMsgFileRemoved(false);
    } catch (error) {
      displayError(error, "Couldn't Update Message");
      setSending(false);
      setMsgFileRemoved(false);
    }
  };

  const editMsgHandler = () => setMsgEditMode(true);

  const setMediaDuration = (mediaUrl, msgFile) => {
    const media = new Audio(mediaUrl);
    media.onloadedmetadata = () => {
      const { duration } = media;
      const minutes = parseInt(duration / 60);
      const seconds = parseInt(duration % 60);
      setAttachmentData({
        attachment: msgFile,
        attachmentPreviewUrl: mediaUrl,
        mediaDuration: `${minutes}:${
          seconds < 10 ? `0${seconds}` : seconds
        }+++${msgFile.type}`,
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
    if (/^(video\/|audio\/)/.test(msgFile.type)) {
      setMediaDuration(fileUrl, msgFile);
    } else {
      setAttachmentData({
        attachment: msgFile,
        attachmentPreviewUrl: fileUrl,
      });
      setFileAttached(true);
    }
  };

  const scrollToBottom = () => {
    msgListBottom.current?.scrollIntoView();
  };

  // Initializing Client Socket
  useEffect(() => {
    dispatch(
      setClientSocket(io(SOCKET_ENDPOINT, { transports: ["websocket"] }))
    );
  }, []);

  // Socket event handlers
  const newMsgSocketEventHandler = () => {
    // off() prevents on() from executing multiple times
    clientSocket
      .off("new msg received")
      .on("new msg received", (newMsg, notifications) => {
        const { chat } = newMsg;
        dispatch(toggleRefresh(!refresh));
        if (selectedChat && chat && selectedChat._id === chat._id) {
          newMsg["sent"] = true;
          setMessages([newMsg, ...messages]);
          deletePersistedNotifs([newMsg._id]);
        } else {
          const updatedUser = {
            ...loggedInUser,
            notifications: notifications?.reverse(),
          };
          persistUpdatedUser(updatedUser);
        }
      });
  };

  const deletedMsgSocketEventHandler = () => {
    clientSocket
      .off("remove deleted msg")
      .on("remove deleted msg", (deletedMsgData) => {
        const { deletedMsgId, chat } = deletedMsgData;
        dispatch(toggleRefresh(!refresh));
        if (selectedChat && chat && selectedChat._id === chat._id) {
          setMessages(messages.filter((m) => m?._id !== deletedMsgId));
        } else {
          // Remove notification of 'deleted msg' from global state
          // and localStorage
          const notifs = loggedInUser.notifications;
          const updatedUser = {
            ...loggedInUser,
            notifications: notifs.filter((n) => n._id !== deletedMsgId),
          };
          persistUpdatedUser(updatedUser);
        }
      });
  };

  const updatedMsgSocketEventHandler = () => {
    clientSocket
      .off("update modified msg")
      .on("update modified msg", (updatedMsg) => {
        if (!updatedMsg) return;
        const { chat } = updatedMsg;
        dispatch(toggleRefresh(!refresh));
        if (selectedChat && chat && selectedChat._id === chat._id) {
          updatedMsg["sent"] = true;
          updatedMsg["chat"] = updatedMsg.chat?._id;
          setTimeout(() => {
            // Only updating msg content using 'document' method
            // as updating 'messages' state will re-render all
            // msgs and scroll to bottom, which may prevent the
            // receiver to edit or view his/her msg, causing bad UX
            if (parseInnerHTML(updatedMsg.content)) {
              document.getElementById(`${updatedMsg._id}---content`).innerHTML =
                updatedMsg.content;
            }
          }, 10);
          // Updating 'state' is the only way to update attachment
        }
      });
  };

  // Listening to all socket events
  useEffect(() => {
    if (!clientSocket) return;

    if (!isSocketConnected && clientSocket) {
      clientSocket.emit("init user", loggedInUser?._id);
      clientSocket.on("user connected", () => {
        // console.log("socket connected");
        dispatch(setSocketConnected(true));
      });
    }
    newMsgSocketEventHandler();
    deletedMsgSocketEventHandler();
    updatedMsgSocketEventHandler();
  });

  // Discard msg update draft
  const discardMsgDraft = () => {
    discardAttachment();
    setMsgEditMode(false);
    setSending(true);
    setMessages([]);
    // To execute after the entire code is run
    setTimeout(() => {
      setMessages(messages);
      setSending(false);
      // To execute after all the messages have been mapped
      setTimeout(() => {
        document.getElementById(clickedMsgId)?.scrollIntoView();
      }, 10);
    }, 0);
    setMsgFileRemoved(false);
    return "msgActionDone";
  };

  // Open discard draft confirm dialog
  const openDiscardDraftConfirmDialog = () => {
    dispatch(setShowDialogActions(true));
    setDialogBody(<>Are you sure you want to discard this draft?</>);
    dispatch(
      displayDialog({
        title: "Discard Draft",
        nolabel: "NO",
        yeslabel: "YES",
        loadingYeslabel: "Discarding...",
        action: discardMsgDraft,
      })
    );
  };

  // Message input handlers
  const emitTyping = () => {
    if (isSocketConnected && !currentlyTyping) {
      clientSocket?.emit("typing", selectedChat, loggedInUser);
      currentlyTyping = true;
    }
  };

  const emitStopTyping = () => {
    if (isSocketConnected && currentlyTyping) {
      clientSocket?.emit("stop typing", selectedChat, loggedInUser);
      currentlyTyping = false;
    }
  };

  const onInputFocus = () => {
    preventStopTyping = false;
  };

  const onInputBlur = () => {
    setTimeout(() => {
      if (!preventStopTyping) emitStopTyping();
    }, 1000);
  };

  const msgInputHandler = debounce((e) => {
    const isNonEmptyInput = Boolean(parseInnerHTML(e.target.innerHTML));
    setEnableMsgSend(isNonEmptyInput);
    if (!isNonEmptyInput) emitStopTyping();
    if (isNonEmptyInput) emitTyping();
  }, 500);

  const msgKeydownHandler = (e) => {
    hideEmojiPicker();
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      (enableMsgSend || fileAttached || msgEditMode)
    ) {
      e.preventDefault();
      if (msgEditMode) {
        const msgDate =
          e.target.dataset.msgCreatedAt ||
          e.target.parentNode.dataset.msgCreatedAt;
        updateMessage(editableMsgContent?.current?.innerHTML, msgDate);
      } else {
        sendMessage();
      }
    }
  };

  // Msgs click handler ('Event Delegation' applied here)
  const msgsClickHandler = (e) => {
    const { dataset } = e.target;
    const parentDataset = e.target.parentNode.dataset;
    const senderData = (dataset.sender || parentDataset.sender)?.split("===");
    const msgId = dataset.msg || parentDataset.msg;
    const videoId = dataset.video || parentDataset.video;
    const audioId = dataset.audio || parentDataset.audio;
    const fileId = dataset.download || parentDataset.download;
    const updateEditedMsg = dataset.updateMsg || parentDataset.updateMsg;
    const attachMsgFileClicked =
      dataset.attachMsgFile || parentDataset.attachMsgFile;
    const removeMsgFileClicked =
      dataset.removeMsgFile || parentDataset.removeMsgFile;
    const editMsgFileClicked = dataset.editMsgFile || parentDataset.editMsgFile;
    const discardDraftClicked =
      dataset.discardDraft || parentDataset.discardDraft;

    hideEmojiPicker();
    if (fileId) {
      downloadFile(fileId);
    } else if (videoId) {
      // Load video
      loadMedia(videoId, {
        fileName: dataset.videoName || parentDataset.videoName,
        isAudio: false,
      });
    } else if (audioId) {
      // Load audio
      loadMedia(audioId, {
        fileName: dataset.audioName || parentDataset.audioName,
        isAudio: true,
      });
    } else if (dataset.imageId) {
      displayFullSizeImage(e);
    } else if (senderData?.length) {
      // Open view profile dialog
      const props = {
        memberProfilePic: senderData[0],
        memberName: senderData[1],
        memberEmail: senderData[2],
      };
      openViewProfileDialog(props);
    } else if (msgId && !msgEditMode) {
      msgFileAlreadyExists = Boolean(
        dataset.fileExists || parentDataset.fileExists
      );
      setClickedMsgId(msgId);
      openMsgOptionsMenu(e);
    } else if (attachMsgFileClicked || editMsgFileClicked) {
      selectAttachment();
    } else if (removeMsgFileClicked) {
      setMsgFileRemoved(true);
      discardAttachment();
    } else if (discardDraftClicked) {
      openDiscardDraftConfirmDialog();
    } else if (updateEditedMsg) {
      const msgDate = dataset.msgCreatedAt || parentDataset.msgCreatedAt;
      updateMessage(editableMsgContent?.current?.innerHTML, msgDate);
    }
  };

  useEffect(() => {
    if (!dontScrollToBottom) scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (fetchMsgs) {
      fetchMessages();
      if (isSocketConnected) clientSocket?.emit("join chat", selectedChat?._id);
    }
  }, [fetchMsgs]);

  const openViewProfileDialog = (props) => {
    dispatch(setShowDialogActions(false));
    setDialogBody(props ? <ViewProfileBody {...props} /> : <ViewProfileBody />);
    dispatch(displayDialog({ title: "View Profile" }));
  };

  const openGroupInfoDialog = () => {
    // Open group info dialog
    dispatch(setGroupInfo(selectedChat));
    dispatch(setShowDialogActions(false));
    setDialogBody(
      <GroupInfoBody
        messages={messages}
        setFetchMsgs={setFetchMsgs}
        deleteNotifications={deleteNotifications}
      />
    );
    dispatch(displayDialog({ title: "Group Info" }));
  };

  // Open delete msg confirm dialog
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

  useEffect(() => {
    if (msgContent?.current) msgContent.current.innerHTML = "";
  }, [selectedChat]);

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
          <MsgsHeader
            closeChat={closeChat}
            openGroupInfoDialog={openGroupInfoDialog}
            openViewProfileDialog={openViewProfileDialog}
            hideEmojiPicker={hideEmojiPicker}
            CustomTooltip={CustomTooltip}
          />
          <section
            className={`messagesBody position-relative ${
              downloadingFileId || loadingMediaId ? "pe-none" : "pe-auto"
            } d-flex flex-column m-1 p-2`}
            onClick={(e) => {
              const { dataset } = e.target;
              const parentDataset = e.target.parentNode.dataset;
              const discardFileClicked =
                dataset.discardFile || parentDataset.discardFile;
              if (discardFileClicked) discardAttachment();
            }}
          >
            {/* Messages list */}
            <div className="messages rounded-3 d-flex flex-column">
              <div
                // Event delegation
                onClick={msgsClickHandler}
                onKeyDown={msgKeydownHandler}
                className={`msgArea overflow-auto ${
                  fileAttached && !msgEditMode ? "d-none" : "d-flex"
                } flex-column-reverse`}
              >
                <div className="msgListBottom" ref={msgListBottom}></div>
                {loadingMsgs && !sending ? (
                  <LoadingMsgs count={8} />
                ) : (
                  messages.map((m, i, msgs) => (
                    <Message
                      downloadingFileId={downloadingFileId}
                      loadingMediaId={loadingMediaId}
                      msgEditMode={msgEditMode}
                      clickedMsgId={clickedMsgId}
                      msgFileRemoved={msgFileRemoved}
                      attachmentData={attachmentData}
                      ref={editableMsgContent}
                      CustomTooltip={CustomTooltip}
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
              clickedMsg={clickedMsgId}
              editMsgHandler={editMsgHandler}
              openDeleteMsgConfirmDialog={openDeleteMsgConfirmDialog}
            />
            {fileAttached && !msgEditMode && (
              <AttachmentPreview
                attachmentData={attachmentData}
                discardAttachment={discardAttachment}
                CustomTooltip={CustomTooltip}
              />
            )}
            {/* Typing indicator */}
            <span className={`${typingChatUser ? "d-inline-block" : "d-none"}`}>
              <TypingIndicator
                typingChatUser={typingChatUser}
                showAvatar={true}
              />
            </span>
            {/* New Message Input */}
            <div
              className={`msgInputDiv d-flex position-absolute ${
                msgEditMode || sending ? "pe-none" : "pe-auto"
              }`}
            >
              <span
                className={`d-flex attachFile ${disableIfLoading} pointer bg-dark`}
              >
                <IconButton
                  onClick={onEmojiIconClick}
                  className={`d-flex ms-2 me-1 my-1`}
                  sx={iconStyles}
                >
                  <EmojiEmotions style={{ fontSize: 28 }} />
                </IconButton>
                <CustomTooltip title="Attach File" placement="top-start" arrow>
                  <IconButton
                    onClick={selectAttachment}
                    className={`d-flex my-2`}
                    sx={{ ...iconStyles, transform: "rotateZ(45deg)" }}
                  >
                    <AttachFile style={{ fontSize: 22 }} />
                  </IconButton>
                </CustomTooltip>
                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <span className="emojiPicker position-absolute start-0">
                    <EmojiPicker
                      onEmojiClick={onEmojiClick}
                      disableAutoFocus={true}
                      native={true}
                      searchPlaceholder={"Search an emoji..."}
                    />
                  </span>
                )}
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
                onFocus={onInputFocus}
                onBlur={onInputBlur}
                onInput={msgInputHandler}
                onKeyDown={msgKeydownHandler}
                onClick={hideEmojiPicker}
                ref={msgContent}
                className={`msgInput ${
                  fileAttached && !msgEditMode ? "addCaption" : ""
                } w-100 text-start d-flex bg-dark px-2 justify-content-start`}
                contentEditable={true}
                style={{
                  borderRadius:
                    enableMsgSend || (fileAttached && !msgEditMode)
                      ? "0px"
                      : "0px 7px 7px 0px",
                }}
              ></div>
              {/* Send button */}
              {enableMsgSend || (fileAttached && !msgEditMode) ? (
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
        <WelcomeBanner isNewUser={isNewUser} />
      )}
    </div>
  );
};

export default MessagesView;
