import express from "express";
import multer from "multer";
import { uploadRoyalties } from "../controllers/royaltyController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Setup Multer storage
const upload = multer({ dest: "uploads/" });

// Note: protect and admin middleware ensure ONLY you can upload this
router.post(
  "/upload",
  protect,
  admin,
  upload.single("royaltyCsv"),
  uploadRoyalties,
);

export default router;
