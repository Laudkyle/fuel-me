const express = require('express');
const { authenticateUser } = require('../middlewares/auth');

const router = express.Router();
const TransactionController = require('../controllers/transactionController');

// Create a new transaction
router.post('/', authenticateUser, TransactionController.createTransaction);

// Get all transactions
router.get('/', authenticateUser, TransactionController.getAllTransactions);

// Get a specific transaction by UUID
router.get('/:transaction_uuid', authenticateUser, TransactionController.getTransactionByUUID);

// Update a transaction
router.put('/:transaction_uuid', authenticateUser, TransactionController.updateTransaction);

// Delete a transaction
router.delete('/:transaction_uuid', authenticateUser, TransactionController.deleteTransaction);

module.exports = router;
