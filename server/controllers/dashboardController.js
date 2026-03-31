// controllers/dashboardController.js
import User from "../models/User.js";
import Ledger from "../models/Ledger.js";
import Withdrawal from "../models/Withdrawal.js";

// @desc    Get Artist Dashboard Data (Wallet & History)
export const getDashboardData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    const ledgerHistory = await Ledger.find({ artistId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    const withdrawalHistory = await Withdrawal.find({
      artistId: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      user,
      ledgerHistory,
      withdrawalHistory,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error fetching dashboard" });
  }
};

// @desc    Request a Payout
export const requestWithdrawal = async (req, res) => {
  const { amount, currency } = req.body;

  try {
    // 1. Guard against unsupported currencies
    const allowedCurrencies = ["USD", "NGN"];
    if (!allowedCurrencies.includes(currency)) {
      return res.status(400).json({ message: "Unsupported currency." });
    }

    const user = await User.findById(req.user._id);

    // 2. Verify they have bank details set up
    if (!user.bankDetails || !user.bankDetails.accountNumber) {
      return res.status(400).json({
        message: "Please update your bank details before withdrawing.",
      });
    }

    const balanceField =
      currency === "USD" ? "walletBalanceUSD" : "walletBalanceNGN";

    // 3. Atomically check balance and deduct to prevent race conditions
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        [balanceField]: { $gte: amount }, // Only update if balance is sufficient
      },
      { $inc: { [balanceField]: -amount } }, // Atomic decrement
      { new: true },
    );

    // If updatedUser is null, it means balance was insufficient
    if (!updatedUser) {
      return res
        .status(400)
        .json({ message: `Insufficient ${currency} balance.` });
    }

    // 4. Create the pending Withdrawal record
    const withdrawal = await Withdrawal.create({
      artistId: user._id,
      amount,
      currency,
      status: "pending",
      bankDetailsSnapshot: user.bankDetails,
    });

    res
      .status(201)
      .json({ message: "Withdrawal requested successfully", withdrawal });
  } catch (error) {
    // Edge case: If the DB goes down right here, money is deducted but no record was made.
    res.status(500).json({ message: "Error processing withdrawal request" });
  }
};
