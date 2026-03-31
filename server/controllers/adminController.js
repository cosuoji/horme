// controllers/adminController.js
import Withdrawal from "../models/Withdrawal.js";
import User from "../models/User.js";

// @desc    Get all pending withdrawals
// @route   GET /api/admin/withdrawals
// @access  Private/Admin
export const getPendingWithdrawals = async (req, res) => {
  try {
    // Populate pulls in the Artist's name and email so you know who you are paying
    const pendingRequests = await Withdrawal.find({ status: "pending" })
      .populate("artistId", "legalName stageName email")
      .sort({ createdAt: 1 }); // Oldest first

    res.status(200).json(pendingRequests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending withdrawals" });
  }
};

// @desc    Approve or Reject a withdrawal
// @route   PUT /api/admin/withdrawals/:id
// @access  Private/Admin
export const processWithdrawal = async (req, res) => {
  const { action, notes } = req.body; // action = 'approve' or 'reject'
  const withdrawalId = req.params.id;

  try {
    const withdrawal = await Withdrawal.findById(withdrawalId);

    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    if (withdrawal.status !== "pending") {
      return res
        .status(400)
        .json({ message: "This request has already been processed." });
    }

    if (action === "approve") {
      // You have already manually sent the money via Paystack/Bank Transfer
      withdrawal.status = "approved";
      withdrawal.adminNotes = notes || "Processed successfully.";
      await withdrawal.save();

      return res
        .status(200)
        .json({ message: "Withdrawal marked as approved." });
    }

    if (action === "reject") {
      // If rejected (e.g., fraud detected, or invalid bank details), we must refund the user's wallet
      const user = await User.findById(withdrawal.artistId);

      if (withdrawal.currency === "USD")
        user.walletBalanceUSD += withdrawal.amount;
      if (withdrawal.currency === "NGN")
        user.walletBalanceNGN += withdrawal.amount;
      await user.save();

      withdrawal.status = "rejected";
      withdrawal.adminNotes =
        notes || "Rejected by Admin. Funds refunded to wallet.";
      await withdrawal.save();

      return res
        .status(200)
        .json({ message: "Withdrawal rejected and funds refunded." });
    }
  } catch (error) {
    res.status(500).json({ message: "Error processing the withdrawal" });
  }
};
