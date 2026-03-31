// models/Ledger.js
import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema(
  {
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    releaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Release",
      required: true,
    },

    // The specific payout period (e.g., "March 2026")
    reportingMonth: { type: String, required: true },

    // Data from the Distributor
    totalStreams: { type: Number, required: true },
    grossRevenueUSD: { type: Number, required: true },
    sourceDSPs: [{ type: String }], // e.g., ['Spotify', 'Apple Music']

    // Calculated by our Node.js parser
    netPayableToArtist: { type: Number, required: true },
    currency: { type: String, enum: ["USD", "NGN"], default: "USD" },

    // Has the artist clicked "Withdraw" yet?
    paymentStatus: {
      type: String,
      enum: ["unpaid", "processing", "paid"],
      default: "unpaid",
    },
  },
  { timestamps: true },
);

const Ledger = mongoose.model("Ledger", ledgerSchema);
export default Ledger;
