import { Close } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { truncateString } from "../../utils/appUtils";
import MsgAttachment from "./MsgAttachment";

const PLACEHOLDER_IMG = process.env.REACT_APP_PLACEHOLDER_IMG_URL;

const AttachmentPreview = ({
  isEditMode,
  attachmentData,
  CustomTooltip,
  fileEditIcons,
}) => {
  const {
    attachment: { name, type, size },
    attachmentPreviewUrl,
  } = attachmentData;

  const FILE_WRAPPER_CLASS = `${
    isEditMode ? "h-100" : "mt-4 h-50"
  } d-flex justify-content-center align-items-center`;
  const ATTACHMENT_STYLE = {
    borderRadius: 7,
    width: "calc(100%)",
    maxHeight: isEditMode ? 200 : 250,
  };
  const editIconsWrapper = (
    <span className="position-absolute top-0 start-0 m-1" style={{ zIndex: 6 }}>
      {fileEditIcons}
    </span>
  );

  const previewTitle = type.startsWith("application/") ? "Attached File" : name;

  return (
    <div
      className="bg-black bg-gradient bg-opacity-75 h-100 d-flex flex-column justify-content-start align-items-center"
      style={{ borderRadius: 10 }}
    >
      {/* Discard Attachment button */}
      {!isEditMode && (
        <CustomTooltip
          title="Discard Attachment"
          placement="bottom-start"
          arrow
        >
          <IconButton
            data-discard-file={true}
            sx={{
              position: "absolute",
              left: 15,
              top: 12,
              color: "#999999",
              ":hover": {
                backgroundColor: "#aaaaaa20",
              },
            }}
          >
            <Close data-discard-file={true} />
          </IconButton>
        </CustomTooltip>
      )}

      {/* Attached File Name */}
      {!isEditMode && (
        <CustomTooltip
          title={previewTitle?.length > 23 ? previewTitle : ""}
          placement="top"
          arrow
        >
          <span
            className={`mt-5 mb-2`}
            style={{ color: "lightblue", fontSize: 25, zIndex: 5 }}
          >
            {truncateString(previewTitle, 23, 20) || "Attached File"}
          </span>
        </CustomTooltip>
      )}

      <>
        {type?.startsWith("image/") ? (
          <div className={`${FILE_WRAPPER_CLASS} position-relative`}>
            {editIconsWrapper}
            <img
              style={ATTACHMENT_STYLE}
              src={attachmentPreviewUrl || PLACEHOLDER_IMG}
              alt="msgAttachment"
            />
          </div>
        ) : type?.startsWith("audio/") ? (
          <div
            className={`${FILE_WRAPPER_CLASS} flex-column`}
            style={{ width: "clamp(190px, 48vw, 290px)" }}
          >
            <span className="m-2" style={{ zIndex: 6 }}>
              {fileEditIcons}
            </span>
            <audio
              src={attachmentPreviewUrl || ""}
              controls
              autoPlay
              style={ATTACHMENT_STYLE}
            >
              {name}
            </audio>
          </div>
        ) : type?.startsWith("video/") ? (
          <div className={`${FILE_WRAPPER_CLASS} position-relative`}>
            {editIconsWrapper}
            <video
              src={attachmentPreviewUrl || ""}
              controls
              autoPlay
              style={ATTACHMENT_STYLE}
            >
              {name}
            </video>
          </div>
        ) : (
          <MsgAttachment
            isEditMode={isEditMode}
            fileEditIcons={fileEditIcons}
            isPreview={true}
            fileData={{
              fileUrl: attachmentPreviewUrl,
              file_id: "",
              file_name: name,
              size,
            }}
          />
        )}
      </>
    </div>
  );
};

export default AttachmentPreview;
