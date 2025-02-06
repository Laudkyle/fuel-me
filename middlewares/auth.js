const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

// Function to generate a random secret key
const generateSecretKey = () => crypto.randomBytes(32).toString('hex'); // 256-bit key

// Load or generate secret keys
let accessTokenSecret = process.env.JWT_ACCESS_SECRET;
let refreshTokenSecret = process.env.JWT_REFRESH_SECRET;

if (!accessTokenSecret || !refreshTokenSecret) {
  accessTokenSecret = generateSecretKey();
  refreshTokenSecret = generateSecretKey();
  fs.appendFileSync(
    '.env',
    `\nJWT_ACCESS_SECRET=${accessTokenSecret}\nJWT_REFRESH_SECRET=${refreshTokenSecret}\n`
  );
  console.log('Generated new JWT secrets and saved to .env');
}

// Fake database for storing refresh tokens (Use a real DB in production)
const refreshTokensDB = new Set(); // Store refresh tokens

/**
 * ✅ Generate an Access Token (Short-lived)
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, phone: user.phone },
    accessTokenSecret,
    { expiresIn: '15m' } // 15 minutes
  );
};

/**
 * ✅ Generate a Refresh Token (Long-lived)
 */
const generateRefreshToken = (user) => {
  const refreshToken = jwt.sign(
    { id: user._id, phone: user.phone },
    refreshTokenSecret,
    { expiresIn: '7d' } // 7 days
  );
  refreshTokensDB.add(refreshToken); // Store token
  return refreshToken;
};

/**
 * ✅ Middleware to verify the Access Token
 */
const authenticateUser = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. Missing or invalid token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, accessTokenSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired access token' });
  }
};

/**
 * ✅ Refresh Token Endpoint
 * Exchange refresh token for a new access token
 */
const refreshToken = (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ message: 'Refresh token required' });

  if (!refreshTokensDB.has(token)) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }

  try {
    const decoded = jwt.verify(token, refreshTokenSecret);
    const newAccessToken = generateAccessToken({ _id: decoded.id, phone: decoded.phone });
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

/**
 * ✅ Logout (Revoke Refresh Token)
 */
const logout = (req, res) => {
  const { token } = req.body;
  refreshTokensDB.delete(token);
  res.json({ message: 'Logged out successfully' });
};

module.exports = {
  authenticateUser,
  generateAccessToken,
  generateRefreshToken,
  refreshToken,
  logout,
};
