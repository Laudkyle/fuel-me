const {Bank} = require('../models');

// Create a new bank
exports.createBank = async (req, res) => {
  try {
    const { bank_uuid, bank_name, account_number, location } = req.body;

    const newBank = new Bank({
      bank_uuid,
      bank_name,
      account_number,
      location,
    });

    await newBank.save();
    res.status(201).json({ message: 'Bank created successfully', bank: newBank });
  } catch (error) {
    res.status(500).json({ message: 'Error creating bank', error: error.message });
  }
};

// Get all banks
exports.getAllBanks = async (req, res) => {
  try {
    const banks = await Bank.find();
    res.status(200).json(banks);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving banks', error: error.message });
  }
};

// Get a bank by UUID
exports.getBankByUUID = async (req, res) => {
  try {
    const bank = await Bank.findOne({ bank_uuid: req.params.bank_uuid });
    if (!bank) {
      return res.status(404).json({ message: 'Bank not found' });
    }
    res.status(200).json(bank);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving bank', error: error.message });
  }
};

// Update a bank
exports.updateBank = async (req, res) => {
  try {
    const { bank_name, account_number, location } = req.body;

    const updatedBank = await Bank.findOneAndUpdate(
      { bank_uuid: req.params.bank_uuid },
      { bank_name, account_number, location, date_modified: Date.now() },
      { new: true }
    );

    if (!updatedBank) {
      return res.status(404).json({ message: 'Bank not found' });
    }

    res.status(200).json({ message: 'Bank updated successfully', bank: updatedBank });
  } catch (error) {
    res.status(500).json({ message: 'Error updating bank', error: error.message });
  }
};

// Delete a bank
exports.deleteBank = async (req, res) => {
  try {
    const deletedBank = await Bank.findOneAndDelete({ bank_uuid: req.params.bank_uuid });

    if (!deletedBank) {
      return res.status(404).json({ message: 'Bank not found' });
    }

    res.status(200).json({ message: 'Bank deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting bank', error: error.message });
  }
};
