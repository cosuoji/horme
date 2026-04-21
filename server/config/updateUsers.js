import mongoose from "mongoose";
import User from "../models/User.js"; // Adjust path to your model
import dotenv from "dotenv";
dotenv.config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    const result = await User.updateMany(
      { releaseCount: { $exists: false } },
      {
        $set: {
          releaseCount: 0,
          isAvailableForCollab: false,
          artistRank: "Newcomer",
        },
      },
    );

    console.log(`Migration complete. Updated ${result.modifiedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrate();
