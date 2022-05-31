const mongoose = require("mongoose");

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const userNotificationSchema = new Schema({
  userId: { type: String, trim: true },
  notifications: [{ type: ObjectId, ref: "Message" }],
});

module.exports = mongoose.model("UserNotification", userNotificationSchema);
