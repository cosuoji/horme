// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    legalName: { type: String, required: true },
    stageName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["artist", "admin", "scout"],
      default: "artist",
    },
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordTokenExpires: Date,
    bvnStatus: {
      type: String,
      enum: ["pending", "verified", "rejected", "unsubmitted"],
      default: "unsubmitted",
    },
    walletBalanceNGN: { type: Number, default: 0 },
    walletBalanceUSD: { type: Number, default: 0 },
    bankDetails: {
      accountName: String,
      accountNumber: String,
      bankName: String,
      bankCode: String,
    },
    scoutedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isrcCodes: [{ type: String }],
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
