import { ArrowBack, Close } from "@mui/icons-material";
import { Avatar, IconButton } from "@mui/material";
import { useSelector } from "react-redux";
import { selectAppState } from "../store/slices/AppSlice";
import { getOneToOneChatReceiver, truncateString } from "../utils/appUtils";

const MsgsHeader = ({
  closeChat,
  openGroupInfoDialog,
  openViewProfileDialog,
  hideEmojiPicker,
  CustomTooltip,
}) => {
  const { loggedInUser, selectedChat } = useSelector(selectAppState);
  const chatName = selectedChat?.isGroupChat
    ? selectedChat?.chatName
    : getOneToOneChatReceiver(loggedInUser, selectedChat?.users)?.name;
  return (
    <section
      className={`messagesHeader pointer-event d-flex justify-content-start 
            position-relative w-100 fw-bold bg-info bg-opacity-10 py-2`}
      onClick={hideEmojiPicker}
    >
      <CustomTooltip title="Go Back" placement="bottom-start" arrow>
        <IconButton
          onClick={closeChat}
          className={`d-flex d-md-none ms-3`}
          sx={{
            color: "#999999",
            ":hover": { backgroundColor: "#aaaaaa20" },
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
            ":hover": { backgroundColor: "#aaaaaa20" },
          }}
          className="pointer ms-0 ms-md-4"
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
                : getOneToOneChatReceiver(loggedInUser, selectedChat?.users)
                    ?.profilePic || ""
            }
            alt={"receiverAvatar"}
          />
        </IconButton>
      </CustomTooltip>

      <span className="ms-2 mt-1 fs-4 text-info" title={chatName}>
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
            ":hover": { backgroundColor: "#aaaaaa20" },
          }}
        >
          <Close />
        </IconButton>
      </CustomTooltip>
    </section>
  );
};

export default MsgsHeader;
