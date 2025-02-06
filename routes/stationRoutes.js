const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middlewares/auth');

const StationController = require('../controllers/stationController');

// Create a new station
router.post('/', authenticateUser, StationController.createStation);

// Get all stations
router.get('/', authenticateUser, StationController.getAllStations);

// Get a specific station by UUID
router.get('/:station_uuid', authenticateUser, StationController.getStationByUUID);

// Update a station
router.put('/:station_uuid', authenticateUser, StationController.updateStation);

// Delete a station
router.delete('/:station_uuid', authenticateUser, StationController.deleteStation);

module.exports = router;
