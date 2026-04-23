import ArtistProfile from "../models/ArtistProfile.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

const s3Client = new S3Client({ region: process.env.AWS_REGION });

// @desc    Get current user's artist profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const profile = await ArtistProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create or update artist profile
// @route   POST /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    // Upsert: Find by user ID. If it exists, update with req.body. If not, create new.
    const profile = await ArtistProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: { ...req.body, user: req.user._id } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Upload artist profile image to AWS
// @route   POST /api/users/profile/image
// @access  Private
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // 1. Define S3 Upload Parameters
    const fileKey = `artist_profiles/${req.user._id}-${Date.now()}-${req.file.originalname}`;
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    // 2. Execute Upload
    await s3Client.send(new PutObjectCommand(uploadParams));

    // Construct the public URL (ensure your bucket has public read or use CloudFront)
    const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    // 3. Update Database
    const updatedProfile = await ArtistProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: { profileImage: imageUrl },
        $setOnInsert: { artistName: req.user.stageName || "New Artist" },
      },
      { upsert: true, new: true, runValidators: false },
    );

    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error("S3 Upload/DB Error:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};
