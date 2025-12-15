const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middlewares/auth');

const RepaymentScheduleController = require('../controllers/repaymentScheduleController');

// Create a new repayment schedule from billing cycle
router.post('/from-cycle', authenticateUser, RepaymentScheduleController.createRepaymentScheduleFromCycle);

// Get all repayment schedules (admin view)
router.get('/', authenticateUser, RepaymentScheduleController.getAllRepaymentSchedules);

// Get repayment schedules for a specific user
router.get('/user/:user_uuid', authenticateUser, RepaymentScheduleController.getUserRepaymentSchedules);

// Get a specific repayment schedule by UUID
router.get('/:repayment_schedule_uuid', authenticateUser, RepaymentScheduleController.getRepaymentScheduleByUUID);

// Update repayment schedule status after payment
router.put('/:repayment_schedule_uuid/status', authenticateUser, RepaymentScheduleController.updateRepaymentScheduleStatus);

// Delete a repayment schedule
router.delete('/:repayment_schedule_uuid', authenticateUser, RepaymentScheduleController.deleteRepaymentSchedule);

module.exports = router;