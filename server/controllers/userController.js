// controllers/userController.js
import User from "../models/User.js";
import axios from "axios"; // You'll use this to call Paystack/Flutterwave

// @desc    Verify user BVN without saving it
// @route   POST /api/users/verify-bvn
// @access  Private
export const verifyBvn = async (req, res) => {
  const { bvn } = req.body;

  if (!bvn || bvn.length !== 11) {
    return res
      .status(400)
      .json({ message: "A valid 11-digit BVN is required." });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 1. Set status to pending while we process
    user.bvnStatus = "pending";
    await user.save();

    // 2. Call Prembly API
    const premblyResponse = await axios.post(
      "https://api.prembly.com/verification/bvn",
      { number: bvn }, // Prembly usually expects "number" for the BVN payload
      {
        headers: {
          "x-api-key": process.env.PREMBLY_SECRET_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    const apiData = premblyResponse.data;

    // 3. Evaluate Prembly's response
    // Prembly usually returns a status of true/false or specific success codes
    if (apiData.status === true || apiData.response_code === "00") {
      const bvnFirstName = apiData.data.firstName?.toLowerCase() || "";
      const bvnLastName = apiData.data.lastName?.toLowerCase() || "";
      const userLegalName = user.legalName.toLowerCase();

      // Basic fuzzy matching to ensure the names overlap
      const namesMatch =
        userLegalName.includes(bvnFirstName) ||
        userLegalName.includes(bvnLastName);

      if (namesMatch) {
        user.bvnStatus = "verified";
      } else {
        user.bvnStatus = "rejected";
        return res.status(400).json({
          message:
            "Verification failed. The name on this BVN does not match your registered legal name.",
          bvnStatus: "rejected",
        });
      }
    } else {
      user.bvnStatus = "rejected";
    }

    await user.save();

    res.status(200).json({
      message: `BVN verification ${user.bvnStatus === "verified" ? "successful" : "failed"}`,
      bvnStatus: user.bvnStatus,
    });
  } catch (error) {
    console.error(
      "Prembly BVN API error:",
      error.response?.data || error.message,
    );

    // Fall back to unsubmitted so they can try again if the API failed or timed out
    const user = await User.findById(req.user._id);
    if (user) {
      user.bvnStatus = "unsubmitted";
      await user.save();
    }

    res.status(500).json({
      message: "BVN verification service error. Please try again later.",
    });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// @desc    Update user profile (Bank Details & Stage Name)
// @route   PUT /api/users/profile
// @access  Private
// @desc    Update user profile (Bank Details & Stage Name)
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // 1. Update basic text fields
    user.stageName = req.body.stageName || user.stageName;

    // 2. Handle Bank Details Update
    if (req.body.bankDetails) {
      user.bankDetails = {
        accountName:
          req.body.bankDetails.accountName || user.bankDetails.accountName,
        accountNumber:
          req.body.bankDetails.accountNumber || user.bankDetails.accountNumber,
        bankName: req.body.bankDetails.bankName || user.bankDetails.bankName,
        bankCode: req.body.bankDetails.bankCode || user.bankDetails.bankCode,
      };
    }

    const updatedUser = await user.save();

    // 3. Return the updated info, swapping out ninStatus for bvnStatus
    res.json({
      _id: updatedUser._id,
      stageName: updatedUser.stageName,
      bvnStatus: updatedUser.bvnStatus,
      bankDetails: updatedUser.bankDetails,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// @desc    Get all artists signed by a specific scout
// @route   GET /api/scouts/my-artists
// @access  Private (Scout/Admin)
export const getScoutedArtists = async (req, res) => {
  try {
    const artists = await User.find({ scoutedBy: req.user._id }).select(
      "stageName legalName email ninStatus createdAt",
    );
    res.json(artists);
  } catch (error) {
    res.status(500).json({ message: "Error fetching scouted artists" });
  }
};

// @desc    Admin assigns a scout to an artist
// @route   PUT /api/admin/assign-scout
// @access  Private/Admin
export const assignScoutToArtist = async (req, res) => {
  const { artistId, scoutId } = req.body;
  try {
    const artist = await User.findById(artistId);
    if (!artist) return res.status(404).json({ message: "Artist not found" });

    artist.scoutedBy = scoutId;
    await artist.save();
    res.json({ message: "Scout assigned successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error assigning scout" });
  }
};
