// models/Withdrawal.js
import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
  {
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, enum: ["USD", "NGN"], required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // We take a "snapshot" of their bank details at the exact moment they requested it.
    // This protects you if they change their bank info later and claim you sent it to the wrong place.
    bankDetailsSnapshot: {
      accountName: String,
      accountNumber: String,
      bankName: String,
    },
    adminNotes: { type: String }, // For the admin to leave a reason if rejected
  },
  { timestamps: true },
);

const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);
export default Withdrawal;
