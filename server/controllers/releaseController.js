import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import Release from "../models/Release.js";
import { notifyAdmin } from "../utils/slack.js";
import dotenv from "dotenv";
dotenv.config();

export const s3Client = new S3Client({
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

const toArtistArray = (input) => {
  if (!input) return [];
  // If it's already an array, just filter/trim it
  if (Array.isArray(input)) {
    return input
      .filter((name) => name && name.trim() !== "")
      .map((name) => name.trim());
  }
  // If it's a string, split by comma and clean it up
  return input
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name !== "");
};

export const getPresignedUrl = async (req, res) => {
  try {
    const { fileName, fileType, releaseTitle } = req.body;
    const artistName = req.user.stageName || req.user._id.toString(); // Use Stage Name if available

    // Organized Path: artist/release-title/audio/uuid-filename
    const safeTitle = releaseTitle?.trim() || "untitled-release";
    const folderPath = `${slugify(artistName)}/${slugify(safeTitle)}/audio`;
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
      primaryArtists,
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

    // 2. FORMAT DATA
    // Format Release-Level Primary Artists
    const primaryNames = toArtistArray(primaryArtists);
    const featuredNames = toArtistArray(featuredArtists);

    const formattedPrimaryArtists = primaryNames.map((name) => ({
      name,
      user: null,
    }));
    const formattedFeaturedArtists = featuredNames.map((name) => ({
      name,
      user: null,
    }));
    // Format Tracks (Now including Primary Artists per track)
    const formattedTracks = Array.isArray(tracks)
      ? tracks.map((track) => ({
          ...track,
          // Handle multiple primary artists per track + filter out empty strings
          primaryArtists: Array.isArray(track.primaryArtists)
            ? track.primaryArtists
                .filter((name) => name && name.trim() !== "") // 👈 Add this filter
                .map((name) => ({ name: name.trim(), user: null }))
            : [],
          // Handle featured artists per track + filter out empty strings
          featuredArtists: Array.isArray(track.featuredArtists)
            ? track.featuredArtists
                .filter((name) => name && name.trim() !== "") // 👈 Add this filter
                .map((name) => ({ name: name.trim(), user: null }))
            : [],
        }))
      : [];

    // 3. SECURE IP DETECTION
    const rawIp =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip;
    // Remove IPv6 prefix if present (e.g., "::ffff:127.0.0.1" -> "127.0.0.1")
    const cleanIp =
      typeof rawIp === "string" && rawIp.startsWith("::ffff:")
        ? rawIp.replace("::ffff:", "")
        : rawIp;

    if (!isDraft) {
      const signedName = req.body.legalConsent?.signedName
        ?.trim()
        .toLowerCase();
      const registeredName = req.user.legalName?.trim().toLowerCase(); // Use the legal name field in your User model

      if (!signedName || signedName !== registeredName) {
        return res.status(400).json({
          message: `Signature mismatch. Please type your full legal name exactly as registered: ${req.user.legalName}`,
        });
      }
    }

    // 3. THE "UPSERT" LOGIC (Update or Create)
    const releaseData = {
      releaseOwner: req.user._id, // Renamed from primaryArtist for clarity
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
      primaryArtists: formattedPrimaryArtists, // 🚀 Added to DB object
      featuredArtists: formattedFeaturedArtists,
      tracks: formattedTracks,
      status: isDraft ? "draft" : "pending",
    };

    if (!isDraft) {
      releaseData.rejectionReason = "";
    }

    // 🚀 Only Attach/Update Legal if it's a Submission
    if (!isDraft) {
      releaseData.legalConsent = {
        agreed: req.body.legalConsent?.agreed || false,
        signedName: req.body.legalConsent?.signedName || "",
        ipAddress: cleanIp,
        agreedAt: new Date(), // This tracks the MOMENT of submission
        version: "1.0.0",
      };
    }

    let savedRelease;

    if (releaseId) {
      // Update existing draft
      savedRelease = await Release.findOneAndUpdate(
        { _id: releaseId, releaseOwner: req.user._id },
        { $set: releaseData },
        {
          new: true,
          runValidators: !isDraft, // 👈 This is your strongest line of defense
        },
      );
    } else {
      // Create brand new document
      savedRelease = await Release.create(releaseData);
    }

    // 4. CONDITIONAL SLACK TRIGGER
    // We only ping Slack if it's a real submission
    if (!isDraft) {
      notifyAdmin(
        `💥 New Release: ${releaseTitle}, Tracks: ${tracks.length}, Primary Artists: ${primaryArtists}`,
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
    // Find by releaseOwner (the ID of the person who created the draft/submission)
    const releases = await Release.find({ releaseOwner: req.user._id })
      .populate("releaseOwner", "stageName")
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
      releaseOwner: req.user._id,
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
