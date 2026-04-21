import express from "express";
import multer from "multer";
import {
  verifyBvn,
  updateUserProfile,
  getUserProfile,
  requestSupport,
  collabToggle,
} from "../controllers/userController.js";
import {
  getProfile,
  updateProfile,
  uploadProfileImage,
  uploadReleaseArtwork,
} from "../controllers/profileController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure Multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// Protected route so only the logged-in user can submit their BVN
router.post("/verify-bvn", protect, verifyBvn);

// Protected route so only the logged-in user can update their profile
router.put("/profile", protect, updateUserProfile);

// Protected route so only the logged-in user can get their profile
router.get("/profile", protect, getUserProfile);

// Protected route so only the logged-in user can toggle their collaboration status
router.patch("/profile/collab-toggle", protect, collabToggle);

// Protected route so only the logged-in user can get/update their profile
router
  .route("/artist-profile")
  .get(protect, getProfile)
  .post(protect, updateProfile);

// NEW: Upload profile image route
router.post(
  "/image",
  protect,
  upload.single("profileImage"),
  uploadProfileImage,
);

router.post(
  "/release-artwork",
  protect,
  upload.single("artwork"),
  uploadReleaseArtwork,
);

// NEW: Request support route
router.post("/support", protect, requestSupport);

export default router;
