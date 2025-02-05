const express = require('express');
const router = express.Router();
const MomoController = require('../controllers/momoController');

// Create a new momo account
router.post('/', MomoController.createMomo);

// Get all momo accounts
router.get('/', authenticateUser, MomoController.getAllMomo);

// Get a specific momo account by UUID
router.get('/:momo_uuid', authenticateUser, MomoController.getMomoByUUID);

// Update a momo account
router.put('/:momo_uuid', authenticateUser, MomoController.updateMomo);

// Delete a momo account
router.delete('/:momo_uuid', authenticateUser, MomoController.deleteMomo);

module.exports = router;
