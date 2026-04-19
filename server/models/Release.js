import mongoose from "mongoose";

const isNotDraft = function () {
  // If it's a sub-document (a track), we check the parent's status
  const parent = this.ownerDocument ? this.ownerDocument() : this;
  return parent.status !== "draft";
};
// 1. Define the Track Sub-Schema
const trackSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: isNotDraft,
      trim: true,
    },
    fileUrl: { type: String, required: isNotDraft },
    fileKey: { type: String, required: isNotDraft },
    isrc: { type: String, trim: true },
    explicit: { type: Boolean, default: false },
    trackNumber: { type: Number, required: isNotDraft },

    // 🚀 NEW: Track-level Primary Artists
    primaryArtists: [
      {
        name: { type: String, required: true, trim: true },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
      },
    ],

    // Existing Featured Artists
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
    splits: [
      {
        name: { type: String, required: isNotDraft, trim: true },
        role: {
          type: String,
          enum: ["Primary", "Featured", "Producer", "Writer"],
          required: isNotDraft, // 👈 Change from true to isNotDraft
        },
        percentage: { type: Number, required: isNotDraft, min: 0, max: 100 }, // 👈 Change from true to isNotDraft
      },
    ],
  },
  { timestamps: true },
);
// 2. The Main Merged Release Schema
const releaseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A release title is required before submitting."],
      trim: true,
    },
    releaseType: {
      type: String,
      enum: ["Single", "EP", "Album", "Compilation"],
      required: isNotDraft, // Can be selected later
    },
    artwork: { type: String, required: isNotDraft },
    releaseOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    primaryArtists: [
      {
        name: { type: String, required: true, trim: true },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
      },
    ],

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
    rejectionReason: { type: String, default: "" },

    recoupableExpenses: { type: Number, default: 0 },
    legalConsent: {
      agreed: { type: Boolean, default: false },
      signedName: String,
      ipAddress: String, // Good for legal proof
      agreedAt: Date,
      version: { type: String, default: "1.0.0" }, // In case you change terms later
    },
  },
  { timestamps: true },
);

const Release = mongoose.model("Release", releaseSchema);
export default Release;
