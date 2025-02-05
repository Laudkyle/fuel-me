const {Car,User} = require('../models');

// Create a new car
exports.createCar = async (req, res) => {
  try {
    const { user_uuid, car_uuid, car_model, car_number, fuel_type, picture } = req.body;

    // Ensure the user exists
    const user = await User.findOne({ user_uuid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newCar = new Car({
      user_uuid,
      car_uuid,
      car_model,
      car_number,
      fuel_type,
      picture,
    });

    await newCar.save();
    res.status(201).json({ message: 'Car created successfully', car: newCar });
  } catch (error) {
    res.status(500).json({ message: 'Error creating car', error: error.message });
  }
};

// Get all cars
exports.getAllCars = async (req, res) => {
  try {
    const cars = await Car.find();
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cars', error: error.message });
  }
};

// Get a single car by car_uuid
exports.getCarById = async (req, res) => {
  try {
    const { car_uuid } = req.params;
    const car = await Car.findOne({ car_uuid });

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.status(200).json(car);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching car', error: error.message });
  }
};

// Update a car by car_uuid
exports.updateCar = async (req, res) => {
  try {
    const { car_uuid } = req.params;
    const updatedData = req.body;

    const updatedCar = await Car.findOneAndUpdate(
      { car_uuid },
      updatedData,
      { new: true }
    );

    if (!updatedCar) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.status(200).json({ message: 'Car updated successfully', car: updatedCar });
  } catch (error) {
    res.status(500).json({ message: 'Error updating car', error: error.message });
  }
};

// Delete a car by car_uuid
exports.deleteCar = async (req, res) => {
  try {
    const { car_uuid } = req.params;

    const deletedCar = await Car.findOneAndDelete({ car_uuid });

    if (!deletedCar) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.status(200).json({ message: 'Car deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting car', error: error.message });
  }
};
