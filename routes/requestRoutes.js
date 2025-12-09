const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middlewares/auth");

const RequestController = require("../controllers/requestController");

// Create a new request
router.post("/", authenticateUser, RequestController.createRequest);

// Get all requests
router.get("/", authenticateUser, RequestController.getAllRequests);

// Get requests by specific status (e.g., /requests/status/pending)
router.get(
  "/status/:status",
  authenticateUser,
  RequestController.getRequestsByStatus
);

// Get all requests for a specific user
router.get(
  "/user/:user_uuid",
  authenticateUser,
  RequestController.getRequestsUser
);
// In requestRoutes.js
router.put(
  "/:request_uuid/approve",
  authenticateUser,
  RequestController.approveRequest
);
router.put(
  "/:request_uuid/decline",
  authenticateUser,
  RequestController.declineRequest
);
// Get a specific request by UUID
router.get(
  "/:request_uuid",
  authenticateUser,
  RequestController.getRequestByUUID
);

// Update a request
router.put("/:request_uuid", authenticateUser, RequestController.updateRequest);

// Delete a request
router.delete(
  "/:request_uuid",
  authenticateUser,
  RequestController.deleteRequest
);

module.exports = router;
