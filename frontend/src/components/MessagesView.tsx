import { SetStateAction, useEffect, useRef, useState } from "react";
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
import { io } from "socket.io-client";
import {
  selectAppState,
  setClientSocket,
  setFetchMsgs,
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
import EmojiPicker, { IEmojiData } from "emoji-picker-react";
import {
  AttachmentData,
  AxiosErrorType,
  ChangeEventHandler,
  ChatType,
  ClickEventHandler,
  ErrorType,
  FileData,
  KeyboardEventHandler,
  MessageType,
  ProfileData,
  StateSetter,
  ToastData,
  UserType,
} from "../utils/AppTypes";
import { useAppDispatch, useAppSelector } from "../store/storeHooks";
import { AxiosRequestConfig } from "axios";

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
const SOCKET_ENDPOINT = process.env.REACT_APP_SERVER_BASE_URL as string;
let msgFileAlreadyExists = false;
let currentlyTyping = false;
let preventStopTyping = true;

interface Props {
  loadingMsgs: boolean;
  setLoadingMsgs: StateSetter<boolean>;
  setDialogBody: StateSetter<React.ReactNode>;
  deletePersistedNotifs: any;
  isNewUser: boolean;
  typingChatUser: string;
}

const MessagesView = ({
  loadingMsgs,
  setLoadingMsgs,
  setDialogBody,
  deletePersistedNotifs,
  isNewUser,
  typingChatUser,
}: Props) => {
  const {
    loggedInUser,
    selectedChat,
    fetchMsgs,
    clientSocket,
    isSocketConnected,
  } = useAppSelector(selectAppState);
  const { disableIfLoading } = useAppSelector(selectFormfieldState);
  const dispatch = useAppDispatch();
  const [sending, setSending] = useState(false);
  const [isMsgFileRemoved, setIsMsgFileRemoved] = useState("false");
  const [enableMsgSend, setEnableMsgSend] = useState(false);
  const [fileAttached, setFileAttached] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [clickedMsgId, setClickedMsgId] = useState("");
  const [dontScrollToBottom, setDontScrollToBottom] = useState(false);
  const [attachmentData, setAttachmentData] = useState<AttachmentData>({
    attachment: "",
    attachmentPreviewUrl: "",
  });
  const msgListBottom = useRef<HTMLDivElement | null>(null);
  const msgFileInput = useRef<HTMLInputElement | null>(null);
  const msgContent = useRef<HTMLDivElement | null>(null);
  const editableMsgContent = useRef<React.ReactNode | HTMLElement | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState("");
  const [loadingMediaId, setLoadingMediaId] = useState("");
  const [msgEditMode, setMsgEditMode] = useState(false);
  const [msgOptionsMenuAnchor, setMsgOptionsMenuAnchor] =
    useState<HTMLElement | null>(null);

  const resetMsgInput = (options?: { discardAttachmentOnly: boolean }) => {
    setAttachmentData({
      attachment: "",
      attachmentPreviewUrl: "",
    });
    if (!msgFileInput?.current) return;
    msgFileInput.current.value = "";
    setFileAttached(false);

    if (options?.discardAttachmentOnly) return;
    setEnableMsgSend(false);

    if (!msgContent?.current) return;
    msgContent.current.innerHTML = "";
  };

  // Emoji picker config
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const onEmojiIconClick = () => {
    preventStopTyping = true;
    setShowEmojiPicker(!showEmojiPicker);
    let timeout = setTimeout(() => {
      document
        .querySelector(".emoji-search")
        ?.setAttribute("placeholder", "Search an emoji...");
      clearTimeout(timeout);
    });
  };
  const hideEmojiPicker = () => {
    if (showEmojiPicker) setShowEmojiPicker(false);
  };
  const onEmojiClick = (event: React.MouseEvent, emojiObject: IEmojiData) => {
    if (!msgContent?.current) return;
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

  const persistUpdatedUser = (updatedUser: UserType) => {
    // localStorage persists updated user even after page refresh
    localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
    dispatch(setLoggedInUser(updatedUser));
  };

  const displayError = (
    error: ErrorType = "Oops! Something went wrong",
    title = "Operation Failed"
  ) => {
    dispatch(
      displayToast({
        title,
        message:
          (error as AxiosErrorType).response?.data?.message ||
          (error as Error)?.message ||
          error,
        type: "error",
        duration: 5000,
        position: "bottom-center",
      } as ToastData)
    );
  };

  const displaySuccess = (message = "Operation Successful") => {
    dispatch(
      displayToast({
        message,
        type: "success",
        duration: 1500,
        position: "bottom-center",
      } as ToastData)
    );
  };

  const closeChat = () => {
    setLoadingMsgs(false);
    dispatch(setSelectedChat(null));
    resetMsgInput();
    setIsMsgFileRemoved("false");
    setMsgEditMode(false);
    setDontScrollToBottom(false);
  };

  const viewMedia = (e: React.MouseEvent, src: string, fileData: FileData) => {
    if (!src || !fileData) return;
    const { fileName, isAudio } = fileData;
    dispatch(setShowDialogActions(false));
    setDialogBody(
      <FullSizeImage
        event={e}
        audioSrc={(isAudio ? src : "") as string}
        videoSrc={(!isAudio ? src : "") as string}
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

  const displayFullSizeImage: ClickEventHandler = (e) => {
    dispatch(setShowDialogActions(false));
    setDialogBody(<FullSizeImage event={e} />);
    dispatch(
      displayDialog({
        isFullScreen: true,
        title: (e.target as HTMLImageElement)?.alt || "Display Pic",
      })
    );
  };

  const loadMedia = async (
    e: React.MouseEvent,
    fileId: string,
    options: FileData
  ) => {
    if (!fileId || !options) return;
    setLoadingMediaId(fileId);
    const config = getAxiosConfig({ loggedInUser, blob: true });
    try {
      const { data } = await axios.get(
        `/api/message/files/${fileId}`,
        config as AxiosRequestConfig
      );

      const mediaSrc = URL.createObjectURL(new Blob([data]));
      viewMedia(e, mediaSrc, options);
    } catch (error) {
      displayError(error as ErrorType, "Couldn't Load Media");
      setLoadingMediaId("");
    }
  };

  const downloadFile = async (fileId: string) => {
    if (!fileId) return;
    setDownloadingFileId(fileId);
    setSending(true);
    const config = getAxiosConfig({ loggedInUser, blob: true });
    try {
      const { data } = await axios.get(
        `/api/message/files/${fileId}`,
        config as AxiosRequestConfig
      );

      const link = document.createElement("a");
      link.href = URL.createObjectURL(new Blob([data]));
      link.setAttribute("download", fileId.split("---")[1] || fileId);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setDownloadingFileId("");
      setSending(false);
    } catch (error) {
      displayError(error as ErrorType, "Couldn't Download File");
      setDownloadingFileId("");
      setSending(false);
    }
  };

  const fetchMessages = async (options?: { updatingMsg: boolean }) => {
    setLoadingMsgs(true);
    const config = getAxiosConfig({ loggedInUser });
    try {
      const { data } = await axios.get(
        `/api/message/${selectedChat?._id}`,
        config as AxiosRequestConfig
      );
      setMessages(
        data.map((msg: MessageType) => {
          if (msg) msg["sent"] = true;
          return msg;
        })
      );
      setLoadingMsgs(false);
      if (fetchMsgs) dispatch(setFetchMsgs(false));
      if (options?.updatingMsg) displaySuccess("Message Updated Successfully");
      setSending(false);
    } catch (error) {
      displayError(error as ErrorType, "Couldn't Fetch Messages");
      setLoadingMsgs(false);
      if (fetchMsgs) dispatch(setFetchMsgs(false));
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
    const newMsgFile = msgData?.attachment as File;
    const isNonImageFile = !isImageOrGifFile(newMsgFile?.name);

    const dummyNewMsg: MessageType = {
      _id: `${Date.now()}` as string,
      chat: selectedChat?._id as string,
      sender: {
        _id: loggedInUser?._id as string,
        profilePic: "",
        name: "",
        email: "",
        cloudinary_id: "",
        expiryTime: Date.now(),
        notifications: [],
        token: "",
      },
      fileUrl: msgData?.attachmentPreviewUrl,
      file_id: "",
      file_name:
        newMsgFile?.name +
        `${
          msgData?.mediaDuration
            ? `===${msgData.mediaDuration}`
            : isNonImageFile
            ? `===${newMsgFile?.size || ""}`
            : ""
        }`,
      content: msgData?.content,
      createdAt: new Date().toISOString(),
      sent: false,
    };
    setDontScrollToBottom(false);
    setMessages([dummyNewMsg, ...messages]);
    resetMsgInput();
    setSending(true);
    const config = getAxiosConfig({ loggedInUser, formData: true });

    try {
      // Upload img/gif to cloudinary, and all other files to aws s3
      const apiUrl = isNonImageFile
        ? `/api/message/upload-to-s3`
        : `/api/message/`;

      const formData = new FormData();
      formData.append("attachment", newMsgFile);
      formData.append("mediaDuration", msgData?.mediaDuration as string);
      formData.append("content", msgData.content);
      formData.append("chatId", selectedChat?._id as string);
      const { data } = await axios.post(
        apiUrl,
        formData,
        config as AxiosRequestConfig
      );

      if (isSocketConnected) clientSocket?.emit("new_msg_sent", data);
      fetchMessages();
      dispatch(toggleRefresh());
    } catch (error) {
      displayError(error as ErrorType, "Couldn't Send Message");
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
        config as AxiosRequestConfig
      );
      if (isSocketConnected) {
        clientSocket?.emit("msg_deleted", {
          deletedMsgId: clickedMsgId,
          senderId: loggedInUser?._id,
          chat: selectedChat,
        });
      }
      displaySuccess("Message Deleted Successfully");
      setMessages(messages.filter((msg) => msg?._id !== clickedMsgId));
      dispatch(setLoading(false));
      dispatch(toggleRefresh());
      setSending(false);
      return "msgActionDone";
    } catch (error) {
      displayError(error as ErrorType, "Couldn't Delete Message");
      dispatch(setLoading(false));
      setSending(false);
    }
  };

  const updateMessage = async (
    updatedMsgContent: string,
    msgDateString: string
  ) => {
    if (
      !(
        attachmentData.attachment ||
        (msgFileAlreadyExists && isMsgFileRemoved === "false")
      ) &&
      !parseInnerHTML(updatedMsgContent)
    ) {
      return dispatch(
        displayToast({
          message: "A Message Must Contain Either a File or some Text Content",
          type: "warning",
          duration: 5000,
          position: "top-center",
        } as ToastData)
      );
    }
    setMsgEditMode(false);
    setDontScrollToBottom(true);

    const msgData: AttachmentData = {
      ...attachmentData,
      content: updatedMsgContent || "",
    };
    const updatedMsgFile = msgData?.attachment as File;
    const isNonImageFile = !isImageOrGifFile(updatedMsgFile?.name);

    const updatedMsg: MessageType = {
      _id: `${Date.now()}`,
      chat: selectedChat?._id as string,
      sender: {
        _id: loggedInUser?._id as string,
        profilePic: "",
        name: "",
        email: "",
        cloudinary_id: "",
        expiryTime: Date.now(),
        notifications: [],
        token: "",
      },
      fileUrl: msgData?.attachmentPreviewUrl,
      file_id: "",
      file_name:
        updatedMsgFile?.name +
        `${
          msgData?.mediaDuration
            ? `===${msgData.mediaDuration}`
            : isNonImageFile
            ? `===${updatedMsgFile?.size || ""}`
            : ""
        }`,
      content: msgData?.content as string,
      createdAt: msgDateString,
      sent: false,
    };
    setMessages(
      messages.map((msg: MessageType) =>
        msg?._id === clickedMsgId ? updatedMsg : msg
      )
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
      formData.append("attachment", updatedMsgFile);
      formData.append("msgFileRemoved", isMsgFileRemoved as string);
      formData.append("mediaDuration", msgData?.mediaDuration as string);
      formData.append("updatedContent", msgData?.content as string);
      formData.append("messageId", clickedMsgId);
      const { data } = await axios.put(
        apiUrl,
        formData,
        config as AxiosRequestConfig
      );

      if (isSocketConnected) clientSocket?.emit("msg_updated", data);
      fetchMessages({ updatingMsg: true });
      dispatch(toggleRefresh());
      setIsMsgFileRemoved("false");
    } catch (error) {
      displayError(error as ErrorType, "Couldn't Update Message");
      setSending(false);
      setIsMsgFileRemoved("false");
    }
  };

  const editMsgHandler = () => setMsgEditMode(true);

  const setMediaDuration = (mediaUrl: string, msgFile: File) => {
    const media = new Audio(mediaUrl);
    media.onloadedmetadata = () => {
      const duration = media?.duration as number;
      const minutes = Math.trunc(duration / 60);
      const seconds = Math.trunc(duration % 60);
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

  const handleMsgFileInputChange: ChangeEventHandler = (e) => {
    if (!e.target?.files) return;
    const msgFile = e.target.files[0];
    if (!msgFile) return;

    if (msgFile.size >= FIVE_MB) {
      if (!msgFileInput?.current) return;
      msgFileInput.current.value = "";
      return dispatch(
        displayToast({
          message: "Please Select a File Smaller than 5 MB",
          type: "warning",
          duration: 4000,
          position: "top-center",
        } as ToastData)
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
      setClientSocket(io(SOCKET_ENDPOINT, { transports: ["websocket"] }) as any)
    );
  }, []);

  // Socket event handlers
  const newMsgSocketEventHandler = () => {
    // off() prevents on() from executing multiple times
    clientSocket
      .off("new_msg_received")
      .on(
        "new_msg_received",
        (newMsg: MessageType, notifications: MessageType[]) => {
          const chat = newMsg?.chat as ChatType;
          dispatch(toggleRefresh());
          if (
            selectedChat &&
            chat &&
            selectedChat?._id === chat?._id &&
            newMsg
          ) {
            newMsg["sent"] = true;
            setMessages([newMsg, ...messages]);
            deletePersistedNotifs([newMsg?._id]);
          } else {
            const updatedUser = {
              ...loggedInUser,
              notifications: notifications?.reverse(),
            };
            persistUpdatedUser(updatedUser as UserType);
          }
        }
      );
  };

  const deletedMsgSocketEventHandler = () => {
    clientSocket
      .off("remove_deleted_msg")
      .on(
        "remove_deleted_msg",
        (deletedMsgData: {
          deletedMsgId: string;
          senderId: string;
          chat: ChatType;
        }) => {
          const { deletedMsgId, chat } = deletedMsgData;
          dispatch(toggleRefresh());
          if (selectedChat && chat && selectedChat._id === chat._id) {
            setMessages(messages.filter((m) => m?._id !== deletedMsgId));
          } else {
            // Remove notification of 'deleted msg' from global state
            // and localStorage
            const notifs = loggedInUser?.notifications;
            const updatedUser = {
              ...loggedInUser,
              notifications: notifs?.filter(
                (n: MessageType) => n?._id !== deletedMsgId
              ),
            };
            persistUpdatedUser(updatedUser as UserType);
          }
        }
      );
  };

  const updatedMsgSocketEventHandler = () => {
    clientSocket
      .off("update_modified_msg")
      .on("update_modified_msg", (updatedMsg: MessageType) => {
        if (!updatedMsg) return;
        const chat = updatedMsg?.chat as ChatType;
        dispatch(toggleRefresh());
        if (
          selectedChat &&
          chat &&
          selectedChat?._id === chat?._id &&
          updatedMsg
        ) {
          updatedMsg["sent"] = true;
          updatedMsg["chat"] = (updatedMsg.chat as ChatType)?._id as string;
          setTimeout(() => {
            // Only updating msg content using 'document' method
            // as updating 'messages' state will re-render all
            // msgs and scroll to bottom, which may prevent the
            // receiver to edit or view his/her msg, causing bad UX
            (
              document.getElementById(
                `${updatedMsg._id}---content`
              ) as HTMLElement
            ).innerHTML = updatedMsg.content;
          }, 10);
          // Updating 'state' is the only way to update attachment
        }
      });
  };

  // Listening to all socket events
  useEffect(() => {
    if (!clientSocket) return;

    if (!isSocketConnected && clientSocket) {
      clientSocket.emit("init_user", loggedInUser?._id);
      clientSocket.on("user_connected", () => {
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
    setIsMsgFileRemoved("false");
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
      clientSocket?.emit("stop_typing", selectedChat, loggedInUser);
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

  const msgInputHandler: ChangeEventHandler = debounce((e: KeyboardEvent) => {
    const isNonEmptyInput = Boolean(
      parseInnerHTML((e.target as HTMLElement).innerHTML)
    );
    setEnableMsgSend(isNonEmptyInput);
    if (!isNonEmptyInput) emitStopTyping();
    if (isNonEmptyInput) emitTyping();
  }, 500);

  const msgKeydownHandler: KeyboardEventHandler = (e) => {
    hideEmojiPicker();
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      (enableMsgSend || fileAttached || msgEditMode)
    ) {
      e.preventDefault();
      if (msgEditMode) {
        const msgDate =
          (e.target as HTMLElement).dataset.msgCreatedAt ||
          ((e.target as HTMLElement).parentNode as HTMLElement).dataset
            .msgCreatedAt;
        updateMessage(
          (editableMsgContent?.current as HTMLElement)?.innerHTML,
          msgDate as string
        );
      } else {
        sendMessage();
      }
    }
  };

  // Msgs click handler ('Event Delegation' applied here)
  const msgsClickHandler: ClickEventHandler = (e) => {
    const { dataset } = e.target as HTMLElement;
    const parentDataset = ((e.target as HTMLElement).parentNode as HTMLElement)
      .dataset;
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
      loadMedia(e, videoId, {
        fileName: dataset.videoName || parentDataset.videoName || null,
        isAudio: false,
      });
    } else if (audioId) {
      // Load audio
      loadMedia(e, audioId, {
        fileName: dataset.audioName || parentDataset.audioName || null,
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
      openViewProfileDialogWithProps(props);
    } else if (msgId && !msgEditMode) {
      msgFileAlreadyExists = Boolean(
        dataset.fileExists || parentDataset.fileExists
      );
      setClickedMsgId(msgId);
      openMsgOptionsMenu(e);
    } else if (attachMsgFileClicked || editMsgFileClicked) {
      selectAttachment();
    } else if (removeMsgFileClicked) {
      setIsMsgFileRemoved("true");
      discardAttachment();
    } else if (discardDraftClicked) {
      openDiscardDraftConfirmDialog();
    } else if (updateEditedMsg) {
      const msgDate = dataset.msgCreatedAt || parentDataset.msgCreatedAt;
      updateMessage(
        (editableMsgContent?.current as HTMLElement)?.innerHTML,
        msgDate as string
      );
    }
  };

  useEffect(() => {
    if (!dontScrollToBottom) scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (fetchMsgs) {
      fetchMessages();
      if (isSocketConnected) clientSocket?.emit("join_chat", selectedChat?._id);
    }
  }, [fetchMsgs]);

  const openViewProfileDialog: ClickEventHandler = (e) => {
    dispatch(setShowDialogActions(false));
    setDialogBody(<ViewProfileBody />);
    dispatch(displayDialog({ title: "View Profile" }));
  };

  const openViewProfileDialogWithProps = (props: ProfileData) => {
    dispatch(setShowDialogActions(false));
    setDialogBody(<ViewProfileBody {...props} />);
    dispatch(displayDialog({ title: "View Profile" }));
  };

  const openGroupInfoDialog: ClickEventHandler = (e) => {
    // Open group info dialog
    dispatch(setGroupInfo(selectedChat));
    dispatch(setShowDialogActions(false));
    setDialogBody(<GroupInfoBody messages={messages} />);
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

  const openMsgOptionsMenu: ClickEventHandler = (e) => {
    if (sending) return;
    setMsgOptionsMenuAnchor(e.target as SetStateAction<HTMLElement | null>);
  };

  const onDiscardFileClick: ClickEventHandler = (e) => {
    const { dataset } = e.target as HTMLElement;
    const parentDataset = ((e.target as HTMLElement).parentNode as HTMLElement)
      .dataset;
    const discardFileClicked = dataset.discardFile || parentDataset.discardFile;
    if (discardFileClicked) discardAttachment();
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
            onClick={onDiscardFileClick}
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
                  messages.map(
                    (m: MessageType, i: number, msgs: MessageType[]) => (
                      <Message
                        downloadingFileId={downloadingFileId}
                        loadingMediaId={loadingMediaId}
                        msgEditMode={msgEditMode}
                        clickedMsgId={clickedMsgId}
                        msgFileRemoved={isMsgFileRemoved === "true"}
                        attachmentData={attachmentData}
                        ref={editableMsgContent as React.Ref<HTMLSpanElement>}
                        CustomTooltip={CustomTooltip}
                        key={m?._id}
                        msgSent={m?.sent as boolean}
                        currMsg={m}
                        prevMsg={i < msgs.length - 1 ? msgs[i + 1] : null}
                      />
                    )
                  )
                )}
              </div>
            </div>
            {/* Edit/Delete Message menu */}
            <MsgOptionsMenu
              anchor={msgOptionsMenuAnchor as HTMLElement}
              setAnchor={setMsgOptionsMenuAnchor}
              editMsgHandler={editMsgHandler}
              openDeleteMsgConfirmDialog={openDeleteMsgConfirmDialog}
            />
            {fileAttached && !msgEditMode && (
              <AttachmentPreview
                isEditMode={false}
                attachmentData={attachmentData}
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
                      // searchPlaceholder={"Search an emoji..."}
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
