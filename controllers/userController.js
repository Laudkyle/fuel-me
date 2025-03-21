const { User } = require('../models');
const { generateAccessToken, generateRefreshToken } = require('../middlewares/auth');
const { hashPassword, comparePassword } = require('../utils/hash');
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid"); // Corrected import


// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

// Get a user by phone
const getUserByPhone = async (req, res) => {
  const { phone } = req.params;
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
};

// Register a new user
const registerUser = async (req, res) => {
  const { phone, pin } = req.body;

  try {
    const userExists = await User.findOne({ phone });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await hashPassword(pin);
    const newUser = new User({ phone, pin: hashedPassword });

    await newUser.save();

    // Generate access and refresh tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    res.status(201).json({ user: newUser, accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
};
// Register User and Create Profile
const registerUsers = async (req, res) => {
  const { user, profile } = req.body;

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ phone: user.phone });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the PIN before storing
    const hashedPin = await bcrypt.hash(user.pin, 10);

    // Create a new user
    const newUser = new User({
      user_uuid: uuidv4(),
      phone: user.phone,
      pin: hashedPin, // Store hashed PIN as password
    });

    await newUser.save();

    // Create a profile for the user
    const newProfile = new Profile({
      user_uuid: newUser.user_uuid,
      profile_uuid: uuidv4(),
      fullname: profile.name,
      staff_id: profile.staff_id || "",
      address: profile.address || "",
      email: profile.email || "",
      category: profile.category || "",
      id_image1: profile.id_image1 || "",
      id_image2: profile.id_image2 || "",
      personal_image: profile.personal_image || "",
    });

    await newProfile.save();

    // Generate JWT tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    res.status(201).json({
      message: "Registration successful",
      user: newUser,
      profile: newProfile,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to register user", error: error.message });
  }
};
// Login user
const loginUser = async (req, res) => {
  const { phone, pin } = req.body;

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await comparePassword(pin, user.pin);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate new tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({ user, accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: 'Failed to login', error: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  const { phone } = req.params;
  const updates = req.body;

  try {
    if (updates.pin) {
      updates.pin = await hashPassword(updates.pin);
    }

    const updatedUser = await User.findOneAndUpdate({ phone }, updates, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  const { phone } = req.params;

  try {
    const deletedUser = await User.findOneAndDelete({ phone });

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

module.exports = {
  getUsers,
  getUserByPhone,
  registerUsers,
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
};
