import mongoose from "mongoose";

const collaborationSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trackTitle: {
      type: String,
      required: true,
    },
    snippetUrl: {
      type: String,
      // If you haven't set up the S3 trimming yet, this can just be a text link/placeholder for now
      required: false,
    },
    proposedSplit: {
      type: Number,
      required: true,
      min: 1,
      max: 99,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "expired"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: "", // Only populated if status is 'declined'
    },
    expiresAt: {
      type: Date,
      default: () => Date.now() + 7 * 24 * 60 * 60 * 1000, // Auto-expires in 7 days
    },
  },
  { timestamps: true },
);

// Prevent a user from spamming the same artist for the same track
collaborationSchema.index(
  { requesterId: 1, recipientId: 1, trackTitle: 1 },
  { unique: true },
);

const Collaboration = mongoose.model("Collaboration", collaborationSchema);
export default Collaboration;
