import mongoose from "mongoose";

const artistProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    // General
    profileImage: { type: String, default: "" }, // Will hold Cloudinary URL
    artistName: { type: String },
    description: { type: String },
    country: { type: String },
    phoneNumber: { type: String },

    // Uploader Defaults
    artistRoles: [{ type: String }],
    writerRoles: [{ type: String }],
    additionalCredits: { type: String },

    // Core Info
    primaryGenre: { type: String },
    secondaryGenre: { type: String },
    language: { type: String, default: "English" },
    cLine: { type: String }, // Copyright line
    pLine: { type: String }, // Phonographic copyright line

    // Additional Deliveries (Toggles)
    deliveries: {
      beatport: { type: Boolean, default: false },
      youtubeContentId: { type: Boolean, default: false },
      metaRightsManager: { type: Boolean, default: false },
      soundCloudMonetization: { type: Boolean, default: false },
      soundExchange: { type: Boolean, default: false },
      juno: { type: Boolean, default: false },
      tracklib: { type: Boolean, default: false },
      hook: { type: Boolean, default: false },
      lyricFind: { type: Boolean, default: false },
    },

    // Links & Info
    dspLinks: {
      spotify: { type: String },
      appleMusic: { type: String },
    },
    additionalInfo: {
      youtubeChannel: { type: String },
      soundCloud: { type: String },
      website: { type: String },
      instagram: { type: String },
      twitter: { type: String },
      tiktok: { type: String },
      isni: { type: String }, // International Standard Name Identifier
    },
  },
  { timestamps: true },
);

const ArtistProfile = mongoose.model("ArtistProfile", artistProfileSchema);
export default ArtistProfile;
