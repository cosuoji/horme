import express from "express";
import {
  getPendingWithdrawals,
  processWithdrawal,
} from "../controllers/adminController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/withdrawals", protect, admin, getPendingWithdrawals);
router.put("/withdrawals/:id", protect, admin, processWithdrawal);

export default router;
