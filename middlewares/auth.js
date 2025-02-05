const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

// Function to generate a random secret key
const generateSecretKey = () => {
  return crypto.randomBytes(32).toString('hex'); // 256-bit key
};

// Load secret key from .env or generate a new one
let secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  secretKey = generateSecretKey();
  fs.appendFileSync('.env', `\nJWT_SECRET=${secretKey}\n`); // Save to .env
  console.log('Generated new JWT secret key and saved to .env');
}

// Middleware to verify JWT with Bearer token
const authenticateUser = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. Invalid or missing token.' });
  }

  const token = authHeader.split(' ')[1]; // Extract the token part

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // Attach user data to request object
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Function to generate a JWT token with Bearer type
const generateToken = (user) => {
  return jwt.sign({ id: user._id, phone: user.phone }, secretKey, { expiresIn: '1h' });
};

module.exports = { authenticateUser, generateToken };
