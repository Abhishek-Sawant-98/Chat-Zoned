import {
  Article,
  AudioFile,
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
    .replaceAll("</div>", "\n");

  const lastMsgDate = new Date(lastMessage?.createdAt);
  const lastMsgDateString = msgDateStringOf(lastMsgDate);

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
              <span data-chat={_id} title={lastMsgContent}>
                {lastMessage === null
                  ? " Last Message was deleted"
                  : isGroupChat && !lastMessage
                  ? `New Group Created`
                  : truncateString(lastMsgContent || "", 29, 26)}
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatListItem;
