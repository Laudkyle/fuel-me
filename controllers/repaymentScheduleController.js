const { v4: uuidv4 } = require('uuid');
const { RepaymentSchedule, BillingCycle, Profile } = require('../models');
const express = require('express');
// Create repayment schedule from billing cycle (REPLACES createRepaymentSchedule)
exports.createRepaymentScheduleFromCycle = async (req, res) => {
  try {
    const { billing_cycle_uuid } = req.body;

    const billingCycle = await BillingCycle.findOne({ cycle_uuid: billing_cycle_uuid });
    if (!billingCycle) {
      return res.status(404).json({ message: 'Billing cycle not found' });
    }

    const profile = await Profile.findOne({ user_uuid: billingCycle.user_uuid });
    if (!profile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Calculate total due
    const totalDue = billingCycle.total_purchases + 
                     billingCycle.total_interest_charged + 
                     billingCycle.total_penalties -
                     billingCycle.total_repayments;

    const minimumDue = totalDue * 0.1; // 10% minimum payment

    const repaymentSchedule = new RepaymentSchedule({
      repayment_schedule_uuid: uuidv4(),
      user_uuid: billingCycle.user_uuid,
      billing_cycle_uuid: billingCycle.cycle_uuid,
      due_date: billingCycle.due_date,
      repayment_frequency: profile.repayment_frequency || 'monthly',
      total_amount_due: totalDue,
      minimum_amount_due: minimumDue,
      principal_amount: billingCycle.total_purchases,
      interest_amount: billingCycle.total_interest_charged,
      penalty_amount: billingCycle.total_penalties,
      status: totalDue <= 0 ? 'paid' : 'pending'
    });

    await repaymentSchedule.save();

    res.status(201).json({
      message: 'Repayment schedule created successfully',
      repayment_schedule: repaymentSchedule
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating repayment schedule', error: error.message });
  }
};

// Get user's repayment schedules (REPLACES getAllRepaymentSchedules for user-specific)
exports.getUserRepaymentSchedules = async (req, res) => {
  try {
    const { user_uuid } = req.params;
    const { status } = req.query;

    const query = { user_uuid };
    if (status) query.status = status;

    const repaymentSchedules = await RepaymentSchedule.find(query)
      .populate('billing_cycle_uuid', 'cycle_period due_date')
      .sort({ due_date: -1 });

    res.status(200).json(repaymentSchedules);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving repayment schedules', error: error.message });
  }
};

// Get a specific repayment schedule by UUID
exports.getRepaymentScheduleByUUID = async (req, res) => {
  try {
    const repaymentSchedule = await RepaymentSchedule.findOne({ 
      repayment_schedule_uuid: req.params.repayment_schedule_uuid 
    });

    if (!repaymentSchedule) {
      return res.status(404).json({ message: 'Repayment schedule not found' });
    }

    res.status(200).json(repaymentSchedule);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving repayment schedule', error: error.message });
  }
};

// Update repayment schedule status after payment (REPLACES updateRepaymentSchedule)
exports.updateRepaymentScheduleStatus = async (req, res) => {
  try {
    const { repayment_schedule_uuid } = req.params;
    const { amount_paid } = req.body;

    const repaymentSchedule = await RepaymentSchedule.findOne({ repayment_schedule_uuid });
    if (!repaymentSchedule) {
      return res.status(404).json({ message: 'Repayment schedule not found' });
    }

    repaymentSchedule.amount_paid += amount_paid;
    repaymentSchedule.last_payment_date = new Date();

    // Update status based on payment
    if (repaymentSchedule.amount_paid >= repaymentSchedule.total_amount_due) {
      repaymentSchedule.status = 'paid';
    } else if (repaymentSchedule.amount_paid >= repaymentSchedule.minimum_amount_due) {
      repaymentSchedule.status = 'partially_paid';
    } else if (repaymentSchedule.due_date < new Date()) {
      repaymentSchedule.status = 'overdue';
    }

    repaymentSchedule.date_modified = new Date();
    await repaymentSchedule.save();

    res.status(200).json({
      message: 'Repayment schedule updated successfully',
      repayment_schedule: repaymentSchedule
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating repayment schedule', error: error.message });
  }
};

// Delete a repayment schedule
exports.deleteRepaymentSchedule = async (req, res) => {
  try {
    const deletedRepaymentSchedule = await RepaymentSchedule.findOneAndDelete({ 
      repayment_schedule_uuid: req.params.repayment_schedule_uuid 
    });

    if (!deletedRepaymentSchedule) {
      return res.status(404).json({ message: 'Repayment schedule not found' });
    }

    res.status(200).json({ message: 'Repayment schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting repayment schedule', error: error.message });
  }
};

// Get all repayment schedules (admin view)
exports.getAllRepaymentSchedules = async (req, res) => {
  try {
    const repaymentSchedules = await RepaymentSchedule.find()
      .populate('billing_cycle_uuid', 'cycle_period due_date')
      .sort({ due_date: -1 });

    res.status(200).json(repaymentSchedules);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving repayment schedules', error: error.message });
  }
};