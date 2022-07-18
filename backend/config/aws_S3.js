import AWS from "aws-sdk";
import { config } from "dotenv";
config();

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION,
});
const s3 = new AWS.S3();
const s3_bucket = process.env.S3_BUCKET;

export { s3, s3_bucket };
