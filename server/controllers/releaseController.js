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
// @route   POST /api/users/releases
// @access  Private (Artist)
export const createRelease = async (req, res) => {
  try {
    const {
      releaseId, // 👈 New: To check if we are updating an existing draft
      isDraft, // 👈 New: Boolean from frontend
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

    // 1. CONDITIONAL VALIDATION
    // Only run strict checks if the user is actually SUBMITTING (not drafting)
    if (!isDraft) {
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
          message:
            "Please provide all required fields and at least one track before submitting.",
        });
      }
    }

    // 2. FORMAT DATA (Same hybrid logic, but handles empty arrays for drafts)
    const formattedReleaseArtists = Array.isArray(featuredArtists)
      ? featuredArtists.map((name) => ({ name, user: null }))
      : [];

    const formattedTracks = Array.isArray(tracks)
      ? tracks.map((track) => ({
          ...track,
          featuredArtists: Array.isArray(track.featuredArtists)
            ? track.featuredArtists.map((name) => ({ name, user: null }))
            : [],
        }))
      : [];

    // 3. THE "UPSERT" LOGIC (Update or Create)
    const releaseData = {
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
      featuredArtists: formattedReleaseArtists,
      tracks: formattedTracks,
      status: isDraft ? "draft" : "pending", // 🚀 The Status Switch
    };

    let savedRelease;

    if (releaseId) {
      // Update existing draft
      savedRelease = await Release.findOneAndUpdate(
        { _id: releaseId, primaryArtist: req.user._id },
        { $set: releaseData },
        { new: true, runValidators: true },
      );
    } else {
      // Create brand new document
      savedRelease = await Release.create(releaseData);
    }

    // 4. CONDITIONAL SLACK TRIGGER
    // We only ping Slack if it's a real submission
    if (!isDraft) {
      const slackMessage = `💥 *New Release Submitted!*\n*Artist:* ${
        req.user.stageName || "Unknown"
      }\n*Title:* ${releaseTitle}\n*Type:* ${releaseType}\n*Tracks:* ${
        formattedTracks.length
      }\nGo to God Mode to review it.`;

      sendSubmissionSlackNotification(slackMessage).catch((err) =>
        console.error("Slack Notification Failed:", err),
      );
    }

    res.status(releaseId ? 200 : 201).json({
      message: isDraft
        ? "Draft saved successfully!"
        : "Release submitted successfully!",
      release: savedRelease,
    });
  } catch (error) {
    console.error("Error saving release:", error);
    res.status(500).json({ message: "Server error while saving release." });
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

// @desc    Get a single release by ID
// @route   GET /api/releases/:id
// @access  Private (Artist)
export const getReleaseById = async (req, res) => {
  try {
    const release = await Release.findOne({
      _id: req.params.id,
      primaryArtist: req.user._id,
    });

    if (!release) {
      return res.status(404).json({ message: "Release not found." });
    }

    res.status(200).json(release);
  } catch (error) {
    console.error("Error fetching release:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching release details." });
  }
};
