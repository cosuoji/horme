import express from "express";
import {
  getActiveTicketCount,
  getMyTickets,
  getAllTickets,
  createTicket,
  uploadAttachment,
  replyToTicket,
  resolveTicket,
  getTicketById,
} from "../controllers/ticketController.js";
import multer from "multer";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Protected route so only the logged-in user can submit their BVN
router.get("/my-tickets", protect, getMyTickets);
router.get("/active-count", protect, getActiveTicketCount);
router.get("/admin", protect, admin, getAllTickets);
router.post("/", protect, createTicket);
router.get("/:id", protect, getTicketById);
router.post("/:id/reply", protect, replyToTicket);

// --- ADMIN ROUTES ---
// Only admins should be able to resolve
router.patch("/:id/resolve", protect, admin, resolveTicket);

// The S3 Upload Route
router.post(
  "/upload-attachment",
  protect,
  upload.single("file"),
  uploadAttachment,
);
export default router;
