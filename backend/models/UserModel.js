import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, trim: true },
    notifications: [{ type: ObjectId, ref: "Message" }],
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

// Arrow fn won't work here, as 'this' in arrow fn will point to 'module.exports'
// but in regular fn, 'this' will point to 'userSchema', which is what we want

// Checking if entered password by user during login is authentic
userSchema.methods.matchPasswords = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  // Encrypt the password only if it's modified or created
  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
      return;
    } catch (error) {
      next(error);
    }
  }
  next();
});

userSchema.pre("updateOne", async function (next) {
  // Encrypt the updated password
  const updatedPassword = this.getUpdate().$set.password;
  if (updatedPassword) {
    try {
      const salt = await bcrypt.genSalt();
      this.getUpdate().$set.password = await bcrypt.hash(updatedPassword, salt);
      return;
    } catch (error) {
      next(error);
    }
  }
  next();
});

export default mongoose.model("User", userSchema);
