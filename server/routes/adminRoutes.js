import express from "express";
import {
  getPendingWithdrawals,
  processWithdrawal,
  getAllUsers,
  verifyUserManually,
  getPendingReleases,
  processRelease,
} from "../controllers/adminController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Existing Withdrawal Routes
router.get("/withdrawals", protect, admin, getPendingWithdrawals);
router.put("/withdrawals/:id", protect, admin, processWithdrawal);

// 🚀 New User Management Routes
router.get("/users", protect, admin, getAllUsers);
router.put("/users/:id/verify", protect, admin, verifyUserManually);

// 🚀 New Release Queue Routes
router.get("/releases", protect, admin, getPendingReleases);
router.put("/releases/:id", protect, admin, processRelease);

export default router;
