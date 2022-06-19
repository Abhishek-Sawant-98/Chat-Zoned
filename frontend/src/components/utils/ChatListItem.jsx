import {
  Article,
  AudioFile,
  GifBox,
  Image,
  PictureAsPdf,
  VideoFile,
} from "@mui/icons-material";
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
  const { loggedInUser } = AppState();
  const { _id, chatName, isGroupChat, users, lastMessage, chatDisplayPic } =
    chat;

  const receiver = getOneOnOneChatReceiver(loggedInUser, users);

  const tooltipTitle = isGroupChat
    ? `Group: ${chatName}`
    : `Receiver: ${receiver}`;

  const lastMsgFile = lastMessage?.fileUrl;
  let lastMsgFileType;

  if (lastMsgFile) {
    lastMsgFileType = /.png|.jpg|.jpeg$/.test(lastMsgFile)
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
      className={`chatListItem user-select-none d-flex text-light justify-content-start align-items-center pointer px-3`}
    >
      <CustomTooltip
        data-chat={_id}
        title={tooltipTitle}
        placement="top-start"
        arrow
      >
        <img
          src={isGroupChat ? chatDisplayPic : receiver?.profilePic}
          alt={_id}
          data-chat={_id}
          className={`chatListAvatar rounded-circle`}
        />
      </CustomTooltip>
      <div
        data-chat={_id}
        className="chatListData d-flex flex-column align-items-start px-2"
      >
        <p data-chat={_id} className="chatListName fs-5 fw-bold text-warning">
          {truncateString(isGroupChat ? chatName : receiver?.name, 23, 20)}
        </p>
        {lastMessage && (
          <p data-chat={_id} className="chatListLastMessage">
            <span data-chat={_id} className="chatList text-info">
              {`${truncateString(lastMessage.sender?.name || "", 12, 8)}: `}
            </span>
            {lastMsgFile ? (
              <>
                {lastMsgFileType === "image" ? (
                  <span>
                    <Image /> Image
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
