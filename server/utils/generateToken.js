import jwt from "jsonwebtoken";

// generateToken.js
const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    // 🚀 CRITICAL FOR RENDER/NETLIFY DEPLOYMENT:
    secure: true, // Must be true for HTTPS (Render provides this)
    sameSite: "none", // Must be 'none' to work across different domains
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

export default generateToken;
