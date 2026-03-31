import ArtistProfile from "../models/ArtistProfile.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

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

// @desc    Upload artist profile image to Cloudinary
// @route   POST /api/users/profile/image
// @access  Private
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const cld_upload_stream = cloudinary.uploader.upload_stream(
      {
        folder: "artist_profiles",
        transformation: [{ width: 500, height: 500, crop: "fill" }],
      },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary Error:", error);
          return res.status(500).json({ message: "Cloudinary upload failed" });
        }

        try {
          // We use $set to only update the image.
          // We include artistName from the user object as a fallback for the upsert
          const updatedProfile = await ArtistProfile.findOneAndUpdate(
            { user: req.user._id },
            {
              $set: { profileImage: result.secure_url },
              $setOnInsert: { artistName: req.user.stageName || "New Artist" },
            },
            { upsert: true, new: true, runValidators: false }, // runValidators: false bypasses the requirement check for this specific update
          );

          res.status(200).json({ imageUrl: result.secure_url });
        } catch (dbError) {
          console.error("Database Error:", dbError);
          res
            .status(500)
            .json({ message: "Failed to update profile in database" });
        }
      },
    );

    streamifier.createReadStream(req.file.buffer).pipe(cld_upload_stream);
  } catch (error) {
    console.error("Server Crash:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Upload release artwork to Cloudinary
// @route   POST /api/users/release-artwork
// @access  Private
export const uploadReleaseArtwork = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "release_artworks", // 👈 Separated folder
        // We aren't forcing a crop here because release artwork needs to be high-fidelity.
        // We just ensure it's delivered securely.
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Error:", error);
          return res.status(500).json({ message: "Cloudinary upload failed" });
        }

        // Return the secure URL back to the frontend
        res.status(200).json({ imageUrl: result.secure_url });
      },
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (error) {
    console.error("Server Crash:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
