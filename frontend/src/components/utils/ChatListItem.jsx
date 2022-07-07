import {
  Article,
  AudioFile,
  GifBox,
  Image,
  PictureAsPdf,
  VideoFile,
} from "@mui/icons-material";
import { AppState } from "../../context/ContextProvider";
import { truncateString } from "../../utils/appUtils";
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
  const { selectedChat, loggedInUser } = AppState();
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
      className={`chatListItem user-select-none text-light pointer ${
        selectedChat?._id === _id ? "isSelected" : ""
      } d-flex justify-content-start align-items-center`}
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
        {(lastMessage || lastMessage === null || isGroupChat) && (
          <p data-chat={_id} className="chatListLastMessage">
            <span data-chat={_id} className="lastMsgSender text-warning">
              {`${
                lastMessage === null || (isGroupChat && !lastMessage)
                  ? ""
                  : lastMessage?.sender?._id === loggedInUser?._id
                  ? "You: "
                  : truncateString(
                      lastMessage?.sender?.name?.split(" ")[0],
                      12,
                      8
                    ) + ": "
              }`}
            </span>
            {lastMsgFile ? (
              <span data-chat={_id}>
                {lastMsgFileType === "image" ? (
                  <span data-chat={_id}>
                    <Image className="fileIcon" /> Photo
                  </span>
                ) : lastMsgFileType === "gif" ? (
                  <span data-chat={_id}>
                    <GifBox className="fileIcon" /> Gif
                  </span>
                ) : lastMsgFileType === "video" ? (
                  <span data-chat={_id}>
                    <VideoFile className="fileIcon" /> Video
                  </span>
                ) : lastMsgFileType === "audio" ? (
                  <span data-chat={_id}>
                    <AudioFile className="fileIcon" /> Audio
                  </span>
                ) : lastMsgFileType === "pdf" ? (
                  <span data-chat={_id}>
                    <PictureAsPdf className="fileIcon" /> Pdf
                  </span>
                ) : (
                  <span data-chat={_id}>
                    <Article className="fileIcon" /> File
                  </span>
                )}
              </span>
            ) : (
              <span data-chat={_id}>
                {lastMessage === null
                  ? " Last Message was deleted"
                  : isGroupChat && !lastMessage
                  ? `New Group Created`
                  : truncateString(lastMessage?.content || "", 27, 24)}
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatListItem;
