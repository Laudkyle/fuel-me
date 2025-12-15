const { v4: uuidv4 } = require('uuid');
const { BillingCycle, CreditTransaction, Profile } = require('../models');
const express = require("express");
const router = express.Router();
// Create or get current billing cycle
exports.getOrCreateBillingCycle = async (req, res) => {
  try {
    const { user_uuid } = req.body;

    const profile = await Profile.findOne({ user_uuid });
    if (!profile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Check for existing open cycle
    let billingCycle = await BillingCycle.findOne({ 
      user_uuid, 
      status: 'open' 
    });

    if (!billingCycle) {
      // Create new billing cycle based on user category
      const now = new Date();
      let cycleType = 'monthly';
      let startDate = new Date();
      let endDate = new Date();
      let dueDate = new Date();

      if (profile.category === 'commercial_driver') {
        if (profile.repayment_frequency === 'weekly') {
          cycleType = 'weekly';
          endDate.setDate(now.getDate() + 7);
          dueDate.setDate(now.getDate() + 7);
        } else {
          cycleType = 'biweekly';
          endDate.setDate(now.getDate() + 14);
          dueDate.setDate(now.getDate() + 14);
        }
      } else {
        // Monthly cycle - closes on 20th
        cycleType = 'monthly';
        endDate = new Date(now.getFullYear(), now.getMonth(), 20);
        if (now.getDate() > 20) {
          endDate.setMonth(endDate.getMonth() + 1);
        }
        dueDate = new Date(endDate);
        dueDate.setDate(dueDate.getDate() + 7); // Due 7 days after cycle end
      }

      billingCycle = new BillingCycle({
        cycle_uuid: uuidv4(),
        user_uuid,
        cycle_period: `${endDate.toLocaleString('default', { month: 'long' })}-${endDate.getFullYear()}`,
        cycle_type: cycleType,
        start_date: startDate,
        end_date: endDate,
        due_date: dueDate,
        opening_balance: profile.outstanding_balance,
        status: 'open'
      });

      await billingCycle.save();
    }

    res.status(200).json({
      message: 'Billing cycle retrieved/created successfully',
      billing_cycle: billingCycle
    });
  } catch (error) {
    res.status(500).json({ message: 'Error with billing cycle', error: error.message });
  }
};

// Close billing cycle (run on 20th of month for monthly cycles)
exports.closeBillingCycle = async (req, res) => {
  try {
    const { cycle_uuid } = req.params;

    const billingCycle = await BillingCycle.findOne({ cycle_uuid });
    if (!billingCycle) {
      return res.status(404).json({ message: 'Billing cycle not found' });
    }

    if (billingCycle.status === 'closed') {
      return res.status(400).json({ message: 'Billing cycle already closed' });
    }

    // Calculate final closing balance
    const closingBalance = billingCycle.opening_balance + 
                          billingCycle.total_purchases - 
                          billingCycle.total_repayments +
                          billingCycle.total_interest_charged +
                          billingCycle.total_penalties;

    billingCycle.closing_balance = closingBalance;
    billingCycle.status = 'closed';
    billingCycle.closed_date = new Date();
    billingCycle.date_modified = new Date();

    await billingCycle.save();

    // For monthly cycles, create new cycle for next period
    if (billingCycle.cycle_type === 'monthly') {
      const nextStartDate = new Date(billingCycle.end_date);
      const nextEndDate = new Date(nextStartDate.getFullYear(), nextStartDate.getMonth(), 20);
      if (nextStartDate.getDate() > 20) {
        nextEndDate.setMonth(nextEndDate.getMonth() + 1);
      }
      const nextDueDate = new Date(nextEndDate);
      nextDueDate.setDate(nextDueDate.getDate() + 7);

      const newBillingCycle = new BillingCycle({
        cycle_uuid: uuidv4(),
        user_uuid: billingCycle.user_uuid,
        cycle_period: `${nextEndDate.toLocaleString('default', { month: 'long' })}-${nextEndDate.getFullYear()}`,
        cycle_type: 'monthly',
        start_date: nextStartDate,
        end_date: nextEndDate,
        due_date: nextDueDate,
        opening_balance: closingBalance,
        status: 'open'
      });

      await newBillingCycle.save();

      res.status(200).json({
        message: 'Billing cycle closed and new cycle created',
        closed_cycle: billingCycle,
        new_cycle: newBillingCycle
      });
    } else {
      res.status(200).json({
        message: 'Billing cycle closed successfully',
        billing_cycle: billingCycle
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error closing billing cycle', error: error.message });
  }
};

// Get billing cycle history for user
exports.getBillingCycleHistory = async (req, res) => {
  try {
    const { user_uuid } = req.params;
    const { status, limit = 10 } = req.query;

    const query = { user_uuid };
    if (status) query.status = status;

    const billingCycles = await BillingCycle.find(query)
      .sort({ start_date: -1 })
      .limit(parseInt(limit));

    res.status(200).json(billingCycles);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving billing cycles', error: error.message });
  }
};

// Apply penalty for late payment
exports.applyLatePaymentPenalty = async (req, res) => {
  try {
    const { cycle_uuid } = req.params;

    const billingCycle = await BillingCycle.findOne({ cycle_uuid });
    if (!billingCycle) {
      return res.status(404).json({ message: 'Billing cycle not found' });
    }

    // Check if overdue
    if (billingCycle.due_date >= new Date() || billingCycle.status === 'settled') {
      return res.status(400).json({ message: 'Cycle is not overdue or already settled' });
    }

    // Calculate penalty (2% of outstanding balance)
    const outstandingBalance = billingCycle.closing_balance || 
                              (billingCycle.opening_balance + 
                               billingCycle.total_purchases - 
                               billingCycle.total_repayments +
                               billingCycle.total_interest_charged);
    
    const penaltyAmount = outstandingBalance * 0.02;

    // Create penalty transaction
    const penaltyTransaction = new CreditTransaction({
      transaction_uuid: uuidv4(),
      user_uuid: billingCycle.user_uuid,
      type: 'penalty',
      principal_amount: penaltyAmount,
      total_amount: penaltyAmount,
      billing_cycle_uuid: billingCycle.cycle_uuid,
      status: 'completed'
    });

    await penaltyTransaction.save();

    // Update billing cycle
    billingCycle.total_penalties += penaltyAmount;
    billingCycle.status = 'overdue';
    billingCycle.date_modified = new Date();
    await billingCycle.save();

    // Update user profile
    const profile = await Profile.findOne({ user_uuid: billingCycle.user_uuid });
    if (profile) {
      profile.outstanding_balance += penaltyAmount;
      profile.date_modified = new Date();
      await profile.save();
    }

    res.status(200).json({
      message: 'Late payment penalty applied',
      penalty_amount: penaltyAmount,
      billing_cycle: billingCycle,
      new_outstanding_balance: profile?.outstanding_balance
    });
  } catch (error) {
    res.status(500).json({ message: 'Error applying penalty', error: error.message });
  }
};