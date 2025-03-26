const express = require("express");
const router = express.Router();
const { User, Transaction, Loan, Payment, Agent } = require("../models"); // Single file for models

// Dashboard API
router.get("/", async (req, res) => {
  try {
    // Get total counts
    const usersCount = await User.countDocuments();
    const transactionsCount = await Transaction.countDocuments();
    const loansCount = await Loan.countDocuments();
    const paymentsCount = await Payment.countDocuments();
    const agentsCount = await Agent.countDocuments();

    // Get recent transactions (latest 5)
    const recentTransactions = await Transaction.find().sort({ createdAt: -1 }).limit(5);

    // Transactions chart data (grouped by month)
    const transactionsByMonth = await Transaction.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const transactionChart = transactionsByMonth.map((t) => ({
      month: `Month ${t._id}`,
      transactions: t.transactions,
    }));

    // Loan status breakdown
    const loanStatusData = await Loan.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    const loanStatusChart = loanStatusData.map((l) => ({
      status: l._id,
      value: l.count,
    }));

    res.json({
      stats: {
        users: usersCount,
        transactions: transactionsCount,
        loans: loansCount,
        payments: paymentsCount,
        agents: agentsCount,
      },
      recentTransactions,
      transactionChart,
      loanStatusChart,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
