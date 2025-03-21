const { User, Profile } = require('../models');

// Get all profiles
const getProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find();
    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profiles', error: error.message });
  }
};

// Get a profile by phone
const getProfileByPhone = async (req, res) => {
  const { phone } = req.params;

  try {
    // Find the user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the profile by user_uuid
    const profile = await Profile.findOne({ user_uuid: user.user_uuid });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

// Create a new profile
const createProfile = async (req, res) => {
  const { phone, profile_uuid, fullname, staff_id, address, email, category, id_image1, id_image2, personal_image } = req.body;

  try {
    // Find the user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if a profile already exists for the user
    const existingProfile = await Profile.findOne({ user_uuid: user.user_uuid });
    if (existingProfile) {
      return res.status(400).json({ message: 'Profile already exists for this user' });
    }

    // Create a new profile
    const newProfile = new Profile({
      user_uuid: user.user_uuid,
      profile_uuid,
      name,
      staff_id,
      address,
      email,
      category,
      id_image1,
      id_image2,
      personal_image,
    });

    await newProfile.save();
    res.status(201).json(newProfile);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create profile', error: error.message });
  }
};

// Update a profile
const updateProfile = async (req, res) => {
  const { phone } = req.params;
  const updates = req.body;

  try {
    // Find the user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the profile by user_uuid
    const updatedProfile = await Profile.findOneAndUpdate({ user_uuid: user.user_uuid }, updates, { new: true });

    if (!updatedProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(updatedProfile);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

// Delete a profile
const deleteProfile = async (req, res) => {
  const { phone } = req.params;

  try {
    // Find the user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete the profile by user_uuid
    const deletedProfile = await Profile.findOneAndDelete({ user_uuid: user.user_uuid });

    if (!deletedProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete profile', error: error.message });
  }
};

module.exports = {
  getProfiles,
  getProfileByPhone,
  createProfile,
  updateProfile,
  deleteProfile,
};
