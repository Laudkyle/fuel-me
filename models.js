const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const UserSchema = new mongoose.Schema({
  user_uuid: { type: String, required: true, unique: true, default: uuidv4 },
  phone: { type: String, required: true, unique: true },
  pin: { type: String, required: true }, 
});
const ProfileSchema = new mongoose.Schema({
  user_uuid: { type: String, ref: 'User', required: true },
  profile_uuid: { type: String, required: true, unique: true, default: uuidv4 },
  name: { type: String, required: true },
  address: { type: String },
  
  // Credit Management - UPDATED
  credit_limit: { type: Number, default: 1500 }, 
  available_credit: { type: Number, default: 1500 }, // Current available credit
  outstanding_balance: { type: Number, default: 0 }, // Total amount owed
  credit_utilized: { type: Number, default: 0 }, // Amount currently used
  
  // Credit Terms
  interest_rate: { type: Number, default: 0.05 }, // 5% monthly standard rate
  overdraft_interest_rate: { type: Number, default: 0.07 }, // 7% for overdrafts
  penalty_interest_rate: { type: Number, default: 0.02 }, // 2% penalty for late payments
  grace_period_days: { type: Number, default: 14 }, // 14-day grace period
  
  // Repayment Cycle Configuration
  repayment_frequency: { 
    type: String, 
    enum: ['monthly', 'weekly', 'biweekly', 'anytime'], 
    default: 'monthly' 
  },
  repayment_day: { type: Number }, // e.g., 20th of month for monthly
  next_repayment_date: { type: Date },
  
  // Client Classification
  category: { 
    type: String, 
    enum: ['civil_worker', 'commercial_driver', 'corporate_worker', 'other'],
    required: true 
  },
  
  // Client-specific fields
  staff_id: { type: String }, // For Civil Workers
  company_id: { type: String }, // For Corporate Workers
  driver_id: { type: String }, // For Commercial Drivers
  payroll_integrated: { type: Boolean, default: false }, // For auto-deductions
  
  // Overdraft Settings
  overdraft_enabled: { type: Boolean, default: false },
  overdraft_limit: { type: Number, default: 0 },
  overdraft_used: { type: Number, default: 0 },
  
  // Credit History
  credit_score: { type: Number, default: 0 },
  last_credit_review: { type: Date },
  
  // Documents
  id_image1: { type: String },
  id_image2: { type: String },
  personal_image: { type: String },
  
  // Status Flags
  account_status: { 
    type: String, 
    enum: ['active', 'suspended', 'closed', 'overdue'],
    default: 'active' 
  },
  
  // Dates
  date_created: { type: Date, default: Date.now },
  date_modified: { type: Date },
  date_deleted: { type: Date },
});
// Agents
const AgentSchema = new mongoose.Schema({
  user_uuid: { type: String, ref: 'User', required: true },
  station_uuid: { type: String, ref: 'Station' },
  agent_uuid: { type: String, required: true, unique: true, default: uuidv4 },
  fullname: { type: String, required: true },
  phone: { type: String, required: true },
  transaction_pin: { type: String },
  date_created: { type: Date, default: Date.now },
  date_modified: { type: Date },
  date_deleted: { type: Date },
});

// Cars
const CarSchema = new mongoose.Schema({
  user_uuid: { type: String, ref: 'User', required: true },
  car_uuid: { type: String, required: true, unique: true, default: uuidv4 },
  car_model: { type: String, required: true },
  car_number: { type: String, required: true },
  fuel_type: { type: String },
  transmission: { type: String },
  picture: { type: String },
  date_created: { type: Date, default: Date.now },
  date_modified: { type: Date },
  date_deleted: { type: Date },
});

const StationSchema = new mongoose.Schema({
  station_uuid: { type: String, required: true, unique: true, default: uuidv4 },
  agent_uuid: [{ type: String, ref: "Agent" }],
  location: { type: String },
  code: { type: String },
  name: { type: String },
  bank_uuid: { type: String, ref: "Bank" },
  latitude: { type: Number},  
  longitude: { type: Number}, 
  ppl_diesel: { type: Number,required:true}, 
  ppl_petrol: { type: Number, required:true}, 
  date_created: { type: Date, default: Date.now },
  date_modified: { type: Date },
  date_deleted: { type: Date },
});


// Banks
const BankSchema = new mongoose.Schema({
  bank_uuid: { type: String, required: true, unique: true, default: uuidv4 },
  bank_name: { type: String, required: true },
  account_number: { type: String, required: true },
  location: { type: String },
  date_created: { type: Date, default: Date.now },
  date_modified: { type: Date },
  date_deleted: { type: Date },
});

const RequestSchema = new mongoose.Schema({
  request_uuid: { type: String, required: true, unique: true, default: uuidv4 },
  user_uuid: { type: String, ref: 'User', required: true },
  
  fuel_liters: { type: Number, required: true },
  fuel_type: { type: String, required: true },
  amount: { type: Number, required: true },
  
  station_uuid: { type: String, ref: 'Station' },
  datetime: { type: Date, default: Date.now },
  
  // Credit Information at time of request
  available_credit_before: { type: Number },
  credit_limit_before: { type: Number },
  outstanding_balance_before: { type: Number },
  
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'declined', 'completed', 'cancelled'],
    default: 'pending' 
  },
  
  car_uuid: { type: String, ref: 'Car' },
  agent_uuid: { type: String, ref: 'Agent' },
  decline_reason: { type: String },
  
  is_overdraft: { type: Boolean, default: false },
  overdraft_amount: { type: Number, default: 0 },
  credit_transaction_uuid: { type: String, ref: 'CreditTransaction' },
  
  date_created: { type: Date, default: Date.now },
  date_modified: { type: Date },
  date_deleted: { type: Date },
});
const InterestCalculationSchema = new mongoose.Schema({
  calculation_uuid: { type: String, required: true, unique: true, default: uuidv4 },
  user_uuid: { type: String, ref: 'User', required: true },
  transaction_uuid: { type: String, ref: 'CreditTransaction', required: true },
  billing_cycle_uuid: { type: String, ref: 'BillingCycle' },
  
  // Calculation Details
  principal_amount: { type: Number, required: true },
  daily_interest_rate: { type: Number, required: true }, // e.g., 0.05/30 = 0.001667
  days_outstanding: { type: Number, required: true },
  calculated_interest: { type: Number, required: true },
  
  // Dates
  transaction_date: { type: Date, required: true },
  interest_start_date: { type: Date }, // After grace period
  calculation_date: { type: Date, default: Date.now },
  applied_to_cycle_date: { type: Date },
  
  // Flags
  is_overdraft_interest: { type: Boolean, default: false },
  is_penalty_interest: { type: Boolean, default: false },
  grace_period_applied: { type: Boolean, default: false },
  
  date_created: { type: Date, default: Date.now },
  date_modified: { type: Date },
  date_deleted: { type: Date },
});
const BillingCycleSchema = new mongoose.Schema({
  cycle_uuid: { type: String, required: true, unique: true, default: uuidv4 },
  user_uuid: { type: String, ref: 'User', required: true },
  
  // Cycle Identification
  cycle_period: { type: String, required: true }, // e.g., "March-2025"
  cycle_type: { 
    type: String, 
    enum: ['monthly', 'weekly', 'biweekly'],
    required: true 
  },
  
  // Dates
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  due_date: { type: Date, required: true }, // Repayment due date (e.g., 20th)
  closed_date: { type: Date }, // When accounting entries are made
  
  // Financial Summary
  opening_balance: { type: Number, default: 0 },
  total_purchases: { type: Number, default: 0 },
  total_repayments: { type: Number, default: 0 },
  total_interest_charged: { type: Number, default: 0 },
  total_penalties: { type: Number, default: 0 },
  closing_balance: { type: Number, default: 0 },
  
  // Overdraft Summary
  overdraft_used: { type: Number, default: 0 },
  overdraft_interest: { type: Number, default: 0 },
  
  // Minimum Payment
  minimum_payment_amount: { type: Number },
  minimum_payment_percentage: { type: Number, default: 0.1 }, // 10% default
  
  // Status
  status: { 
    type: String, 
    enum: ['open', 'closed', 'overdue', 'settled'],
    default: 'open' 
  },
  
  // Transactions in this cycle
  transaction_uuids: [{ type: String, ref: 'CreditTransaction' }],
  
  date_created: { type: Date, default: Date.now },
  date_modified: { type: Date },
  date_deleted: { type: Date },
});
// Payments
const PaymentSchema = new mongoose.Schema({
  loan_uuid: { type: String, ref: 'Loan', required: true },
  amount: { type: Number, required: true },
  datetime: { type: Date, default: Date.now },
  payment_uuid: { type: String, required: true, unique: true, default: uuidv4 },
});

// Cards
const CardSchema = new mongoose.Schema({
  user_uuid: { type: String, ref: 'User', required: true },
  card_uuid: { type: String, required: true, unique: true, default: uuidv4 },
  name: { type: String },
  card_number: { type: String, required: true },
  expiry_date: { type: String },
  cvc: { type: String },
  date_created: { type: Date, default: Date.now },
  date_modified: { type: Date },
  date_deleted: { type: Date },
});

// MOMO
const MomoSchema = new mongoose.Schema({
  user_uuid: { type: String, ref: 'User', required: true },
  vendor: { type: String },
  name: { type: String },
  phone: { type: String, required: true },
  momo_uuid: { type: String, required: true, unique: true, default: uuidv4 },
  date_created: { type: Date, default: Date.now },
  date_modified: { type: Date },
  date_deleted: { type: Date },
});

// Transactions
const TransactionSchema = new mongoose.Schema({
  user_uuid: { type: String, ref: 'User', required: true },
  loan_uuid: { type: String, ref: 'Loan' },
  transaction_uuid: { type: String, required: true, unique: true, default: uuidv4 },
  amount: { type: Number, required: true },
  datetime: { type: Date, default: Date.now },
  type: { type: String },
});

// Loans
// REPLACE LoanSchema with CreditTransactionSchema
const CreditTransactionSchema = new mongoose.Schema({
  transaction_uuid: { type: String, required: true, unique: true, default: uuidv4 },
  user_uuid: { type: String, ref: 'User', required: true },
  
  // Transaction Details
  type: { 
    type: String, 
    enum: ['fuel_purchase', 'repayment', 'interest_charge', 'penalty', 'overdraft', 'credit_adjustment'],
    required: true 
  },
  
  // Fuel Purchase Specific
  fuel_amount_liters: { type: Number },
  fuel_type: { type: String },
  fuel_cost_per_liter: { type: Number },
  station_uuid: { type: String, ref: 'Station' },
  agent_uuid: { type: String, ref: 'Agent' },
  car_uuid: { type: String, ref: 'Car' },
  request_uuid: { type: String, ref: 'Request' },
  
  // Financial Details
  principal_amount: { type: Number, required: true }, // Original transaction amount
  interest_amount: { type: Number, default: 0 },
  penalty_amount: { type: Number, default: 0 },
  total_amount: { type: Number, required: true }, // principal + interest + penalty
  
  // Credit Impact
  credit_used_before: { type: Number },
  credit_used_after: { type: Number },
  available_credit_before: { type: Number },
  available_credit_after: { type: Number },
  
  // Interest Calculation
  interest_rate_applied: { type: Number },
  is_overdraft: { type: Boolean, default: false },
  grace_period_applies: { type: Boolean, default: true },
  interest_start_date: { type: Date }, // When interest starts accruing
  
  // Dates
  transaction_date: { type: Date, default: Date.now },
  effective_date: { type: Date, default: Date.now }, // For interest calculation
  settlement_date: { type: Date }, // When actually paid/settled
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'cancelled', 'overdue', 'partially_paid'],
    default: 'pending' 
  },
  
  // Repayment Tracking (for repayments)
  parent_transaction_uuid: { type: String, ref: 'CreditTransaction' }, // For repayments linking to purchase
  repayment_for_period: { type: String }, 
  
  date_created: { type: Date, default: Date.now },
  date_modified: { type: Date },
  date_deleted: { type: Date },
});

const RepaymentScheduleSchema = new mongoose.Schema({
  repayment_schedule_uuid: { type: String, required: true, unique: true, default: uuidv4 },
  user_uuid: { type: String, ref: 'User', required: true },
  billing_cycle_uuid: { type: String, ref: 'BillingCycle' },
  
  due_date: { type: Date, required: true },
  repayment_frequency: { type: String, enum: ['monthly', 'weekly', 'every_two_weeks', 'anytime'], required: true },
  
  // Payment Details
  total_amount_due: { type: Number, required: true },
  minimum_amount_due: { type: Number, required: true },
  principal_amount: { type: Number, required: true },
  interest_amount: { type: Number, required: true },
  penalty_amount: { type: Number, default: 0 },
  
  status: { type: String, enum: ['pending', 'paid', 'overdue', 'partially_paid'], default: 'pending' },
  
  // Payment tracking
  amount_paid: { type: Number, default: 0 },
  last_payment_date: { type: Date },
  
  date_created: { type: Date, default: Date.now },
  date_modified: { type: Date },
  date_deleted: { type: Date },
});

module.exports = {
  User: mongoose.model('User', UserSchema),
  Profile: mongoose.model('Profile', ProfileSchema),
  Agent: mongoose.model('Agent', AgentSchema),
  Car: mongoose.model('Car', CarSchema),
  Station: mongoose.model('Station', StationSchema),
  Bank: mongoose.model('Bank', BankSchema),
  Request: mongoose.model('Request', RequestSchema),
  Payment: mongoose.model('Payment', PaymentSchema),
  Card: mongoose.model('Card', CardSchema),
  Momo: mongoose.model('Momo', MomoSchema),
  Transaction: mongoose.model('Transaction', TransactionSchema),
  
  CreditTransaction: mongoose.model('CreditTransaction', CreditTransactionSchema),
  BillingCycle: mongoose.model('BillingCycle', BillingCycleSchema),
  InterestCalculation: mongoose.model('InterestCalculation', InterestCalculationSchema),
  RepaymentSchedule: mongoose.model('RepaymentSchedule', RepaymentScheduleSchema),
  
};
