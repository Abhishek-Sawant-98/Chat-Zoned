const fs = require("fs");
const { promisify } = require("util");

// Async method for deleting a file from this server
module.exports = promisify(fs.unlink);
