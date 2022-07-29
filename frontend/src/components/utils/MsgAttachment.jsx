import {
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
  getFileSizeString,
  isImageOrGifFile,
  truncateString,
} from "../../utils/appUtils";
import animationData from "../../animations/app-loading.json";
import LottieAnimation from "../utils/LottieAnimation";
import { useRef } from "react";

const IMG_BASE_URL = process.env.REACT_APP_CLOUDINARY_BASE_URL;

const MsgAttachment = ({
  msgSent,
  downloadingFileId,
  loadingMediaId,
  isPreview,
  fileData,
}) => {
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
  const mediaFileSize = getFileSizeString(mediaContents[2]);
  const loadingGif = useRef(null);

  let fileSize = mediaContents[0] || parseInt(fileContents[1]) || size || "";

  if (!isMediaFile) {
    fileSize = getFileSizeString(fileSize);
  }

  const isDownloadingFile = downloadingFileId === file_id;
  const fileType =
    mediaFileType?.startsWith("video/") ||
    /(\.mp4|\.mov|\.ogv|\.webm)$/.test(file_name)
      ? "Video"
      : mediaFileType?.startsWith("audio/") ||
        /(\.mp3|\.ogg|\.wav)$/.test(file_name)
      ? "Audio"
      : /(\.doc|\.docx)$/.test(file_name)
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
  const hideWhileLoadingMedia =
    loadingMediaId === file_id ? "invisible" : "visible";

  const displayWhileLoadingMedia =
    loadingMediaId === file_id ? "visible" : "invisible";

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
          className="pointer"
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
              <div>
                {downloadIcon}
                {` ${mediaFileSize}`}
              </div>
              {fileNameWrapper}
              <div
                data-video={file_id}
                data-video-name={file_name}
                title="Click to Play"
                className="mediaMsg bg-gradient py-5"
              >
                <PlayCircle
                  data-video={file_id}
                  data-video-name={file_name}
                  className={`playMedia ${hideWhileLoadingMedia}`}
                  style={{ fontSize: 40 }}
                />
                <LottieAnimation
                  ref={loadingGif}
                  className={`position-absolute ${displayWhileLoadingMedia}`}
                  style={{
                    marginBottom: 0,
                    height: 50,
                    color: "white",
                  }}
                  animationData={animationData}
                />
                <span
                  data-video={file_id}
                  data-video-name={file_name}
                  className="mediaDuration videoDuration text-light"
                >
                  <Videocam data-video={file_id} data-video-name={file_name} />
                  &nbsp;&nbsp;{fileSize}
                </span>
              </div>
            </div>
          ) : fileType === "Audio" ? (
            <div
              className={`${previewStyles} msgFile mediaFile bg-dark bg-opacity-75`}
            >
              <div>
                {downloadIcon}
                {` ${mediaFileSize}`}
              </div>
              {fileNameWrapper}
              <div
                data-audio={file_id}
                data-audio-name={file_name}
                className="mediaMsg bg-gradient px-4 py-2"
                title="Click to Play"
              >
                <PlayArrow
                  data-audio={file_id}
                  data-audio-name={file_name}
                  className={`playMedia ${hideWhileLoadingMedia}`}
                />
                <LottieAnimation
                  ref={loadingGif}
                  className={`position-absolute ${displayWhileLoadingMedia}`}
                  style={{
                    marginBottom: 0,
                    height: 30,
                    color: "white",
                  }}
                  animationData={animationData}
                />
                <span
                  data-audio={file_id}
                  data-audio-name={file_name}
                  className="mediaDuration audioDuration text-light"
                >
                  <Audiotrack
                    data-audio={file_id}
                    data-audio-name={file_name}
                    style={{ fontSize: 20 }}
                  />
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
