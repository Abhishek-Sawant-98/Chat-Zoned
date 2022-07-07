require("dotenv").config();
const aws = require("aws-sdk");

aws.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION,
});
const s3 = new aws.S3();
const s3_bucket = process.env.S3_BUCKET;

module.exports = { s3, s3_bucket };
