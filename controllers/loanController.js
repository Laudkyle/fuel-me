const { v4: uuidv4 } = require('uuid');
const { Loan } = require('../models');

// Create a new loan
exports.createLoan = async (req, res) => {
  try {
    const { user_uuid, amount, agent_uuid, car_uuid, status } = req.body;

    const newLoan = new Loan({
      loan_uuid: uuidv4(), // Generate UUID automatically
      user_uuid,
      amount,
      balance: amount, // Initial balance is the loan amount
      agent_uuid,
      car_uuid,
      status,
    });

    await newLoan.save();
    res.status(201).json({ message: 'Loan created successfully', loan: newLoan });
  } catch (error) {
    res.status(500).json({ message: 'Error creating loan', error: error.message });
  }
};

// Get all loans
exports.getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find();
    res.status(200).json(loans);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving loans', error: error.message });
  }
};

// Get a loan by UUID
exports.getLoanByUUID = async (req, res) => {
  try {
    const loan = await Loan.findOne({ loan_uuid: req.params.loan_uuid });
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    res.status(200).json(loan);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving loan', error: error.message });
  }
};

// Get all loans for a specific user
exports.getUserLoans = async (req, res) => {
  try {
    const { user_uuid } = req.params;

    // Fetch loans belonging to the user
    const userLoans = await Loan.find({ user_uuid });

    if (userLoans.length === 0) {
      return res.status(404).json({ message: 'No loans found for this user' });
    }

    res.status(200).json(userLoans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user loans', error: error.message });
  }
};

// Update a loan
exports.updateLoan = async (req, res) => {
  try {
    const { amount, balance, agent_uuid, car_uuid, status } = req.body;

    const updatedLoan = await Loan.findOneAndUpdate(
      { loan_uuid: req.params.loan_uuid },
      { amount, balance, agent_uuid, car_uuid, status, date_modified: Date.now() },
      { new: true }
    );

    if (!updatedLoan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    res.status(200).json({ message: 'Loan updated successfully', loan: updatedLoan });
  } catch (error) {
    res.status(500).json({ message: 'Error updating loan', error: error.message });
  }
};

// Delete a loan
exports.deleteLoan = async (req, res) => {
  try {
    const deletedLoan = await Loan.findOneAndDelete({ loan_uuid: req.params.loan_uuid });

    if (!deletedLoan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    res.status(200).json({ message: 'Loan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting loan', error: error.message });
  }
};
