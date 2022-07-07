const fs = require("fs");
const { promisify } = require("util");
const cloudinary = require("../config/cloudinary");
const { s3, s3_bucket } = require("../config/aws_S3");

// Async method for deleting a file from this server
const deleteFile = promisify(fs.unlink);

// Delete the existing file from its respective location
const deleteExistingAttachment = async (fileUrl, file_id) => {
  return fileUrl.startsWith("https://res.cloudinary.com")
    ? cloudinary.uploader.destroy(file_id)
    : s3.deleteObject({ Bucket: s3_bucket, Key: file_id }).promise();
};

module.exports = { deleteFile, deleteExistingAttachment };
