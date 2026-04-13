import mongoose from "mongoose";

// Helper function to check if a field should be mandatory
const isNotDraft = function () {
  return this.status !== "draft";
};

// 1. Define the Track Sub-Schema
const trackSchema = new mongoose.Schema(
  {
    // In a draft, we might not even have a title yet
    title: {
      type: String,
      required: isNotDraft,
      trim: true,
    },
    // Files are definitely missing in early drafts
    fileUrl: { type: String, required: isNotDraft },
    fileKey: { type: String, required: isNotDraft },
    isrc: { type: String, trim: true },
    explicit: { type: Boolean, default: false },
    trackNumber: { type: Number, required: isNotDraft },

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
    title: { type: String, required: true, trim: true }, // We keep Title required to identify the draft
    releaseType: {
      type: String,
      enum: ["Single", "EP", "Album", "Compilation"],
      required: isNotDraft, // Can be selected later
    },
    artwork: { type: String, required: isNotDraft },

    primaryArtist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Always need to know who owns the draft
    },

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

    releaseDate: { type: Date, required: isNotDraft },
    preOrderDate: { type: Date },
    timeZone: { type: String, default: "Local Time" },
    genre: { type: String, required: isNotDraft },
    label: { type: String, trim: true },
    language: { type: String, default: "English" },

    cLine: { type: String, trim: true },
    pLine: { type: String, trim: true },
    upc: { type: String },

    // 3. The Tracks Array
    tracks: [trackSchema],

    // Status 🚀 ADDED 'draft' AND CHANGED DEFAULT
    status: {
      type: String,
      enum: ["draft", "pending", "distributed", "takedown", "rejected"],
      default: "draft",
    },
    rejectionReason: { type: String },

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
