import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";

export const protect = async (req, res, next) => {
  let token;
  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select("-password");
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as admin" });
  }
};

// Example: After rejecting a release
export const logAdminAction = async (req, action, targetId, changes = {}) => {
  try {
    await AuditLog.create({
      adminId: req.user._id, // Assumes user is attached via auth middleware
      action,
      targetId,
      changes,
      ipAddress: req.ip || req.headers["x-forwarded-for"],
      userAgent: req.get("User-Agent"),
    });
  } catch (error) {
    console.error("CRITICAL: Failed to write audit log:", error);
    // You don't want to crash the app, but you should alert yourself here
  }
};
