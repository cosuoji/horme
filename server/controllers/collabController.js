import Collaboration from "../models/Collaboration.js";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import { uploadFileToS3 } from "../utils/uploadFileToS3.js";
import { v4 as uuidv4 } from "uuid";
// 🔍 1. Search for Artists (Discover Tab)
export const searchArtists = async (req, res) => {
  try {
    const { q } = req.query;
    const artists = await User.find({
      _id: { $ne: req.user._id }, // Don't collab with yourself
      isAvailableForCollab: true, // Only "Open" artists
      stageName: { $regex: q, $options: "i" }, // Case-insensitive search
    })
      .select("stageName artistRank releaseCount") // Only send what UI needs
      .limit(10);

    res.status(200).json(artists);
  } catch (error) {
    res.status(500).json({ message: "Search failed" });
  }
};
// ✉️ 2. Propose a Feature

export const proposeCollaboration = async (req, res) => {
  try {
    const { recipientId, trackTitle, proposedSplit } = req.body;
    const file = req.file;

    if (!file)
      return res.status(400).json({ message: "Audio snippet required" });

    const existingCollab = await Collaboration.findOne({
      requesterId: req.user._id,
      recipientId,
      trackTitle: trackTitle.trim(),
    });

    if (existingCollab) {
      return res.status(409).json({
        message: `You have already sent a proposal for "${trackTitle}" to this artist.`,
      });
    }

    // 1. Weekly Limit Check
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const sentThisWeek = await Collaboration.countDocuments({
      requesterId: req.user._id,
      createdAt: { $gte: startOfWeek },
    });

    const limit =
      req.user.releaseCount >= 20 ? 10 : req.user.releaseCount >= 10 ? 3 : 1;

    if (sentThisWeek >= limit) {
      return res
        .status(403)
        .json({ message: "Weekly proposal limit reached." });
    }

    // 2. S3 Upload (Direct to S3)
    const rawFileKey = `snippets/${req.user._id}/${uuidv4()}-${file.originalname}`;
    const snippetUrl = await uploadFileToS3(
      file.buffer,
      rawFileKey,
      file.mimetype,
    );
    // 3. Database Record - Set status to 'completed' immediately since no trimming is needed
    const collab = await Collaboration.create({
      requesterId: req.user._id,
      recipientId,
      trackTitle,
      proposedSplit,
      snippetUrl,
    });

    res.status(201).json(collab);
  } catch (error) {
    // 5. UX FRIENDLY ERROR HANDLING
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "A proposal with this title has already been sent to this artist.",
      });
    }

    console.error("General Controller Error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong on our end. Please try again." });
  }
};

// 📥 3. Get User's Collaborations (Incoming & Outgoing)
export const getMyCollaborations = async (req, res) => {
  try {
    const userId = req.user._id;

    const incoming = await Collaboration.find({ recipientId: userId })
      .populate("requesterId", "stageName")
      .sort("-createdAt");

    const outgoing = await Collaboration.find({ requesterId: userId })
      .populate("recipientId", "stageName")
      .sort("-createdAt");

    res.status(200).json({ incoming, outgoing });
  } catch (error) {
    console.error("Fetch Collabs Error:", error);
    res.status(500).json({ message: "Failed to fetch collaborations" });
  }
};

// 🤝 4. Respond to a Proposal (Accept/Decline)
export const respondToCollaboration = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body; // 🚀 Added rejectionReason

    if (!["accepted", "declined"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const collab = await Collaboration.findById(id);

    if (!collab)
      return res.status(404).json({ message: "Collaboration not found" });

    // Security check
    if (collab.recipientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to respond" });
    }

    // update status
    collab.status = status;

    // 🚀 Handle Rejection Reason
    if (status === "declined") {
      collab.rejectionReason = rejectionReason || "No reason provided.";
    } else {
      // Clear it out if they somehow accept a previously declined one
      collab.rejectionReason = "";
    }

    await collab.save();

    // 🛡️ IMMUTABLE AUDIT LOG
    if (status === "accepted") {
      await AuditLog.create({
        adminId: req.user._id,
        action: "COLLAB_AGREEMENT_SIGNED",
        targetId: collab._id,
        targetModel: "Collaboration",
        changes: {
          trackTitle: collab.trackTitle,
          splitAgreed: collab.proposedSplit,
          requester: collab.requesterId,
          recipient: collab.recipientId,
        },
        ipAddress: req.ip,
      });
    }

    res.status(200).json({
      message: `Collaboration ${status}`,
      collab,
    });
  } catch (error) {
    console.error("Respond Collab Error:", error);
    res.status(500).json({ message: "Failed to update collaboration status" });
  }
};

export const getPendingCollabCount = async (req, res) => {
  try {
    const count = await Collaboration.countDocuments({
      recipientId: req.user._id,
      status: "pending",
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
