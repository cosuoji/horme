import mongoose from "mongoose";

// 1. Define the Track Sub-Schema
const trackSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    fileKey: { type: String, required: true },
    isrc: { type: String, trim: true },
    explicit: { type: Boolean, default: false },
    trackNumber: { type: Number, required: true },

    // Hybrid approach: Array of objects
    featuredArtists: [
      {
        name: { type: String, required: true, trim: true },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
      },
    ],
  },
  { timestamps: true },
);

// 2. The Main Merged Release Schema
const releaseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    releaseType: {
      type: String,
      enum: ["Single", "EP", "Album", "Compilation"],
      required: true,
    },
    artwork: { type: String, required: true },

    primaryArtist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Hybrid approach: Array of objects
    featuredArtists: [
      {
        name: { type: String, required: true, trim: true },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
      },
    ],

    // Metadata for Distribution
    releaseDate: { type: Date, required: true },
    preOrderDate: { type: Date },
    timeZone: { type: String, default: "Local Time" },
    genre: { type: String, required: true },
    label: { type: String, trim: true },
    language: { type: String, default: "English" },

    // 🚀 FIXED: Renamed to match the frontend state
    cLine: { type: String, trim: true },
    pLine: { type: String, trim: true },

    upc: { type: String },

    // 3. The Tracks Array
    tracks: [trackSchema],

    // Status
    status: {
      type: String,
      enum: ["pending", "distributed", "takedown", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String },

    // Custom Split Logic
    contractSplit: {
      artistPercentage: { type: Number, default: 0.8 },
      labelPercentage: { type: Number, default: 0.2 },
    },

    recoupableExpenses: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const Release = mongoose.model("Release", releaseSchema);
export default Release;
