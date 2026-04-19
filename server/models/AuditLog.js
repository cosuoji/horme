import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: { type: String, required: true }, // e.g., "REJECT_RELEASE", "UPDATE_COMMISSION"
  targetId: { type: mongoose.Schema.Types.ObjectId }, // ID of the release/user being modified
  changes: {
    old: mongoose.Schema.Types.Mixed,
    new: mongoose.Schema.Types.Mixed,
  },
  ipAddress: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now, immutable: true }, // Cannot be changed
});

// Prevent updates to logs at the DB level
auditLogSchema.pre("save", function (next) {
  if (!this.isNew) return next(new Error("Audit logs are immutable."));
  next();
});

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
