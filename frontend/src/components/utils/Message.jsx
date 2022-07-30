import {
  AttachFile,
  Close,
  Done,
  DoneAll,
  KeyboardArrowDown,
} from "@mui/icons-material";
import { CircularProgress, IconButton } from "@mui/material";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { selectAppState } from "../../store/slices/AppSlice";
import {
  msgTimeStringOf,
  msgDateStringOf,
  dateStringOf,
  setCaretPosition,
} from "../../utils/appUtils";
import getCustomTooltip from "../utils/CustomTooltip";
import MsgAttachment from "./MsgAttachment";

const arrowStyles = {
  color: "#111",
};
const tooltipStyles = {
  maxWidth: 230,
  color: "#eee",
  fontFamily: "Mirza",
  fontSize: 16,
  borderRadius: 5,
  border: "1px solid #555",
  backgroundColor: "#111",
};
const CustomTooltip = getCustomTooltip(arrowStyles, tooltipStyles);
const IconButtonSx = {
  color: "lightblue",
  ":hover": {
    backgroundColor: "#cccccc20",
  },
};

const Message = ({
  downloadingFileId,
  loadingMediaId,
  msgEditMode,
  clickedMsgId,
  msgSent,
  msgFileInput,
  discardDraft,
  currMsg,
  prevMsg,
}) => {
  const { loggedInUser, selectedChat } = useSelector(selectAppState);
  const msgContentRef = useRef(null);
  const { _id, profilePic, name, email } = currMsg?.sender;
  const isLoggedInUser = _id === loggedInUser._id;
  const senderData = `${profilePic}===${name}===${email}`;
  const currMsgId = isLoggedInUser ? currMsg?._id : null;
  const isClickedMsgCurrMsg = clickedMsgId === currMsgId;
  const isSameSender = _id === prevMsg?.sender._id;
  const currMsgDate = new Date(currMsg.createdAt);
  const prevMsgDate = new Date(prevMsg?.createdAt);
  const isOtherDay = dateStringOf(currMsgDate) !== dateStringOf(prevMsgDate);
  const showCurrSender =
    !isLoggedInUser &&
    selectedChat?.isGroupChat &&
    (!isSameSender || isOtherDay);

  useEffect(() => {
    if (msgContentRef?.current)
      msgContentRef.current.innerHTML = currMsg?.content;
  }, []);

  useEffect(() => {
    if (msgEditMode && isClickedMsgCurrMsg) {
      setCaretPosition(msgContentRef?.current);
    }
  }, [msgEditMode]);

  const updateEditedMsg = () => {};

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
          {msgEditMode && isClickedMsgCurrMsg ? (
            <div
              className="d-flex justify-content-end"
              style={{ margin: "-5px -5px -3px 0px" }}
            >
              {!currMsg?.fileUrl && (
                <CustomTooltip title="Attach File" placement="top-end" arrow>
                  <IconButton
                    onClick={() => {
                      msgFileInput?.click();
                    }}
                    className={``}
                    sx={{ ...IconButtonSx, transform: "rotateZ(45deg)" }}
                  >
                    <AttachFile style={{ fontSize: 20 }} />
                  </IconButton>
                </CustomTooltip>
              )}

              <CustomTooltip title="Discard Draft" placement="top-end" arrow>
                <IconButton
                  onClick={discardDraft}
                  className={``}
                  sx={IconButtonSx}
                >
                  <Close style={{ fontSize: 20 }} />
                </IconButton>
              </CustomTooltip>
              <CustomTooltip title="Update Message" placement="top-end" arrow>
                <IconButton
                  onClick={updateEditedMsg}
                  className={`ms-1`}
                  sx={IconButtonSx}
                >
                  <Done style={{ fontSize: 20 }} />
                </IconButton>
              </CustomTooltip>
            </div>
          ) : (
            <></>
          )}
          {showCurrSender && (
            <span data-sender={senderData} className="msgSender pointer">
              {name}
            </span>
          )}
          {isLoggedInUser && msgSent && !msgEditMode && (
            <span
              data-msg={currMsgId}
              title="Edit/Delete Message"
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
          {currMsg?.fileUrl && (
            <MsgAttachment
              msgSent={msgSent}
              msgEditMode={msgEditMode}
              clickedMsgId={clickedMsgId}
              downloadingFileId={downloadingFileId}
              loadingMediaId={loadingMediaId}
              fileData={{
                msgId: currMsgId,
                fileUrl: currMsg.fileUrl,
                file_id: currMsg.file_id,
                file_name: currMsg.file_name,
              }}
            />
          )}
          <div data-msg={currMsgId} className="msgContent d-flex">
            <span
              className="w-100"
              style={{ outline: "none" }}
              contentEditable={msgEditMode && isClickedMsgCurrMsg}
              ref={msgContentRef}
            ></span>
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
