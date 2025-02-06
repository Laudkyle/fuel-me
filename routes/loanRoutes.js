const express = require('express');
const { authenticateUser } = require('../middlewares/auth');

const router = express.Router();
const LoanController = require('../controllers/loanController');

// Create a new loan
router.post('/', LoanController.createLoan);

// Get all loans
router.get('/', LoanController.getAllLoans);

// Get a specific loan by UUID
router.get('/:loan_uuid', authenticateUser, LoanController.getLoanByUUID);

// Update a loan
router.put('/:loan_uuid', authenticateUser, LoanController.updateLoan);

// Delete a loan
router.delete('/:loan_uuid', authenticateUser, LoanController.deleteLoan);

module.exports = router;
