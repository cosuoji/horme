import express from "express";
import {
  getScoutedArtists,
  assignScoutToArtist,
} from "../controllers/scoutController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected route so only the logged-in user can submit their BVN

router.get("/my-artists", protect, getScoutedArtists);
router.put("/assign-scout", protect, admin, assignScoutToArtist);

export default router;
