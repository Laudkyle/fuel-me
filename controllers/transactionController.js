const {Transaction} = require('../models');

// Create a new transaction
exports.createTransaction = async (req, res) => {
  try {
    const { user_uuid, loan_uuid, transaction_uuid, amount, type } = req.body;

    const newTransaction = new Transaction({
      user_uuid,
      loan_uuid,
      transaction_uuid,
      amount,
      type,
    });

    await newTransaction.save();
    res.status(201).json({ message: 'Transaction created successfully', transaction: newTransaction });
  } catch (error) {
    res.status(500).json({ message: 'Error creating transaction', error: error.message });
  }
};

// Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving transactions', error: error.message });
  }
};

// Get a transaction by UUID
exports.getTransactionByUUID = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ transaction_uuid: req.params.transaction_uuid });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving transaction', error: error.message });
  }
};

// Update a transaction
exports.updateTransaction = async (req, res) => {
  try {
    const { amount, type } = req.body;

    const updatedTransaction = await Transaction.findOneAndUpdate(
      { transaction_uuid: req.params.transaction_uuid },
      { amount, type, date_modified: Date.now() },
      { new: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json({ message: 'Transaction updated successfully', transaction: updatedTransaction });
  } catch (error) {
    res.status(500).json({ message: 'Error updating transaction', error: error.message });
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const deletedTransaction = await Transaction.findOneAndDelete({ transaction_uuid: req.params.transaction_uuid });

    if (!deletedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting transaction', error: error.message });
  }
};
