import fs from "fs";
import { promisify } from "util";
import cloudinary from "../config/cloudinary.js";
import { s3, s3_bucket } from "../config/aws_S3.js";

// Async method for deleting a file from this server
const deleteFile = promisify(fs.unlink);

// Delete the existing file from its respective location
const deleteExistingAttachment = async (fileUrl, file_id) => {
  return fileUrl.startsWith("https://res.cloudinary.com")
    ? cloudinary.uploader.destroy(file_id)
    : s3.deleteObject({ Bucket: s3_bucket, Key: file_id }).promise();
};

export { deleteFile, deleteExistingAttachment };
