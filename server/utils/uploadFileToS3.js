import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import dotenv from "dotenv";
dotenv.config();

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Uploads a buffer to S3 and returns the public URL
 * @param {Buffer} fileBuffer - The req.file.buffer from Multer
 * @param {String} fileKey - The destination path (e.g., snippets/userId/filename.mp3)
 * @param {String} contentType - The mime type (e.g., audio/mpeg)
 */
export const uploadFileToS3 = async (fileBuffer, fileKey, contentType) => {
  try {
    const parallelUploads3 = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: contentType,
        // Optional: ACL: 'public-read'
        // Note: Only use ACL if your bucket isn't set to "Block all public access"
      },
    });

    await parallelUploads3.done();

    // Return the clean URL
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
  } catch (err) {
    console.error("S3 Upload Error:", err);
    throw new Error("Failed to upload file to storage");
  }
};
