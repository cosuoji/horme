import express from "express";
import {
  getDashboardData,
  requestWithdrawal,
} from "../controllers/dashboardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getDashboardData);
router.post("/withdraw", protect, requestWithdrawal);

export default router;
