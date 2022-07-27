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

const ChatListItem = ({ chat }) => {
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

  const lastMsgContent = lastMessage?.content
    ?.replaceAll("<br>", "\n")
    .replaceAll("&nbsp;", " ")
    .replaceAll("<div>", "\n")
    .replaceAll("</div>", "\n")
    .replaceAll("<span>", "")
    .replaceAll("</span>", "");

  const lastMsgDate = new Date(lastMessage?.createdAt);
  const lastMsgDateString = msgDateStringOf(lastMsgDate);

  const lastMsgFile = lastMessage?.fileUrl;
  const lastMsgFileName = lastMessage?.file_name?.split("===")[0];
  let lastMsgFileType;

  if (lastMsgFile) {
    lastMsgFileType = isImageFile(lastMsgFile)
      ? "image"
      : /(\.gif)$/.test(lastMsgFile)
      ? "gif"
      : /(\.mp4|\.webm)$/.test(lastMsgFile)
      ? "video"
      : /(\.mp3|\.wav)$/.test(lastMsgFile)
      ? "audio"
      : /(\.pdf)$/.test(lastMsgFile)
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
          <span className="lastMsgDate">
            {lastMsgDateString === "Today"
              ? msgTimeStringOf(lastMsgDate)
              : lastMsgDateString !== "Yesterday"
              ? dateStringOf(lastMsgDate)
              : "Yesterday"}
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
            {lastMsgFile ? (
              <span data-chat={_id}>
                {lastMsgFileType === "image" ? (
                  <span data-chat={_id} title={lastMsgFileName}>
                    <Image className="fileIcon" />{" "}
                    {truncateString(lastMsgContent, 25, 22) || "Photo"}
                  </span>
                ) : lastMsgFileType === "gif" ? (
                  <span data-chat={_id} title={lastMsgFileName}>
                    <GifBox className="fileIcon" />{" "}
                    {truncateString(lastMsgContent, 25, 22) || "Gif"}
                  </span>
                ) : lastMsgFileType === "video" ? (
                  <span data-chat={_id} title={lastMsgFileName}>
                    <VideoFile className="fileIcon" />{" "}
                    {truncateString(lastMsgContent, 25, 22) || "Video"}
                  </span>
                ) : lastMsgFileType === "audio" ? (
                  <span data-chat={_id} title={lastMsgFileName}>
                    <AudioFile className="fileIcon" />{" "}
                    {truncateString(lastMsgContent, 25, 22) || "Audio"}
                  </span>
                ) : lastMsgFileType === "pdf" ? (
                  <span data-chat={_id} title={lastMsgFileName}>
                    <PictureAsPdf className="fileIcon" />{" "}
                    {truncateString(lastMsgFileName, 22, 19) || "Pdf"}
                  </span>
                ) : (
                  <span data-chat={_id} title={lastMsgFileName}>
                    <Description className="fileIcon" />{" "}
                    {truncateString(lastMsgFileName, 22, 19) || "File"}
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
