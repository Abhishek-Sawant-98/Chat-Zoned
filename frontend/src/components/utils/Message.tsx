import { StyledComponent } from "@emotion/styled";
import {
  AttachFile,
  Close,
  Delete,
  Done,
  DoneAll,
  Edit,
  KeyboardArrowDown,
} from "@mui/icons-material";
import { Avatar, CircularProgress, IconButton, TooltipProps } from "@mui/material";
import { forwardRef, useEffect, useRef } from "react";
import { selectAppState } from "../../store/slices/AppSlice";
import { useAppSelector } from "../../store/storeHooks";
import { AttachmentData, AttachmentFileData, CustomTooltipType, MessageType, SpanRef } from "../../utils/AppTypes";
import {
  msgTimeStringOf,
  msgDateStringOf,
  dateStringOf,
  setCaretPosition,
} from "../../utils/appUtils";
import AttachmentPreview from "./AttachmentPreview";
import MsgAttachment from "./MsgAttachment";

const IconButtonSx = {
  color: "lightblue",
  ":hover": { backgroundColor: "#cccccc20" },
};

interface Props {
  downloadingFileId: string;
  loadingMediaId: string;
  msgEditMode: boolean;
  clickedMsgId: string;
  msgFileRemoved: boolean;
  CustomTooltip: CustomTooltipType;
  msgSent: boolean;
  currMsg: MessageType;
  prevMsg: MessageType;
  attachmentData: AttachmentData;
}

const Message = forwardRef(
  (
    {
      downloadingFileId,
      loadingMediaId,
      msgEditMode,
      clickedMsgId,
      msgFileRemoved,
      CustomTooltip,
      msgSent,
      currMsg,
      prevMsg,
      attachmentData,
    }: Props,
    editableMsgRef: React.ForwardedRef<HTMLSpanElement>
  ) => {
    const { loggedInUser, selectedChat } = useAppSelector(selectAppState);

    const fileUrl = currMsg?.fileUrl;
    const file_id = currMsg?.file_id;
    const file_name = currMsg?.file_name;

    const _id = currMsg?.sender?._id;
    const profilePic = currMsg?.sender?.profilePic;
    const name = currMsg?.sender?.name;
    const email = currMsg?.sender?.email;

    const isLoggedInUser = _id === loggedInUser?._id;
    const senderData = `${profilePic}===${name}===${email}`;
    const isSameSender = _id === prevMsg?.sender?._id;
    const currMsgDate = new Date(currMsg?.createdAt as string);
    const prevMsgDate = new Date(prevMsg?.createdAt as string);
    const msgContentRef = useRef<HTMLSpanElement>(null); // Local ref (in non-edit mode)
    const currMsgId = isLoggedInUser ? currMsg?._id : null;
    const isClickedMsgCurrMsg = clickedMsgId === currMsgId;
    const isEditMode = msgEditMode && isClickedMsgCurrMsg;
    const isOtherDay = dateStringOf(currMsgDate) !== dateStringOf(prevMsgDate);
    const showCurrSender =
      !isLoggedInUser &&
      selectedChat?.isGroupChat &&
      (!isSameSender || isOtherDay);

    useEffect(() => {
      if (isEditMode) {
        setCaretPosition((editableMsgRef as SpanRef)?.current);
      }
    }, [msgEditMode]);

    useEffect(() => {
      if (msgContentRef?.current) {
        msgContentRef.current.innerHTML = currMsg?.content as string;
      }
    }, []);

    const fileEditIcons = (
      <>
        <CustomTooltip title="Remove Attachment" placement="top" arrow>
          <IconButton
            data-remove-msg-file={true}
            className={`m-1 bg-black bg-opacity-75`}
            sx={IconButtonSx}
          >
            <Delete data-remove-msg-file={true} style={{ fontSize: 20 }} />
          </IconButton>
        </CustomTooltip>
        <CustomTooltip title="Change Attachment" placement="top" arrow>
          <IconButton
            data-edit-msg-file={true}
            className={`m-1 bg-black bg-opacity-75`}
            sx={IconButtonSx}
          >
            <Edit data-edit-msg-file={true} style={{ fontSize: 20 }} />
          </IconButton>
        </CustomTooltip>
      </>
    );

    return (
      <>
        <section
          className={`msgRow d-flex justify-content-${
            isLoggedInUser ? "end" : "start"
          }`}
          style={{ marginTop: isSameSender ? 3 : 10 }}
        >
          {showCurrSender ? (
            <CustomTooltip title={`View Profile`} placement="top-start" arrow>
              <Avatar
                src={profilePic}
                alt={name}
                data-sender={senderData}
                className="senderAvatar pointer"
              />
            </CustomTooltip>
          ) : (
            selectedChat?.isGroupChat && <span style={{ width: 30 }}></span>
          )}
          <div
            className={`msgBox d-flex flex-column text-start p-2 rounded-3
          mx-2 mx-md-3 ${isLoggedInUser ? "yourMsg" : "receiversMsg"}`}
            data-msg={currMsgId}
            data-file-exists={file_id}
          >
            {isEditMode ? (
              <div
                className="d-flex justify-content-end"
                style={{ margin: "-5px -5px 3px 0px" }}
              >
                {(!currMsg?.fileUrl ||
                  (msgFileRemoved && !attachmentData?.attachment)) && (
                  <CustomTooltip title="Attach File" placement="top-end" arrow>
                    <IconButton
                      data-attach-msg-file={true}
                      className={`me-1`}
                      sx={{ ...IconButtonSx, transform: "rotateZ(45deg)" }}
                    >
                      <AttachFile
                        data-attach-msg-file={true}
                        style={{ fontSize: 20 }}
                      />
                    </IconButton>
                  </CustomTooltip>
                )}
                <CustomTooltip title="Discard Draft" placement="top-end" arrow>
                  <IconButton
                    data-discard-draft={true}
                    className={``}
                    sx={IconButtonSx}
                  >
                    <Close data-discard-draft={true} style={{ fontSize: 20 }} />
                  </IconButton>
                </CustomTooltip>
                <CustomTooltip title="Update Message" placement="top-end" arrow>
                  <IconButton
                    data-update-msg={true}
                    data-msg-created-at={currMsg?.createdAt}
                    className={`ms-1`}
                    sx={IconButtonSx}
                  >
                    <Done
                      data-update-msg={true}
                      data-msg-created-at={currMsg?.createdAt}
                      style={{ fontSize: 20 }}
                    />
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
                data-file-exists={file_id}
                title="Edit/Delete Message"
                className={`msgOptionsIcon text-light position-absolute 
              top-0 end-0 w-25 h-100`}
              >
                <KeyboardArrowDown
                  data-msg={currMsgId}
                  data-file-exists={file_id}
                  style={{ fontSize: 22 }}
                  className="position-absolute top-0 end-0"
                />
              </span>
            )}
            {currMsg?.fileUrl && !isEditMode && (
              <MsgAttachment
                msgSent={msgSent}
                isPreview={false}
                isEditMode={isEditMode}
                fileEditIcons={fileEditIcons}
                downloadingFileId={downloadingFileId}
                loadingMediaId={loadingMediaId}
                fileData={
                  {
                    msgId: currMsgId,
                    fileUrl,
                    file_id,
                    file_name,
                  } as AttachmentFileData
                }
              />
            )}
            {isEditMode && attachmentData?.attachment && (
              <AttachmentPreview
                isEditMode={isEditMode}
                attachmentData={attachmentData}
                CustomTooltip={CustomTooltip}
                fileEditIcons={fileEditIcons}
              />
            )}
            {currMsg?.fileUrl &&
              isEditMode &&
              !attachmentData?.attachment &&
              !msgFileRemoved && (
                <MsgAttachment
                  msgSent={msgSent}
                  isEditMode={isEditMode}
                  isPreview={false}
                  fileEditIcons={fileEditIcons}
                  downloadingFileId={downloadingFileId}
                  loadingMediaId={loadingMediaId}
                  fileData={
                    {
                      msgId: currMsgId,
                      fileUrl,
                      file_id,
                      file_name,
                    } as AttachmentFileData
                  }
                />
              )}
            <div
              data-msg={currMsgId}
              data-file-exists={file_id}
              className={`msgContent d-flex ${
                file_id || attachmentData?.attachment ? "mt-2" : ""
              }`}
            >
              <span
                id={`${currMsg?._id}---content`}
                className="w-100"
                style={{ outline: "none" }}
                contentEditable={isEditMode}
                data-msg-created-at={currMsg?.createdAt}
                ref={
                  (isEditMode
                    ? editableMsgRef
                    : msgContentRef) as React.LegacyRef<HTMLSpanElement>
                }
              ></span>
              <span
                data-msg={currMsgId}
                data-file-exists={file_id}
                className="msgTime text-end d-flex align-items-end justify-content-end"
              >
                {msgTimeStringOf(currMsgDate)}
                {isLoggedInUser && (
                  <>
                    {msgSent ? (
                      <DoneAll
                        data-msg={currMsgId}
                        data-file-exists={file_id}
                        className="text-info fs-6 ms-1"
                      />
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
  }
);
export default Message;
