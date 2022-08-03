import {
  AudioFile,
  Description,
  DoneAll,
  GifBox,
  Image,
  PictureAsPdf,
  VideoFile,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { selectAppState } from "../../store/slices/AppSlice";
import {
  dateStringOf,
  getNotifBadgeStyles,
  isImageFile,
  msgDateStringOf,
  msgTimeStringOf,
  truncateString,
} from "../../utils/appUtils";
import getCustomTooltip from "../utils/CustomTooltip";

const arrowStyles = {
  color: "#E6480C",
};
const tooltipStyles = {
  maxWidth: 230,
  color: "#eee",
  fontFamily: "Mirza",
  fontSize: 17,
  borderRadius: 5,
  backgroundColor: "#E6480C",
};

const CustomTooltip = getCustomTooltip(arrowStyles, tooltipStyles);

const ChatListItem = ({ chat, chatNotifCount }) => {
  const { selectedChat, loggedInUser } = useSelector(selectAppState);
  const {
    _id,
    chatName,
    receiverEmail,
    isGroupChat,
    lastMessage,
    chatDisplayPic,
  } = chat;

  const tooltipTitle = isGroupChat
    ? `Group: ${chatName}\n(${chat?.users?.length} Members)`
    : `${chatName}\n${receiverEmail}`;

  let lastMsgContent = lastMessage?.content
    ?.replaceAll("<br>", "\n")
    .replaceAll("&nbsp;", " ")
    .replaceAll("<div>", "\n")
    .replaceAll("</div>", "\n")
    .replaceAll("<span>", "")
    .replaceAll("</span>", "");

  const lastMsgDate = new Date(lastMessage?.createdAt);
  const lastMsgDateString = msgDateStringOf(lastMsgDate);

  const lastMsgFileUrl = lastMessage?.fileUrl;
  const fileContents = lastMessage?.file_name?.split("===") || [];
  const lastMsgFileName = fileContents[0] || "";
  const lastMsgData = lastMsgContent || lastMsgFileName;
  const fileType = fileContents[1]?.split("+++")[1];
  let lastMsgFileType;

  if (lastMsgFileUrl) {
    lastMsgFileType = isImageFile(lastMsgFileUrl)
      ? "image"
      : /(\.gif)$/.test(lastMsgFileUrl)
      ? "gif"
      : fileType?.startsWith("video/") ||
        /(\.mp4|\.mov|\.ogv|\.webm)$/.test(lastMsgFileUrl)
      ? "video"
      : fileType?.startsWith("audio/") ||
        /(\.mp3|\.ogg|\.wav)$/.test(lastMsgFileUrl)
      ? "audio"
      : /(\.pdf)$/.test(lastMsgFileUrl)
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
        title={`View ${isGroupChat ? "Group DP" : "Profile Pic"}`}
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
        <p
          data-chat={_id}
          title={tooltipTitle}
          className="chatListName fs-5 fw-bold text-info"
        >
          {truncateString(chatName, 23, 20)}
        </p>
        {lastMessage && (
          <span
            className="lastMsgDate"
            data-chat={_id}
            style={{ color: chatNotifCount ? "#50F0B8" : "auto" }}
          >
            {lastMsgDateString === "Today"
              ? msgTimeStringOf(lastMsgDate)
              : lastMsgDateString !== "Yesterday"
              ? dateStringOf(lastMsgDate)
              : "Yesterday"}
          </span>
        )}
        {lastMessage && (
          <span
            className={`badge rounded-circle
             position-absolute text-black bg-gradient`}
            data-chat={_id}
            style={{
              zIndex: 5,
              backgroundColor: "#22A96A",
              fontSize: chatNotifCount > 99 ? 12 : 13,
              fontFamily: "cambria",
              right: 17,
              bottom: chatNotifCount > 9 ? 8 : 9,
              padding:
                chatNotifCount > 99
                  ? "6px 4px"
                  : chatNotifCount > 9
                  ? "6px 5px"
                  : "4px 7px",
            }}
          >
            {chatNotifCount || ""}
          </span>
        )}
        {/* Last Message Data */}
        {(lastMessage || lastMessage === null || isGroupChat) && (
          <p data-chat={_id} className="chatListLastMessage">
            <span data-chat={_id} className="text-warning">
              <>
                {lastMessage === null ||
                (isGroupChat && !lastMessage) ||
                (!isGroupChat &&
                  lastMessage?.sender?._id !== loggedInUser?._id) ? (
                  ""
                ) : lastMessage?.sender?._id === loggedInUser?._id ? (
                  <>
                    {isGroupChat ? (
                      <>You: </>
                    ) : (
                      <DoneAll
                        data-chat={_id}
                        className="me-1 fs-5"
                        style={{ color: "lightblue" }}
                      />
                    )}
                  </>
                ) : (
                  truncateString(
                    lastMessage?.sender?.name?.split(" ")[0],
                    12,
                    8
                  ) + ": "
                )}
              </>
            </span>
            {lastMsgFileUrl ? (
              <span data-chat={_id}>
                {lastMsgFileType === "image" ? (
                  <span data-chat={_id} title={lastMsgData}>
                    <Image data-chat={_id} className="fileIcon" />{" "}
                    {truncateString(lastMsgContent, 25, 22) || "Photo"}
                  </span>
                ) : lastMsgFileType === "gif" ? (
                  <span data-chat={_id} title={lastMsgData}>
                    <GifBox data-chat={_id} className="fileIcon" />{" "}
                    {truncateString(lastMsgContent, 25, 22) || "Gif"}
                  </span>
                ) : lastMsgFileType === "video" ? (
                  <span data-chat={_id} title={lastMsgData}>
                    <VideoFile data-chat={_id} className="fileIcon" />{" "}
                    {truncateString(lastMsgContent, 25, 22) || "Video"}
                  </span>
                ) : lastMsgFileType === "audio" ? (
                  <span data-chat={_id} title={lastMsgData}>
                    <AudioFile data-chat={_id} className="fileIcon" />{" "}
                    {truncateString(lastMsgContent, 25, 22) || "Audio"}
                  </span>
                ) : lastMsgFileType === "pdf" ? (
                  <span data-chat={_id} title={lastMsgData}>
                    <PictureAsPdf data-chat={_id} className="fileIcon" />{" "}
                    {truncateString(lastMsgData, 22, 19) || "Pdf"}
                  </span>
                ) : (
                  <span data-chat={_id} title={lastMsgData}>
                    <Description data-chat={_id} className="fileIcon" />{" "}
                    {truncateString(lastMsgData, 22, 19) || "File"}
                  </span>
                )}
              </span>
            ) : (
              <span data-chat={_id} title={lastMsgContent}>
                {lastMessage === null
                  ? " Last Message was deleted"
                  : isGroupChat && !lastMessage
                  ? `New Group Created`
                  : truncateString(lastMsgContent, 25, 22)}
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatListItem;
