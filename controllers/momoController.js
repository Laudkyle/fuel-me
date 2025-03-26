const { v4: uuidv4 } = require('uuid');
const { Momo } = require('../models');

// Create a new momo account
exports.createMomo = async (req, res) => {
  try {
    const { user_uuid, vendor, name, phone } = req.body;

    const newMomo = new Momo({
      momo_uuid: uuidv4(), 
      user_uuid,
      vendor,
      name,
      phone,
    });

    await newMomo.save();
    res.status(201).json({ message: 'Momo account created successfully', momo: newMomo });
  } catch (error) {
    res.status(500).json({ message: 'Error creating momo account', error: error.message });
  }
};

// Get all momo accounts
exports.getAllMomo = async (req, res) => {
  try {
    const momoAccounts = await Momo.find();
    res.status(200).json(momoAccounts);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving momo accounts', error: error.message });
  }
};

// Get a momo account by UUID
exports.getMomoByUUID = async (req, res) => {
  try {
    const momo = await Momo.findOne({ momo_uuid: req.params.momo_uuid });
    if (!momo) {
      return res.status(404).json({ message: 'Momo account not found' });
    }
    res.status(200).json(momo);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving momo account', error: error.message });
  }
};

// Update a momo account
exports.updateMomo = async (req, res) => {
  try {
    const { vendor, name, phone } = req.body;

    const updatedMomo = await Momo.findOneAndUpdate(
      { momo_uuid: req.params.momo_uuid },
      { vendor, name, phone, date_modified: Date.now() },
      { new: true }
    );

    if (!updatedMomo) {
      return res.status(404).json({ message: 'Momo account not found' });
    }

    res.status(200).json({ message: 'Momo account updated successfully', momo: updatedMomo });
  } catch (error) {
    res.status(500).json({ message: 'Error updating momo account', error: error.message });
  }
};

// Delete a momo account
exports.deleteMomo = async (req, res) => {
  try {
    const deletedMomo = await Momo.findOneAndDelete({ momo_uuid: req.params.momo_uuid });

    if (!deletedMomo) {
      return res.status(404).json({ message: 'Momo account not found' });
    }

    res.status(200).json({ message: 'Momo account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting momo account', error: error.message });
  }
};
