const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

// Generate Secret Keys if not in .env
const generateSecretKey = () => crypto.randomBytes(32).toString('hex');

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

// 🚀 Store Refresh Tokens (Temporary, use a DB in production)
let refreshTokensDB = new Set();

/**
 * ✅ Generate an Access Token (Short-lived)
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, phone: user.phone },
    accessTokenSecret,
    { expiresIn: '15m' } // Short expiry for security
  );
};

/**
 * ✅ Generate a Refresh Token (Long-lived)
 */
const generateRefreshToken = (user) => {
  const refreshToken = jwt.sign(
    { id: user._id, phone: user.phone },
    refreshTokenSecret,
    { expiresIn: '7d' } // Longer expiry for refresh
  );
  refreshTokensDB.add(refreshToken);
  return refreshToken;
};

/**
 * ✅ Middleware: Verify Access Token
 */
const authenticateUser = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. Missing or invalid token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, accessTokenSecret);
    req.user = decoded; // Attach user info
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired access token' });
  }
};

/**
 * ✅ Refresh Token Endpoint
 */
const refreshAccessToken = (req, res) => {
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
  if (!token) return res.status(400).json({ message: 'Refresh token required' });

  if (refreshTokensDB.has(token)) {
    refreshTokensDB.delete(token);
    return res.json({ message: 'Logged out successfully' });
  } else {
    return res.status(400).json({ message: 'Invalid refresh token' });
  }
};

module.exports = {
  authenticateUser,
  generateAccessToken,
  generateRefreshToken,
  refreshAccessToken,
  logout,
};
