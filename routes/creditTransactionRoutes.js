const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middlewares/auth');

const CreditTransactionController = require('../controllers/creditTransactionController');

// Process fuel purchase (replaces loan creation)
router.post('/fuel-purchase', authenticateUser, CreditTransactionController.createFuelPurchase);

// Process repayment
router.post('/repayment', authenticateUser, CreditTransactionController.processRepayment);

// Calculate interest for billing cycle
router.post('/calculate-interest/:billing_cycle_uuid', authenticateUser, CreditTransactionController.calculateInterest);

// Get user's credit transactions
router.get('/user/:user_uuid', authenticateUser, CreditTransactionController.getUserTransactions);

// Get current billing cycle for user
router.get('/billing-cycle/current/:user_uuid', authenticateUser, CreditTransactionController.getCurrentBillingCycle);

module.exports = router;