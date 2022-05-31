const asyncHandler = require("express-async-handler");

const fetchMessages = asyncHandler(async (req, res) => {});

const sendMessage = asyncHandler(async (req, res) => {});

const updateMessage = asyncHandler(async (req, res) => {});

const deleteMessage = asyncHandler(async (req, res) => {});

module.exports = { fetchMessages, sendMessage, updateMessage, deleteMessage };
