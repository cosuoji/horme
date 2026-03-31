import fs from "fs";
import csv from "csv-parser";
import User from "../models/User.js";
import Ledger from "../models/Ledger.js";

// @desc    Upload CSV, parse royalties, and allocate funds
// @route   POST /api/royalties/upload
// @access  Private/Admin
export const uploadRoyalties = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please upload a CSV file" });
  }

  const results = [];
  const monthOfReport =
    req.body.reportingMonth || new Date().toISOString().slice(0, 7); // e.g., "2026-03"

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        let processedCount = 0;

        // Loop through every row in the Too Lost CSV
        for (const row of results) {
          // Assuming Too Lost CSV headers are 'ISRC', 'Quantity' (streams), and 'Earnings' (USD)
          const isrc = row["ISRC"];
          const streams = parseInt(row["Quantity"], 10) || 0;
          const grossEarnings = parseFloat(row["Earnings"]) || 0;

          // Find the artist who owns this ISRC
          const artist = await User.findOne({ isrcCodes: isrc });

          if (artist && grossEarnings > 0) {
            // Calculate the 80/20 split
            const artistCut = grossEarnings * 0.8;

            // 1. Create the Ledger receipt for transparency
            await Ledger.create({
              artistId: artist._id,
              reportingMonth: monthOfReport,
              totalStreams: streams,
              grossRevenueUSD: grossEarnings,
              netPayableToArtist: artistCut,
              currency: "USD",
              paymentStatus: "unpaid",
            });

            // 2. Fund the Artist's Wallet
            artist.walletBalanceUSD += artistCut;
            await artist.save();

            processedCount++;
          }
        }

        // Delete the CSV file from the server after processing to save space
        fs.unlinkSync(req.file.path);

        res.status(200).json({
          message: "Royalty allocation complete",
          rowsProcessed: processedCount,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error processing royalty data" });
      }
    });
};
