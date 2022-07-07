import { Avatar } from "@mui/material";
import { AppState } from "../../context/ContextProvider";
import { getMsgTime } from "../../utils/appUtils";

const Message = ({ currMsg, prevMsg }) => {
  const { loggedInUser, selectedChat } = AppState();
  const currSender = currMsg?.sender;
  const isLoggedInUser = currSender._id === loggedInUser._id;
  const isSameSender = currSender._id === prevMsg?.sender._id;
  const currMsgDate = new Date(currMsg.createdAt);
  const showCurrSender =
    !isLoggedInUser && selectedChat?.isGroupChat && !isSameSender;

  return (
    <section
      className={`msgRow d-flex justify-content-${
        isLoggedInUser ? "end" : "start"
      }`}
      style={{ marginTop: isSameSender ? "3px" : "10px" }}
    >
      {showCurrSender ? (
        <>
          <Avatar className="senderAvatar" src={currSender?.profilePic} />
        </>
      ) : selectedChat?.isGroupChat ? (
        <span style={{ width: "30px" }}></span>
      ) : (
        <></>
      )}
      <div
        className={`msgBox d-flex flex-column text-start p-2 rounded-3
        mx-2 mx-md-3 ${isLoggedInUser ? "yourMsg" : "receiversMsg"}`}
      >
        {showCurrSender ? (
          <span className="msgSender">{currSender?.name}</span>
        ) : (
          <></>
        )}
        <div className="msgContent d-flex">
          {currMsg.content}
          <span className="msgTime text-end d-flex align-items-end justify-content-end">
            {getMsgTime(currMsgDate)}
          </span>
        </div>
      </div>
    </section>
  );
};

export default Message;
