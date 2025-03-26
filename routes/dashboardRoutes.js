const express = require("express");
const router = express.Router();
const { User, Transaction, Loan, Payment, Agent } = require("../models");

// Dashboard API
router.get("/", async (req, res) => {
  try {
    // Total Counts
    const usersCount = await User.countDocuments();
    const transactionsCount = await Transaction.countDocuments();
    const loansCount = await Loan.countDocuments();
    const paymentsCount = await Payment.countDocuments();
    const agentsCount = await Agent.countDocuments();

    // Recent Transactions
    const recentTransactions = await Transaction.find().sort({ datetime: -1 }).limit(5);

    // Transactions by Month
    const transactionsByMonth = await Transaction.aggregate([
      {
        $group: {
          _id: { $month: "$datetime" },
          totalAmount: { $sum: "$amount" },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const transactionChart = transactionsByMonth.map((t) => ({
      month: `Month ${t._id}`,
      transactions: t.transactions,
      totalAmount: t.totalAmount,
    }));

    // Loan Breakdown
    const loanStatusData = await Loan.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const loanStatusChart = loanStatusData.map((l) => ({
      status: l._id,
      value: l.count,
    }));

    // Payment Breakdown
    const paymentStatusData = await Payment.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const paymentChart = paymentStatusData.map((p) => ({
      status: p._id,
      value: p.count,
    }));

    // User Growth (New Users per Month)
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: { $month: "$datetime" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const userGrowthChart = userGrowth.map((u) => ({
      month: `Month ${u._id}`,
      users: u.count,
    }));

    // Top Performing Agents (by loan approvals)
    const topAgents = await Loan.aggregate([
      {
        $group: {
          _id: "$agent_uuid",
          loansApproved: { $sum: 1 },
        },
      },
      { $sort: { loansApproved: -1 } },
      { $limit: 5 },
    ]);

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
      paymentChart,
      userGrowthChart,
      topAgents,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
