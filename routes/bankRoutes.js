const express = require('express');
const router = express.Router();
const BankController = require('../controllers/bankController');
const { authenticateUser } = require('../middlewares/auth');

// Create a new bank
router.post('/', authenticateUser,BankController.createBank);

// Get all banks
router.get('/', authenticateUser, BankController.getAllBanks);

// Get a specific bank by UUID
router.get('/:bank_uuid', authenticateUser, BankController.getBankByUUID);

// Update a bank
router.put('/:bank_uuid', authenticateUser, BankController.updateBank);

// Delete a bank
router.delete('/:bank_uuid', authenticateUser, BankController.deleteBank);

module.exports = router;
