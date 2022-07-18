import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectToMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`🔥 Connected to MongoDB cluster`);
  } catch (error) {
    console.log(`❌ MongoDB connection error : ${error.message}`);
    process.exit(1);
  }
};

export default connectToMongoDB;
