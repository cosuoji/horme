import jwt from "jsonwebtoken";

// generateToken.js
const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax", // 🚀 Changed from 'none' to 'lax' because domains now match!
    domain: ".hormemusic.com", // 🚀 The dot allows it to work on all subdomains
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

export default generateToken;
