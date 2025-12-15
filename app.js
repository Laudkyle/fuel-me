const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors"); // Import CORS
const { v4: uuidv4 } = require("uuid");

// Import Routes
const userRoutes = require("./routes/userRoutes");
const profileRoutes = require("./routes/profileRoutes");
const agentRoutes = require("./routes/agentRoutes");
const carRoutes = require("./routes/carRoutes");
const stationRoutes = require("./routes/stationRoutes");
const bankRoutes = require("./routes/bankRoutes");
const requestRoutes = require("./routes/requestRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const cardRoutes = require("./routes/cardRoutes");
const momoRoutes = require("./routes/momoRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

// NEW: BNPL Fuel Credit System Routes
const creditTransactionRoutes = require("./routes/creditTransactionRoutes");
const billingCycleRoutes = require("./routes/billingCycleRoutes");
const repaymentScheduleRoutes = require("./routes/repaymentScheduleRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// Database connection
const connectDB = require("./config/db");

dotenv.config(); // Load environment variables

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(bodyParser.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/stations", stationRoutes);
app.use("/api/banks", bankRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/momo", momoRoutes);
app.use("/api/transactions", transactionRoutes);

// NEW: BNPL Fuel Credit System Routes
app.use("/api/credit-transactions", creditTransactionRoutes); // Replaces old loan system
app.use("/api/billing-cycles", billingCycleRoutes); // Manages billing cycles
app.use("/api/repayment-schedules", repaymentScheduleRoutes); // Updated repayment schedules
app.use("/api/dashboard", dashboardRoutes);

// Connect to the Database
connectDB();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`BNPL Fuel Credit System API available at:`);
  console.log(`- POST /api/credit-transactions/fuel-purchase`);
  console.log(`- POST /api/credit-transactions/repayment`);
  console.log(`- GET  /api/credit-transactions/user/:user_uuid`);
  console.log(`- POST /api/billing-cycles/get-or-create`);
  console.log(`- GET  /api/billing-cycles/history/:user_uuid`);
  console.log(`- POST /api/repayment-schedules/from-cycle`);
  console.log(`- GET  /api/repayment-schedules/user/:user_uuid`);
});