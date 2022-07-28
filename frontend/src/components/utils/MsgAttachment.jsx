import {
  AudioFile,
  Audiotrack,
  Description,
  Download,
  Downloading,
  PictureAsPdf,
  PlayArrow,
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
  const fileContents = file_name.split("===") || [];
  file_name = fileContents[0] || file_name;
  const isMediaFile = fileContents[1]?.includes(":");
  const mediaContents = isMediaFile ? fileContents[1].split("+++") : [];
  const mediaFileType = mediaContents[1];

  let fileSize = mediaContents[0] || parseInt(fileContents[1]) || size || "";

  if (!isMediaFile) {
    fileSize = !fileSize
      ? ""
      : fileSize > ONE_MB
      ? (fileSize / ONE_MB).toFixed(1) + " MB"
      : fileSize > ONE_KB
      ? (fileSize / ONE_KB).toFixed(0) + " KB"
      : fileSize + " B";
  }

  const isDownloadingFile = downloadingFileId === file_id;
  const fileType =
    mediaFileType?.startsWith("video/") ||
    /(\.mp4|\.mov|\.ogv|\.webm)$/.test(file_name)
      ? "Video"
      : mediaFileType?.startsWith("audio/") ||
        /(\.mp3|\.ogg|\.wav)$/.test(file_name)
      ? "Audio"
      : /^(\.doc|\.docx)$/.test(file_name)
      ? "Word Doc"
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
  const fileNameWrapper = (
    <span className={`${isPreview ? "fs-4" : "fs-6"}`}>
      &nbsp;&nbsp;
      <span title={file_name}>{truncateString(file_name + "", 40, 37)}</span>
    </span>
  );
  const fileInfo = (
    <>
      {fileNameWrapper}
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
            <div className={`${previewStyles} msgFile mediaFile`}>
              {fileNameWrapper}
              <div
                data-media={file_id}
                title="Click to Play"
                className="mediaMsg bg-gradient py-5"
              >
                <PlayCircle
                  data-media={file_id}
                  className="playMedia"
                  style={{ fontSize: 40 }}
                />
                <span
                  data-media={file_id}
                  className="mediaDuration videoDuration text-light"
                >
                  <Videocam data-media={file_id} />
                  &nbsp;&nbsp;{fileSize}
                </span>
              </div>
            </div>
          ) : fileType === "Audio" ? (
            <div
              className={`${previewStyles} msgFile mediaFile bg-dark bg-opacity-75`}
            >
              {fileNameWrapper}
              <div
                data-media={file_id}
                className="mediaMsg bg-gradient px-4 py-2"
                title="Click to Play"
              >
                <PlayArrow data-media={file_id} className="playMedia" />
                <span
                  data-media={file_id}
                  className="mediaDuration audioDuration text-light"
                >
                  <Audiotrack data-media={file_id} style={{ fontSize: 20 }} />
                  &nbsp;{fileSize}
                </span>
              </div>
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
