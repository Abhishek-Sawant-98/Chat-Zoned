const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true },
    cloudinary_id: { type: String, trim: true, default: "" },
    profilePic: {
      type: String,
      trim: true,
      default:
        "https://res.cloudinary.com/abhi-sawant/image/upload/v1653670527/user_dqzjdz.png",
    },
  },
  { timestamps: true }
);

// Checking if entered password by user during login is authentic
userSchema.methods.matchPasswords = async (enteredPassword) => {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async (next) => {
  // Encrypt the password only if it's modified or created
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    return;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
