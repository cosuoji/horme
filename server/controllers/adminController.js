// controllers/adminController.js
import Withdrawal from "../models/Withdrawal.js";
import User from "../models/User.js";
import Release from "../models/Release.js";

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

// @desc    Get all users for the platform
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    // Fetch users and exclude passwords for security
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

// @desc    Manually override and verify a user
// @route   PUT /api/admin/users/:id/verify
// @access  Private/Admin
export const verifyUserManually = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Initialize if it doesn't exist
    if (!user.verification) {
      user.verification = { status: "unverified", method: "none" };
    }

    user.verification.status = "verified";
    user.verification.method = "manual_admin"; // So you know an admin forced this
    await user.save();

    res.status(200).json({ message: "User manually verified successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user verification status" });
  }
};

// ==========================================
// RELEASE QUEUE
// ==========================================

// @desc    Get all pending music releases
// @route   GET /api/admin/releases
// @access  Private/Admin
export const getPendingReleases = async (req, res) => {
  try {
    const pendingReleases = await Release.find({ status: "pending" })
      // 🚀 FIXED: Changed 'artistId' to 'primaryArtist' to match your schema
      .populate("primaryArtist", "stageName email")
      .sort({ createdAt: 1 });

    res.status(200).json(pendingReleases);
  } catch (error) {
    console.error("ERROR IN GET PENDING RELEASES:", error);
    res.status(500).json({ message: "Error fetching pending releases" });
  }
};

// @desc    Approve or Reject a release
// @route   PUT /api/admin/releases/:id
// @access  Private/Admin
export const processRelease = async (req, res) => {
  const { status } = req.body; // status = 'approved' or 'rejected'

  try {
    const release = await Release.findById(req.params.id);

    if (!release) {
      return res.status(404).json({ message: "Release not found" });
    }

    release.status = status;
    await release.save();

    res.status(200).json({ message: `Release marked as ${status}` });
  } catch (error) {
    res.status(500).json({ message: "Error processing the release" });
  }
};
