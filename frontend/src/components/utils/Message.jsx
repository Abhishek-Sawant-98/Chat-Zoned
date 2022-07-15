import { DoneAll, KeyboardArrowDown } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import { useEffect, useRef } from "react";
import { AppState } from "../../context/ContextProvider";
import {
  msgTimeStringOf,
  msgDateStringOf,
  dateStringOf,
} from "../../utils/appUtils";
import getCustomTooltip from "../utils/CustomTooltip";

const arrowStyles = {
  color: "#E6480C",
};
const tooltipStyles = {
  maxWidth: 230,
  color: "#eee",
  fontFamily: "Mirza",
  fontSize: 16,
  borderRadius: 5,
  backgroundColor: "#E6480C",
};
const CustomTooltip = getCustomTooltip(arrowStyles, tooltipStyles);

const Message = ({ msgSent, currMsg, prevMsg }) => {
  const msgContentRef = useRef(null);
  const { loggedInUser, selectedChat } = AppState();
  const { _id, profilePic, name, email } = currMsg?.sender;
  const isLoggedInUser = _id === loggedInUser._id;
  const senderData = `${profilePic}===${name}===${email}`;
  const currMsgId = isLoggedInUser ? currMsg?._id : null;
  const isSameSender = _id === prevMsg?.sender._id;
  const currMsgDate = new Date(currMsg.createdAt);
  const prevMsgDate = new Date(prevMsg?.createdAt);
  const isOtherDay = dateStringOf(currMsgDate) !== dateStringOf(prevMsgDate);
  const showCurrSender =
    !isLoggedInUser &&
    selectedChat?.isGroupChat &&
    (!isSameSender || isOtherDay);

  useEffect(() => {
    msgContentRef.current.innerHTML = currMsg?.content;
  }, []);

  return (
    <>
      <section
        className={`msgRow d-flex justify-content-${
          isLoggedInUser ? "end" : "start"
        }`}
        style={{ marginTop: isSameSender ? "3px" : "10px" }}
      >
        {showCurrSender ? (
          <CustomTooltip title={`View Profile`} placement="top-start" arrow>
            <img
              src={profilePic}
              alt={name}
              data-sender={senderData}
              className="senderAvatar rounded-circle pointer"
            />
          </CustomTooltip>
        ) : (
          selectedChat?.isGroupChat && <span style={{ width: "31px" }}></span>
        )}
        <div
          className={`msgBox d-flex flex-column text-start p-2 rounded-3
          mx-2 mx-md-3 ${isLoggedInUser ? "yourMsg" : "receiversMsg"}`}
          data-msg={currMsgId}
        >
          {showCurrSender && (
            <span data-sender={senderData} className="msgSender pointer">
              {name}
            </span>
          )}
          {isLoggedInUser && msgSent && (
            <span
              data-msg={currMsgId}
              className={`msgOptionsIcon text-light position-absolute 
              top-0 end-0 w-25 h-100`}
            >
              <KeyboardArrowDown
                data-msg={currMsgId}
                style={{ fontSize: 22 }}
                className="position-absolute top-0 end-0"
              />
            </span>
          )}
          <div data-msg={currMsgId} className="msgContent d-flex">
            <span ref={msgContentRef}></span>
            <span
              data-msg={currMsgId}
              className="msgTime text-end d-flex align-items-end justify-content-end"
            >
              {msgTimeStringOf(currMsgDate)}
              {isLoggedInUser && (
                <>
                  {msgSent ? (
                    <DoneAll className="text-info fs-6 ms-1" />
                  ) : (
                    <CircularProgress
                      size={10}
                      className="sendStatusIcon ms-1"
                    />
                  )}
                </>
              )}
            </span>
          </div>
        </div>
      </section>
      {isOtherDay && (
        <div className={`msgDate mt-3 mb-2 mx-auto py-1 px-3 rounded-3`}>
          {msgDateStringOf(currMsgDate)}
        </div>
      )}
    </>
  );
};

export default Message;
