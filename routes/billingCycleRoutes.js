const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middlewares/auth');

const BillingCycleController = require('../controllers/billingCycleController');

// Get or create current billing cycle
router.post('/get-or-create', authenticateUser, BillingCycleController.getOrCreateBillingCycle);

// Close billing cycle
router.post('/close/:cycle_uuid', authenticateUser, BillingCycleController.closeBillingCycle);

// Get billing cycle history for user
router.get('/history/:user_uuid', authenticateUser, BillingCycleController.getBillingCycleHistory);

// Apply late payment penalty
router.post('/apply-penalty/:cycle_uuid', authenticateUser, BillingCycleController.applyLatePaymentPenalty);

module.exports = router;