import express from "express";
import {
  searchArtists,
  proposeCollaboration,
  getMyCollaborations,
  respondToCollaboration,
  getPendingCollabCount,
} from "../controllers/collabController.js";
import { protect } from "../middleware/authMiddleware.js"; // Adjust path as needed
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// All collaboration routes require the user to be logged in
router.use(protect);

router.get("/search", searchArtists);
router.post("/", upload.single("audio"), proposeCollaboration);
router.get("/", getMyCollaborations);
router.patch("/:id/respond", respondToCollaboration);
router.get("/pending-count", getPendingCollabCount);

export default router;
