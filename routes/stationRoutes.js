const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middlewares/auth');

const StationController = require('../controllers/stationController');

// Get fuel prices (public endpoints - no authentication required)
router.get('/ppl/petrol', StationController.getPetrolPrice);
router.get('/ppl/petrol/:code', StationController.getPetrolPrice);
router.get('/ppl/diesel', StationController.getDieselPrice);
router.get('/ppl/diesel/:code', StationController.getDieselPrice);
router.get('/fuel-prices', StationController.getFuelPrices);
router.get('/fuel-prices/:code', StationController.getFuelPrices);

// Create a new station (requires authentication)
router.post('/', authenticateUser, StationController.createStation);

// Get all stations (requires authentication)
router.get('/', authenticateUser, StationController.getAllStations);

// Get a specific station by UUID (requires authentication)
router.get('/:station_uuid', authenticateUser, StationController.getStationByUUID);

// Get station by code (specific route)
router.get('/code/:code', authenticateUser, StationController.getStationByCode);

// Update a station (requires authentication)
router.put('/:station_uuid', authenticateUser, StationController.updateStation);

// Delete a station (requires authentication)
router.delete('/:station_uuid', authenticateUser, StationController.deleteStation);

module.exports = router;