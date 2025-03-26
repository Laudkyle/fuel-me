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
  name: { type: String, required: true }, // Changed from fullname to match frontend
  address: { type: String },
  email: { type: String },
  category: { type: String },
  staff_id: { type: String }, // Kept for Civil Work category
  company_id: { type: String }, // Added for Corporate Worker category
  id_image1: { type: String }, // idFront in frontend
  id_image2: { type: String }, // idBack in frontend
  personal_image: { type: String }, // selfie in frontend
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
  picture: { type: String },
  date_created: { type: Date, default: Date.now },
  date_modified: { type: Date },
  date_deleted: { type: Date },
});

// Stations
const StationSchema = new mongoose.Schema({
  station_uuid: { type: String, required: true, unique: true, default: uuidv4 },
  agent_uuid: [{ type: String, ref: 'Agent' }],
  location: { type: String },
  code: { type: String },
  name: { type: String },
  bank_uuid: { type: String, ref: 'Bank' },
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

// Requests
const RequestSchema = new mongoose.Schema({
  request_uuid: { type: String, required: true, unique: true, default: uuidv4 },
  user_uuid: { type: String, ref: 'User', required: true },
  fuel: { type: Number, required: true },
  fuel_type: { type: String, required: true },
  amount: { type: Number, required: true },
  station_uuid: { type: String, ref: 'Station' },
  datetime: { type: Date, default: Date.now },
  status: { type: String },
  car_uuid: { type: String, ref: 'Car' },
  agent_uuid: { type: String, ref: 'Agent' },
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
const LoanSchema = new mongoose.Schema({
  loan_uuid: { type: String, required: true, unique: true, default: uuidv4 },
  user_uuid: { type: String, ref: 'User', required: true },
  amount: { type: Number, required: true },
  balance: { type: Number },
  agent_uuid: { type: String, ref: 'Agent' },
  car_uuid: { type: String, ref: 'Car' },
  status: { type: String },
});

// Repayment Schedules
const RepaymentScheduleSchema = new mongoose.Schema({
  repayment_schedule_uuid: { type: String, required: true, unique: true, default: uuidv4 },
  loan_uuid: { type: String, ref: 'Loan', required: true },
  due_date: { type: Date, required: true },
  repayment_frequency: { type: String, enum: ['monthly', 'weekly', 'every_two_weeks', 'anytime'], required: true },
  total_amount_due: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'overdue'], required: true },
  date_created: { type: Date, default: Date.now },
  date_modified: { type: Date },
  date_deleted: { type: Date },
});

// Model exports
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
  Loan: mongoose.model('Loan', LoanSchema),
  RepaymentSchedule: mongoose.model('RepaymentSchedule', RepaymentScheduleSchema),
};
