import jwt from "jsonwebtoken";

// generateToken.js
const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  const isProduction = process.env.NODE_ENV === "production";

  // Example of how your login cookie SHOULD look:
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "lax" : "strict",
    domain: isProduction ? ".usemotionworks.com" : undefined,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

export default generateToken;
