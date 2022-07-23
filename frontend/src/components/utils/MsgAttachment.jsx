import React from "react";

const MsgAttachment = ({ fileData }) => {
  const { fileUrl, file_id, file_name } = fileData;
  return (
    <>
      {fileUrl?.startsWith("https://res.cloudinary.com") ? (
        <span className="d-inline-block msgImageWrapper">
          <img
            src={fileUrl}
            alt={file_name}
            title={file_name}
            data-image-id={file_id}
            className={`msgImageFile d-inline-block`}
          />
        </span>
      ) : (
        <>Non image attachment</>
      )}
    </>
  );
};

export default MsgAttachment;
