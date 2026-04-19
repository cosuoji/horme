import mongoose from "mongoose";
const { Schema } = mongoose;

const isNotDraft = function () {
  // If it's a sub-document (a track), we check the parent's status
  const parent = this.ownerDocument ? this.ownerDocument() : this;
  return parent.status !== "draft";
};

// 1. Helper Schema for Standard Artists (Stage Names)
const trackArtistSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    user: { type: Schema.Types.ObjectId, ref: "User", default: null }, // Optional platform link
  },
  { _id: false },
);

// 2. Helper Schema for Writers (Legal Names + Specific Roles)
const writerSchema = new Schema(
  {
    legalName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["Composer", "Lyricist", "Producer"], // DSPs usually require Composer/Lyricist
      required: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { _id: false },
);

// 3. Helper Schema for Additional Credits (Open-ended Roles)
const creditSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true }, // e.g., "Guitarist", "Mix Engineer"
    user: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { _id: false },
);

const trackSchema = new mongoose.Schema(
  {
    title: { type: String, required: isNotDraft, trim: true },
    fileUrl: { type: String, required: isNotDraft },
    fileKey: { type: String, required: isNotDraft },
    isrc: { type: String, trim: true },
    explicit: { type: Boolean, default: false },
    trackNumber: { type: Number, required: isNotDraft },

    primaryArtists: [trackArtistSchema],
    featuredArtists: [trackArtistSchema],
    writers: [writerSchema],
    additionalCredits: [creditSchema],

    // 💰 Splits Section
    splits: [
      {
        name: { type: String, required: isNotDraft, trim: true },
        // Added email for future payout/invite functionality
        email: { type: String, lowercase: true, trim: true },
        role: {
          type: String,
          enum: ["Primary", "Featured", "Producer", "Writer", "Label"],
          required: isNotDraft,
        },
        percentage: {
          type: Number,
          required: isNotDraft,
          min: 0,
          max: 100,
        },
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
    artwork: {
      type: String,
      required: [
        function () {
          return isNotDraft.call(this);
        },
        "Please upload your cover artwork before submitting.",
      ],
    },
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
