const { v4: uuidv4 } = require('uuid');
const { RepaymentSchedule } = require('../models');

// Create a new repayment schedule
exports.createRepaymentSchedule = async (req, res) => {
  try {
    const { loan_uuid, due_date, repayment_frequency, total_amount_due, status } = req.body;

    const newRepaymentSchedule = new RepaymentSchedule({
      repayment_schedule_uuid: uuidv4(), // Generate UUID automatically
      loan_uuid,
      due_date,
      repayment_frequency,
      total_amount_due,
      status,
    });

    await newRepaymentSchedule.save();
    res.status(201).json({ message: 'Repayment schedule created successfully', repaymentSchedule: newRepaymentSchedule });
  } catch (error) {
    res.status(500).json({ message: 'Error creating repayment schedule', error: error.message });
  }
};

// Get all repayment schedules
exports.getAllRepaymentSchedules = async (req, res) => {
  try {
    const repaymentSchedules = await RepaymentSchedule.find();
    res.status(200).json(repaymentSchedules);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving repayment schedules', error: error.message });
  }
};

// Get a repayment schedule by UUID
exports.getRepaymentScheduleByUUID = async (req, res) => {
  try {
    const repaymentSchedule = await RepaymentSchedule.findOne({ repayment_schedule_uuid: req.params.repayment_schedule_uuid });
    if (!repaymentSchedule) {
      return res.status(404).json({ message: 'Repayment schedule not found' });
    }
    res.status(200).json(repaymentSchedule);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving repayment schedule', error: error.message });
  }
};

// Update a repayment schedule
exports.updateRepaymentSchedule = async (req, res) => {
  try {
    const { due_date, repayment_frequency, total_amount_due, status } = req.body;

    const updatedRepaymentSchedule = await RepaymentSchedule.findOneAndUpdate(
      { repayment_schedule_uuid: req.params.repayment_schedule_uuid },
      { due_date, repayment_frequency, total_amount_due, status, date_modified: Date.now() },
      { new: true }
    );

    if (!updatedRepaymentSchedule) {
      return res.status(404).json({ message: 'Repayment schedule not found' });
    }

    res.status(200).json({ message: 'Repayment schedule updated successfully', repaymentSchedule: updatedRepaymentSchedule });
  } catch (error) {
    res.status(500).json({ message: 'Error updating repayment schedule', error: error.message });
  }
};

// Delete a repayment schedule
exports.deleteRepaymentSchedule = async (req, res) => {
  try {
    const deletedRepaymentSchedule = await RepaymentSchedule.findOneAndDelete({ repayment_schedule_uuid: req.params.repayment_schedule_uuid });

    if (!deletedRepaymentSchedule) {
      return res.status(404).json({ message: 'Repayment schedule not found' });
    }

    res.status(200).json({ message: 'Repayment schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting repayment schedule', error: error.message });
  }
};
