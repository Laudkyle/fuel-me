const express = require("express");
const { authenticateUser } = require("../middlewares/auth");

const router = express.Router();
const PaymentController = require("../controllers/paymentController");

// Create a new payment
router.post("/", authenticateUser, PaymentController.createPayment);

// Get all payments
router.get("/", authenticateUser, PaymentController.getAllPayments);

// Get a specific payment by UUID
router.get(
  "/:payment_uuid",
  authenticateUser,
  PaymentController.getPaymentByUUID
);
router.get("/user/:user_uuid", authenticateUser,PaymentController.getUserPayments);
// Update a payment
router.put("/:payment_uuid", authenticateUser, PaymentController.updatePayment);

// Delete a payment
router.delete(
  "/:payment_uuid",
  authenticateUser,
  PaymentController.deletePayment
);

module.exports = router;
