import {
  Article,
  AudioFile,
  GifBox,
  Image,
  PictureAsPdf,
  VideoFile,
} from "@mui/icons-material";
import { IconButton } from "@mui/material";
import React from "react";
import { AppState } from "../../context/ContextProvider";
import { getOneOnOneChatReceiver, truncateString } from "../../utils/appUtils";
import getCustomTooltip from "../utils/CustomTooltip";

const arrowStyles = {
  color: "#E6480C",
};
const tooltipStyles = {
  maxWidth: 230,
  color: "#eee",
  fontFamily: "Mirza",
  fontSize: 17,
  borderRadius: 10,
  backgroundColor: "#E6480C",
};

const CustomTooltip = getCustomTooltip(arrowStyles, tooltipStyles);

const ChatListItem = ({ chat }) => {
  const { selectedChat } = AppState();
  const {
    _id,
    chatName,
    receiverEmail,
    isGroupChat,
    lastMessage,
    chatDisplayPic,
  } = chat;

  const tooltipTitle = isGroupChat
    ? `Group: ${chatName}`
    : `${chatName} (${receiverEmail})`;

  const lastMsgFile = lastMessage?.fileUrl;
  let lastMsgFileType;

  if (lastMsgFile) {
    lastMsgFileType = /.png|.jpg|.jpeg|.svg$/.test(lastMsgFile)
      ? "image"
      : /.gif$/.test(lastMsgFile)
      ? "gif"
      : /.mp4$/.test(lastMsgFile)
      ? "video"
      : /.mp3$/.test(lastMsgFile)
      ? "audio"
      : /.pdf$/.test(lastMsgFile)
      ? "pdf"
      : "otherFile";
  }
  return (
    <div
      data-chat={_id}
      className={`chatListItem ${
        selectedChat?._id === _id ? "isSelected" : ""
      } user-select-none d-flex text-light justify-content-start align-items-center pointer`}
    >
      {/* Chat Display Pic */}
      <CustomTooltip
        data-chat={_id}
        title={tooltipTitle}
        placement="top-start"
        arrow
      >
        <img
          src={chatDisplayPic}
          alt={chatName}
          data-chat={_id}
          className={`img-fluid listItemAvatar chatListAvatar rounded-circle`}
        />
      </CustomTooltip>
      {/* Chat Data */}
      <div
        data-chat={_id}
        className="chatListData d-flex flex-column align-items-start px-2"
      >
        {/* Chat Name */}
        <p data-chat={_id} className="chatListName fs-5 fw-bold text-info">
          {truncateString(chatName, 23, 20)}
        </p>
        {/* Last Message Data */}
        {lastMessage && (
          <p data-chat={_id} className="chatListLastMessage">
            <span data-chat={_id} className="chatList text-warning">
              {`${truncateString(lastMessage.sender?.name || "", 12, 8)}: `}
            </span>
            {lastMsgFile ? (
              <>
                {lastMsgFileType === "image" ? (
                  <span>
                    <Image /> Photo
                  </span>
                ) : lastMsgFileType === "gif" ? (
                  <span>
                    <GifBox /> Gif
                  </span>
                ) : lastMsgFileType === "video" ? (
                  <span>
                    <VideoFile /> Video
                  </span>
                ) : lastMsgFileType === "audio" ? (
                  <span>
                    <AudioFile /> Audio
                  </span>
                ) : lastMsgFileType === "pdf" ? (
                  <span>
                    <PictureAsPdf /> Pdf
                  </span>
                ) : (
                  <span>
                    <Article /> File
                  </span>
                )}
              </>
            ) : (
              <>{truncateString(lastMessage?.content || "", 20, 17)}</>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatListItem;
