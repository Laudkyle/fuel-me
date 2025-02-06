const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
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
const loanRoutes = require("./routes/loanRoutes");
const repaymentScheduleRoutes = require("./routes/repaymentScheduleRoutes");

// Database connection
const connectDB = require("./config/db");

const app = express();

// Middleware
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
app.use("/api/loans", loanRoutes);
app.use("/api/repaymentSchedules", repaymentScheduleRoutes);
dotenv.config();

// Connect to the Database
connectDB();

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
