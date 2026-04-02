import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import Release from "../models/Release.js";
import { sendSubmissionSlackNotification } from "../utils/slack.js";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-");

export const getPresignedUrl = async (req, res) => {
  try {
    const { fileName, fileType, releaseTitle } = req.body;
    const artistName = req.user.stageName || req.user._id.toString(); // Use Stage Name if available

    // Organized Path: artist/release-title/audio/uuid-filename
    const folderPath = `${slugify(artistName)}/${slugify(releaseTitle)}/audio`;
    const fileKey = `${folderPath}/${uuidv4()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    res.status(200).json({ uploadUrl, fileUrl, fileKey });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate upload URL" });
  }
};

// @route   POST /api/users/releases
// @access  Private (Artist)
export const createRelease = async (req, res) => {
  try {
    const {
      releaseTitle,
      releaseType,
      artworkUrl,
      releaseDate,
      preOrderDate,
      timeZone,
      genre,
      label,
      language,
      cLine,
      pLine,
      upc,
      featuredArtists,
      tracks,
    } = req.body;

    // 1. Safety Validation
    if (
      !releaseTitle ||
      !releaseType ||
      !artworkUrl ||
      !releaseDate ||
      !genre ||
      !tracks ||
      tracks.length === 0
    ) {
      return res.status(400).json({
        message: "Please provide all required fields and at least one track.",
      });
    }

    // 🚀 2. FORMAT DATA FOR HYBRID SCHEMA 🚀

    // Format Release-level features
    const formattedReleaseArtists = Array.isArray(featuredArtists)
      ? featuredArtists.map((name) => ({
          name: name,
          user: null,
        }))
      : [];

    // Format Track-level features
    const formattedTracks = Array.isArray(tracks)
      ? tracks.map((track) => {
          // Check if the track has features, if so map them, otherwise return empty array
          const formattedTrackArtists = Array.isArray(track.featuredArtists)
            ? track.featuredArtists.map((name) => ({
                name: name,
                user: null,
              }))
            : [];

          return {
            ...track,
            featuredArtists: formattedTrackArtists,
          };
        })
      : [];

    // 3. Create the document
    const newRelease = await Release.create({
      primaryArtist: req.user._id,
      title: releaseTitle,
      releaseType,
      artwork: artworkUrl,
      releaseDate,
      preOrderDate,
      timeZone,
      genre,
      label,
      language,
      cLine,
      pLine,
      upc,
      featuredArtists: formattedReleaseArtists, // 👈 Pushing the mapped array
      tracks: formattedTracks, // 👈 Pushing the mapped array
      status: "pending",
    });

    // 🚀 THE SLACK TRIGGER
    const slackMessage = `💥 *New Release Submitted!*\n*Artist:* ${req.user.stageName || "Unknown"}\n*Title:* ${releaseTitle}\n*Type:* ${releaseType}\n*Tracks:* ${formattedTracks.length}\nGo to God Mode to review it.`;

    // Run this without blocking the response to the user
    sendSubmissionSlackNotification(slackMessage).catch((err) =>
      console.error("Slack Notification Failed:", err),
    );

    res.status(201).json({
      message: "Release submitted successfully!",
      release: newRelease,
    });
  } catch (error) {
    console.error("Error creating release:", error);
    res
      .status(500)
      .json({ message: "Server error while saving the release document." });
  }
};

// @desc    Get all releases for the logged-in artist's dashboard
// @route   GET /api/users/releases
// @access  Private (Artist)
export const getUserReleases = async (req, res) => {
  try {
    // Fetch releases belonging to the user and sort by newest first
    // In your backend release controller:
    const releases = await Release.find({ primaryArtist: req.user._id })
      .populate("primaryArtist", "stageName") // 👈 This fetches the stageName from the User model!
      .sort({ createdAt: -1 });

    res.status(200).json(releases);
  } catch (error) {
    console.error("Error fetching releases:", error);
    res.status(500).json({ message: "Server error while fetching releases." });
  }
};

export const uploadArtwork = async (req, res) => {
  try {
    const { releaseTitle } = req.body; // Sent via FormData
    const artistName = req.user.stageName || req.user._id.toString();

    if (!req.file)
      return res.status(400).json({ message: "No artwork provided." });

    const fileExt = req.file.originalname.split(".").pop();
    // Organized Path: artist/release-title/artwork/uuid.ext
    const folderPath = `${slugify(artistName)}/${slugify(releaseTitle || "untitled")}/artwork`;
    const fileKey = `${folderPath}/${uuidv4()}.${fileExt}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    await s3Client.send(command);
    const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    res.status(200).json({ imageUrl });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload artwork." });
  }
};
