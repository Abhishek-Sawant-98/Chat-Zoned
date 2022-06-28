const fs = require("fs");
const { promisify } = require("util");
const cloudinary = require("../config/cloudinary");

// Async method for deleting a file from this server
const deleteFile = promisify(fs.unlink);

// Delete the existing file from its respective location
const deleteExistingAttachment = async (fileUrl, file_id) => {
  fileUrl.startsWith("https://res.cloudinary.com")
    ? await cloudinary.uploader.destroy(file_id)
    : await deleteFile(file_id);
};

module.exports = { deleteFile, deleteExistingAttachment };
