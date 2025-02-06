const express = require('express');
const { authenticateUser } = require('../middlewares/auth');

const {
  getProfiles,
  getProfileByPhone,
  createProfile,
  updateProfile,
  deleteProfile,
} = require('../controllers/profileController');

const router = express.Router();

// GET all profiles
router.get('/', authenticateUser, getProfiles);

// GET profile by phone
router.get('/:phone', authenticateUser, getProfileByPhone);

// POST create a new profile
router.post('/', authenticateUser, createProfile);

// PUT update a profile
router.put('/:phone', authenticateUser, updateProfile);

// DELETE a profile
router.delete('/:phone', authenticateUser, deleteProfile);

module.exports = router;
