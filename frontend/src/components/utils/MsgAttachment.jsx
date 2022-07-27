import {
  AudioFile,
  Description,
  Download,
  Downloading,
  PictureAsPdf,
  PlayCircle,
  Videocam,
} from "@mui/icons-material";
import {
  isImageOrGifFile,
  ONE_KB,
  ONE_MB,
  truncateString,
} from "../../utils/appUtils";

const IMG_BASE_URL = process.env.REACT_APP_CLOUDINARY_BASE_URL;

const MsgAttachment = ({ msgSent, downloadingFileId, isPreview, fileData }) => {
  const previewStyles = `${
    isPreview ? "py-4 border border-4 border-secondary previewFile" : ""
  }`;
  const iconStyles = `${isPreview ? "fs-1" : "fs-2"}`;

  let { fileUrl, file_id, file_name, size } = fileData;
  const fileContents = file_name.split("===");
  file_name = fileContents[0];
  const isVideoDuration = fileContents[1]?.includes(":");

  let fileSize = isVideoDuration
    ? fileContents[1]
    : parseInt(fileContents[1]) || size || "";

  if (!isVideoDuration) {
    fileSize = !fileSize
      ? ""
      : fileSize > ONE_MB
      ? (fileSize / ONE_MB).toFixed(1) + " MB"
      : fileSize > ONE_KB
      ? (fileSize / ONE_KB).toFixed(0) + " KB"
      : fileSize + " B";
  }

  const isDownloadingFile = downloadingFileId === file_id;
  const fileType = /(\.mp4|\.webm)$/.test(file_name)
    ? "Video"
    : /(\.doc|\.docx)$/.test(file_name)
    ? "Word Doc"
    : /(\.mp3|\.wav)$/.test(file_name)
    ? "Audio"
    : /(\.ppt|\.pptx)$/.test(file_name)
    ? "PPT"
    : /(\.xlsx|\.csv|\.xls)$/.test(file_name)
    ? "Spreadsheet"
    : /(\.pdf)$/.test(file_name)
    ? "PDF"
    : file_name.substring(file_name.lastIndexOf(".") + 1)?.toUpperCase();

  const downloadIcon = (
    <span
      data-download={file_id}
      className={`downloadIcon ${isDownloadingFile ? "downloading" : ""} ${
        isPreview || !msgSent ? "d-none" : ""
      }`}
      title={isDownloadingFile ? "Downloading..." : "Download File"}
    >
      {isDownloadingFile ? (
        <Downloading />
      ) : (
        <Download data-download={file_id} />
      )}
    </span>
  );
  const fileInfo = (
    <>
      <span className={`${isPreview ? "fs-4" : "fs-6"}`}>
        &nbsp;&nbsp;
        <span title={file_name}>{truncateString(file_name + "", 40, 37)}</span>
      </span>
      <div
        className={`${isPreview ? "fs-5 mt-4" : ""}`}
        style={{ marginBottom: isPreview ? -10 : 0 }}
      >
        {`${fileType} : ${fileSize}`}
      </div>
    </>
  );

  return (
    <>
      {fileUrl?.startsWith(IMG_BASE_URL) || isImageOrGifFile(file_name) ? (
        <span className="d-inline-block msgImageWrapper mb-2">
          <img
            src={fileUrl}
            alt={file_name}
            title={file_name}
            data-image-id={file_id}
            className={`msgImageFile d-inline-block`}
          />
        </span>
      ) : (
        <div
          style={{ width: isPreview ? "clamp(270px, 50vmin, 600px)" : "100%" }}
        >
          {fileType === "PDF" ? (
            <div className={`${previewStyles} msgFile pdfFile text-light`}>
              <div>
                <PictureAsPdf className={iconStyles} />
                {downloadIcon}
              </div>
              {fileInfo}
            </div>
          ) : fileType === "Spreadsheet" ? (
            <div className={`${previewStyles} msgFile excelFile bg-success`}>
              <div>
                <Description className={iconStyles} />
                {downloadIcon}
              </div>
              {fileInfo}
            </div>
          ) : fileType === "PPT" ? (
            <div className={`${previewStyles} msgFile pptFile text-light`}>
              <div>
                <Description className={iconStyles} />
                {downloadIcon}
              </div>
              {fileInfo}
            </div>
          ) : fileType === "Word Doc" ? (
            <div className={`${previewStyles} msgFile wordFile`}>
              <div>
                <Description className={iconStyles} />
                {downloadIcon}
              </div>
              {fileInfo}
            </div>
          ) : fileType === "Video" ? (
            <div className={`${previewStyles} msgFile videoFile`}>
              <div
                title={file_name + "\n(Click to Play)"}
                className="videoMsg bg-gradient py-5"
              >
                <PlayCircle className="playVideo" style={{ fontSize: 40 }} />
                <span className="videoMsgDuration text-light">
                  <Videocam />
                  &nbsp;&nbsp;{fileSize}
                </span>
              </div>
              {/* {fileInfo} */}
            </div>
          ) : fileType === "Audio" ? (
            <div
              className={`${previewStyles} msgFile audioFile bg-dark bg-opacity-75`}
            >
              <div>
                <AudioFile className={iconStyles} />
                {downloadIcon}
              </div>
              {/* {fileInfo} */}
            </div>
          ) : (
            <div className={`${previewStyles} msgFile otherFile`}>
              <div>
                <Description className={iconStyles} />
                {downloadIcon}
              </div>
              {fileInfo}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MsgAttachment;
