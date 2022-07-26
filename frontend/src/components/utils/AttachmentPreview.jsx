import { Close } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { truncateString } from "../../utils/appUtils";
import MsgAttachment from "./MsgAttachment";

const FILE_WRAPPER_CLASS =
  "mt-4 h-50 d-flex justify-content-center align-items-center";
const ATTACHMENT_STYLE = {
  borderRadius: 7,
  width: "clamp(290px, 90%, 700px)",
  maxHeight: 260,
};
const PLACEHOLDER_IMG = process.env.REACT_APP_PLACEHOLDER_IMG_URL;

const AttachmentPreview = ({
  attachmentData,
  discardAttachment,
  CustomTooltip,
}) => {
  const {
    attachment: { name, type, size },
    attachmentPreviewUrl,
  } = attachmentData;

  const previewTitle = type.startsWith("application/") ? "Attached File" : name;

  return (
    <div
      className="bg-black bg-gradient bg-opacity-75 h-100 d-flex flex-column justify-content-start align-items-center"
      style={{ borderRadius: 10 }}
    >
      {/* Discard Attachment button */}
      <CustomTooltip title="Discard Attachment" placement="bottom-start" arrow>
        <IconButton
          onClick={discardAttachment}
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
          <Close />
        </IconButton>
      </CustomTooltip>
      {/* Attached File Name */}
      <CustomTooltip
        title={previewTitle?.length > 23 ? previewTitle : ""}
        placement="top"
        arrow
      >
        <span
          className={`mt-4 mb-3`}
          style={{ color: "lightblue", fontSize: 25, zIndex: 5 }}
        >
          {truncateString(previewTitle || "Attached File", 23, 20)}
        </span>
      </CustomTooltip>
      <>
        {type?.startsWith("image/") ? (
          <div className={`${FILE_WRAPPER_CLASS}`}>
            <img
              style={ATTACHMENT_STYLE}
              src={attachmentPreviewUrl || PLACEHOLDER_IMG}
              alt="msgAttachment"
            />
          </div>
        ) : type?.startsWith("audio/") ? (
          <div className={`${FILE_WRAPPER_CLASS}`} style={{ width: "85%" }}>
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
          <div className={`${FILE_WRAPPER_CLASS}`}>
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
          <div className={`${FILE_WRAPPER_CLASS}`}>
            <MsgAttachment
              isPreview={true}
              fileData={{
                fileUrl: attachmentPreviewUrl,
                file_id: "",
                file_name: name,
                size,
              }}
            />
          </div>
        )}
      </>
    </div>
  );
};

export default AttachmentPreview;
