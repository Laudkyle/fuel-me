const express = require('express');
const { authenticateUser } = require('../middlewares/auth');

const router = express.Router();
const carController = require('../controllers/carController');

// Create a new car
router.post('/create', carController.createCar);

// Get all cars
router.get('/', authenticateUser, carController.getAllCars);
// Get all user cars
router.get('/user/:user_uuid', authenticateUser, carController.getUserCars);

// Get a single car by car_uuid
router.get('/:car_uuid', authenticateUser, carController.getCarById);

// Update a car by car_uuid
router.put('/:car_uuid', authenticateUser, carController.updateCar);

// Delete a car by car_uuid
router.delete('/:car_uuid', authenticateUser, carController.deleteCar);

module.exports = router;
