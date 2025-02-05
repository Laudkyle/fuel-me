const express = require('express');
const router = express.Router();
const RepaymentScheduleController = require('../controllers/repaymentScheduleController');

// Create a new repayment schedule
router.post('/', authenticateUser, RepaymentScheduleController.createRepaymentSchedule);

// Get all repayment schedules
router.get('/', authenticateUser, RepaymentScheduleController.getAllRepaymentSchedules);

// Get a specific repayment schedule by UUID
router.get('/:repayment_schedule_uuid', authenticateUser, RepaymentScheduleController.getRepaymentScheduleByUUID);

// Update a repayment schedule
router.put('/:repayment_schedule_uuid', authenticateUser, RepaymentScheduleController.updateRepaymentSchedule);

// Delete a repayment schedule
router.delete('/:repayment_schedule_uuid', authenticateUser, RepaymentScheduleController.deleteRepaymentSchedule);

module.exports = router;
