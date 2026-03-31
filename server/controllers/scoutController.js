// controllers/scoutController.js
import User from "../models/User.js";

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
