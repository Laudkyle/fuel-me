const { v4: uuidv4 } = require('uuid');
const { 
  CreditTransaction, 
  BillingCycle, 
  Profile, 
  Request,
  InterestCalculation 
} = require('../models');
const express = require("express");
const router = express.Router();
// Create a new fuel purchase transaction (replaces createLoan)
exports.createFuelPurchase = async (req, res) => {
  try {
    const { 
      user_uuid, 
      fuel_amount_liters, 
      fuel_type, 
      fuel_cost_per_liter,
      station_uuid,
      agent_uuid,
      car_uuid,
      request_uuid 
    } = req.body;

    // Calculate amount
    const amount = fuel_amount_liters * fuel_cost_per_liter;

    // Get user's profile for credit information
    const profile = await Profile.findOne({ user_uuid });
    if (!profile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Check if user has sufficient credit
    const availableCredit = profile.available_credit;
    
    // Check for overdraft scenario
    let isOverdraft = false;
    let remainingNeeded = 0;
    
    if (amount > availableCredit) {
      // Check if overdraft is enabled and within limit
      if (!profile.overdraft_enabled || (amount - availableCredit) > (profile.overdraft_limit - profile.overdraft_used)) {
        return res.status(400).json({ 
          message: 'Insufficient credit available',
          available_credit: availableCredit,
          required_amount: amount,
          overdraft_available: profile.overdraft_enabled ? profile.overdraft_limit - profile.overdraft_used : 0
        });
      }
      
      isOverdraft = true;
      remainingNeeded = amount - availableCredit;
    }

    // Get current billing cycle or create if doesn't exist
    let billingCycle = await BillingCycle.findOne({ 
      user_uuid, 
      status: 'open' 
    });

    if (!billingCycle) {
      // Determine cycle type based on user category
      let cycleType = 'monthly'; // default
      let startDate = new Date();
      let endDate = new Date();
      let dueDate = new Date();
      
      if (profile.category === 'commercial_driver') {
        if (profile.repayment_frequency === 'weekly') {
          cycleType = 'weekly';
          endDate.setDate(startDate.getDate() + 7);
          dueDate.setDate(startDate.getDate() + 7);
        } else {
          cycleType = 'biweekly';
          endDate.setDate(startDate.getDate() + 14);
          dueDate.setDate(startDate.getDate() + 14);
        }
      } else {
        // Monthly cycle - close on 20th
        cycleType = 'monthly';
        const today = new Date();
        endDate = new Date(today.getFullYear(), today.getMonth(), 20);
        if (today.getDate() > 20) {
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

    // Create the credit transaction
    const transaction = new CreditTransaction({
      transaction_uuid: uuidv4(),
      user_uuid,
      type: 'fuel_purchase',
      fuel_amount_liters,
      fuel_type,
      fuel_cost_per_liter,
      principal_amount: amount,
      total_amount: amount,
      station_uuid,
      agent_uuid,
      car_uuid,
      request_uuid,
      is_overdraft: isOverdraft,
      grace_period_applies: true,
      interest_start_date: new Date(Date.now() + (profile.grace_period_days * 24 * 60 * 60 * 1000)),
      credit_used_before: profile.credit_utilized,
      available_credit_before: profile.available_credit,
      status: 'completed'
    });

    await transaction.save();

    // Update billing cycle
    billingCycle.total_purchases += amount;
    if (isOverdraft) {
      billingCycle.overdraft_used += remainingNeeded;
    }
    billingCycle.transaction_uuids.push(transaction.transaction_uuid);
    await billingCycle.save();

    // Update user profile
    if (isOverdraft) {
      profile.credit_utilized = profile.credit_limit; // Max out regular credit
      profile.overdraft_used += remainingNeeded;
      profile.available_credit = 0;
    } else {
      profile.credit_utilized += amount;
      profile.available_credit -= amount;
    }
    
    profile.outstanding_balance += amount;
    profile.date_modified = new Date();
    
    // Set credit used/after values
    transaction.credit_used_after = profile.credit_utilized;
    transaction.available_credit_after = profile.available_credit;
    await transaction.save();
    
    await profile.save();

    // Update request status if request_uuid provided
    if (request_uuid) {
      await Request.findOneAndUpdate(
        { request_uuid },
        { 
          status: 'completed',
          credit_transaction_uuid: transaction.transaction_uuid,
          available_credit_before: transaction.available_credit_before,
          is_overdraft: isOverdraft,
          overdraft_amount: isOverdraft ? remainingNeeded : 0
        }
      );
    }

    res.status(201).json({ 
      message: 'Fuel purchase completed successfully', 
      transaction,
      available_credit: profile.available_credit,
      credit_utilized: profile.credit_utilized,
      is_overdraft: isOverdraft,
      overdraft_used: profile.overdraft_used
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating fuel purchase', error: error.message });
  }
};

// Process repayment
exports.processRepayment = async (req, res) => {
  try {
    const { user_uuid, amount, payment_method, billing_cycle_uuid } = req.body;

    // Get user profile
    const profile = await Profile.findOne({ user_uuid });
    if (!profile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Get open billing cycle
    const billingCycle = await BillingCycle.findOne({ 
      user_uuid, 
      status: 'open',
      ...(billing_cycle_uuid && { cycle_uuid: billing_cycle_uuid })
    });

    if (!billingCycle) {
      return res.status(404).json({ message: 'No open billing cycle found' });
    }

    // Calculate total due including interest
    const totalDue = await calculateTotalDue(user_uuid, billingCycle.cycle_uuid);
    
    // Check if payment is sufficient for minimum payment
    const minimumDue = totalDue.total_amount * 0.1; // 10% minimum
    
    if (amount < minimumDue && amount < totalDue.total_amount) {
      return res.status(400).json({ 
        message: `Minimum payment required: ${minimumDue.toFixed(2)}`,
        minimum_due: minimumDue,
        total_due: totalDue.total_amount
      });
    }

    // Create repayment transaction
    const repaymentTransaction = new CreditTransaction({
      transaction_uuid: uuidv4(),
      user_uuid,
      type: 'repayment',
      principal_amount: amount,
      total_amount: amount,
      billing_cycle_uuid: billingCycle.cycle_uuid,
      repayment_for_period: billingCycle.cycle_period,
      credit_used_before: profile.credit_utilized,
      available_credit_before: profile.available_credit,
      status: 'completed'
    });

    await repaymentTransaction.save();

    // Update billing cycle
    billingCycle.total_repayments += amount;
    
    // Update profile - replenish credit
    const creditToReplenish = Math.min(amount, profile.credit_utilized);
    profile.credit_utilized -= creditToReplenish;
    profile.available_credit += creditToReplenish;
    profile.outstanding_balance -= amount;
    
    // Handle overdraft repayment
    const overdraftRepayment = Math.min(amount - creditToReplenish, profile.overdraft_used);
    if (overdraftRepayment > 0) {
      profile.overdraft_used -= overdraftRepayment;
    }
    
    profile.date_modified = new Date();
    await profile.save();

    // Update repayment transaction with after values
    repaymentTransaction.credit_used_after = profile.credit_utilized;
    repaymentTransaction.available_credit_after = profile.available_credit;
    await repaymentTransaction.save();

    // Update billing cycle status if fully paid
    if (amount >= totalDue.total_amount) {
      billingCycle.status = 'settled';
      billingCycle.closing_balance = 0;
      billingCycle.closed_date = new Date();
    } else if (billingCycle.due_date < new Date()) {
      billingCycle.status = 'overdue';
    }
    
    await billingCycle.save();

    res.status(200).json({ 
      message: 'Repayment processed successfully', 
      repayment: repaymentTransaction,
      new_balance: profile.outstanding_balance,
      available_credit: profile.available_credit,
      credit_utilized: profile.credit_utilized,
      overdraft_used: profile.overdraft_used
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing repayment', error: error.message });
  }
};

// Calculate interest for billing cycle
exports.calculateInterest = async (req, res) => {
  try {
    const { billing_cycle_uuid } = req.params;

    const billingCycle = await BillingCycle.findOne({ cycle_uuid: billing_cycle_uuid });
    if (!billingCycle) {
      return res.status(404).json({ message: 'Billing cycle not found' });
    }

    // Get all fuel purchase transactions for this cycle
    const fuelPurchases = await CreditTransaction.find({
      user_uuid: billingCycle.user_uuid,
      type: 'fuel_purchase',
      transaction_date: { $gte: billingCycle.start_date, $lte: billingCycle.end_date },
      status: 'completed'
    });

    let totalInterest = 0;
    const interestCalculations = [];

    for (const purchase of fuelPurchases) {
      // Skip if grace period hasn't ended yet
      if (purchase.interest_start_date > new Date()) {
        continue;
      }

      // Calculate days outstanding
      const endDate = billingCycle.end_date;
      const startDate = Math.max(purchase.interest_start_date, purchase.transaction_date);
      const daysOutstanding = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

      if (daysOutstanding <= 0) continue;

      // Determine interest rate
      let interestRate = purchase.is_overdraft ? 0.07 : 0.05; // 7% for overdraft, 5% standard
      const dailyRate = interestRate / 30; // Monthly rate divided by 30 days
      const interest = purchase.principal_amount * dailyRate * daysOutstanding;

      // Create interest calculation record
      const interestCalc = new InterestCalculation({
        calculation_uuid: uuidv4(),
        user_uuid: billingCycle.user_uuid,
        transaction_uuid: purchase.transaction_uuid,
        billing_cycle_uuid: billingCycle.cycle_uuid,
        principal_amount: purchase.principal_amount,
        daily_interest_rate: dailyRate,
        days_outstanding: daysOutstanding,
        calculated_interest: interest,
        transaction_date: purchase.transaction_date,
        interest_start_date: purchase.interest_start_date,
        is_overdraft_interest: purchase.is_overdraft,
        grace_period_applied: true
      });

      await interestCalc.save();
      interestCalculations.push(interestCalc);

      // Update purchase with interest
      purchase.interest_amount = interest;
      purchase.total_amount = purchase.principal_amount + interest;
      await purchase.save();

      totalInterest += interest;
    }

    // Update billing cycle with total interest
    billingCycle.total_interest_charged = totalInterest;
    billingCycle.date_modified = new Date();
    await billingCycle.save();

    res.status(200).json({
      message: 'Interest calculated successfully',
      total_interest: totalInterest,
      interest_calculations: interestCalculations,
      billing_cycle: billingCycle
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating interest', error: error.message });
  }
};

// Get user's credit transactions
exports.getUserTransactions = async (req, res) => {
  try {
    const { user_uuid } = req.params;
    const { type, start_date, end_date } = req.query;

    const query = { user_uuid };
    
    if (type) query.type = type;
    if (start_date || end_date) {
      query.transaction_date = {};
      if (start_date) query.transaction_date.$gte = new Date(start_date);
      if (end_date) query.transaction_date.$lte = new Date(end_date);
    }

    const transactions = await CreditTransaction.find(query)
      .sort({ transaction_date: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving transactions', error: error.message });
  }
};

// Get current billing cycle
exports.getCurrentBillingCycle = async (req, res) => {
  try {
    const { user_uuid } = req.params;

    const billingCycle = await BillingCycle.findOne({
      user_uuid,
      status: 'open'
    });

    if (!billingCycle) {
      return res.status(404).json({ message: 'No open billing cycle found' });
    }

    // Calculate total due for this cycle
    const totalDue = await calculateTotalDue(user_uuid, billingCycle.cycle_uuid);

    res.status(200).json({
      billing_cycle: billingCycle,
      total_due: totalDue.total_amount,
      minimum_due: totalDue.total_amount * 0.1, // 10% minimum
      due_date: billingCycle.due_date
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving billing cycle', error: error.message });
  }
};

// Helper function to calculate total due
async function calculateTotalDue(user_uuid, billing_cycle_uuid) {
  const fuelPurchases = await CreditTransaction.find({
    user_uuid,
    type: 'fuel_purchase',
    status: 'completed'
  }).populate({
    path: 'interest_calculations',
    match: { billing_cycle_uuid }
  });

  let totalPrincipal = 0;
  let totalInterest = 0;

  for (const purchase of fuelPurchases) {
    totalPrincipal += purchase.principal_amount;
    totalInterest += purchase.interest_amount || 0;
  }

  return {
    principal_amount: totalPrincipal,
    interest_amount: totalInterest,
    total_amount: totalPrincipal + totalInterest
  };
}