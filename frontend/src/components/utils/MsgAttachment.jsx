import {
  Article,
  Download,
  Downloading,
  PictureAsPdf,
} from "@mui/icons-material";
import { isImageOrGifFile, ONE_KB, ONE_MB } from "../../utils/appUtils";

const IMG_BASE_URL = process.env.REACT_APP_CLOUDINARY_BASE_URL;

const MsgAttachment = ({ msgSent, downloadingFileId, isPreview, fileData }) => {
  const previewStyles = `${
    isPreview
      ? "py-4 px-2 mx-5 border border-4 border-secondary previewFile"
      : ""
  }`;
  const iconStyles = `${isPreview ? "fs-1" : "fs-2"}`;

  let { fileUrl, file_id, file_name, size } = fileData;
  const fileContents = file_name.split("===");
  file_name = fileContents[0];
  let fileSize = parseInt(fileContents[1]) || size || "";
  fileSize = !fileSize
    ? ""
    : fileSize > ONE_MB
    ? (fileSize / ONE_MB).toFixed(1) + " MB"
    : fileSize > ONE_KB
    ? (fileSize / ONE_KB).toFixed(0) + " KB"
    : fileSize + " B";

  const isDownloadingFile = downloadingFileId === file_id;
  const downloadIcon = (
    <span
      data-download={file_id}
      className={`downloadIcon ${isDownloadingFile ? "downloading" : ""} ${
        isPreview || !msgSent ? "d-none" : ""
      }`}
      title="Download File"
    >
      {isDownloadingFile ? (
        <Downloading />
      ) : (
        <Download data-download={file_id} />
      )}
    </span>
  );
  const attachment = (
    <>
      <div>
        {file_name?.endsWith(".pdf") ? (
          <PictureAsPdf className={iconStyles} />
        ) : (
          <Article className={iconStyles} />
        )}
        {downloadIcon}
      </div>
      <span className={`${isPreview ? "fs-4" : "fs-6"}`}>
        &nbsp;&nbsp;
        <span>{file_name + ""}</span>
      </span>
      <div
        className={`${isPreview ? "fs-5 mt-4" : ""}`}
        style={{ marginBottom: isPreview ? -10 : 0 }}
      >
        {fileSize}
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
        <>
          {file_name?.endsWith(".pdf") ? (
            <div className={`${previewStyles} msgFile pdfFile text-light`}>
              {attachment}
            </div>
          ) : /(\.xlsx|\.csv|\.xls)$/.test(file_name) ? (
            <div
              className={`${previewStyles} msgFile excelFile bg-success bg-opacity-75`}
            >
              {attachment}
            </div>
          ) : /(\.ppt|\.pptx)$/.test(file_name) ? (
            <div
              className={`${previewStyles} msgFile pptFile bg-warning text-black bg-opacity-75`}
            >
              {attachment}
            </div>
          ) : /(\.doc|\.docx)$/.test(file_name) ? (
            <div
              className={`${previewStyles} msgFile wordFile bg-primary bg-opacity-75`}
            >
              {attachment}
            </div>
          ) : /(\.mp4|\.webm)$/.test(file_name) ? (
            <div className={`${previewStyles} msgFile videoFile`}>
              <video src={""}>{file_name}</video>
            </div>
          ) : /(\.mp3|\.wav)$/.test(file_name) ? (
            <div className={`${previewStyles} msgFile audioFile`}>
              <audio src={""}>{file_name}</audio>
            </div>
          ) : (
            <div className={`${previewStyles} msgFile otherFile`}>
              {attachment}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default MsgAttachment;
