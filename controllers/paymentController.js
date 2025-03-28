const { v4: uuidv4 } = require('uuid');
const { Payment, Loan } = require('../models');
// Create a new payment
exports.createPayment = async (req, res) => {
  try {
    const { loan_uuid, amount } = req.body;

    const newPayment = new Payment({
      payment_uuid: uuidv4(), // Generate UUID automatically
      loan_uuid,
      amount,
    });

    await newPayment.save();
    res.status(201).json({ message: 'Payment created successfully', payment: newPayment });
  } catch (error) {
    res.status(500).json({ message: 'Error creating payment', error: error.message });
  }
};

// Get all payments for a specific user
exports.getUserPayments = async (req, res) => {
  try {
    const { user_uuid } = req.params;

    // Find loans associated with the user
    const userLoans = await Loan.find({ user_uuid }).select('loan_uuid');

    if (userLoans.length === 0) {
      return res.status(404).json({ message: 'No loans found for this user' });
    }

    // Extract loan UUIDs
    const loanUUIDs = userLoans.map((loan) => loan.loan_uuid);

    // Find payments for the user's loans
    const userPayments = await Payment.find({ loan_uuid: { $in: loanUUIDs } });

    if (userPayments.length === 0) {
      return res.status(404).json({ message: 'No payments found for this user' });
    }

    res.status(200).json(userPayments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user payments', error: error.message });
  }
};



// Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving payments', error: error.message });
  }
};

// Get a payment by UUID
exports.getPaymentByUUID = async (req, res) => {
  try {
    const payment = await Payment.findOne({ payment_uuid: req.params.payment_uuid });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving payment', error: error.message });
  }
};

// Update a payment
exports.updatePayment = async (req, res) => {
  try {
    const { amount } = req.body;

    const updatedPayment = await Payment.findOneAndUpdate(
      { payment_uuid: req.params.payment_uuid },
      { amount, date_modified: Date.now() },
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json({ message: 'Payment updated successfully', payment: updatedPayment });
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment', error: error.message });
  }
};

// Delete a payment
exports.deletePayment = async (req, res) => {
  try {
    const deletedPayment = await Payment.findOneAndDelete({ payment_uuid: req.params.payment_uuid });

    if (!deletedPayment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting payment', error: error.message });
  }
};
