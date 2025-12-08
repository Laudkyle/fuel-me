const { v4: uuidv4 } = require('uuid');
const { Request, Car } = require('../models');

// Create a new request
exports.createRequest = async (req, res) => {
  try {
    const { user_uuid, fuel, fuel_type, amount, station_uuid, car_uuid, agent_uuid, status } = req.body;
    const newRequest = new Request({
      request_uuid: uuidv4(), 
      user_uuid,
      fuel,
      fuel_type,
      amount,
      station_uuid,
      car_uuid,
      agent_uuid,
      status,
    });
    await newRequest.save();
    res.status(201).json({ message: 'Request created successfully', request: newRequest });
  } catch (error) {
    res.status(500).json({ message: 'Error creating request', error: error.message });
  }
};

// Get all requests for a specific user
exports.getRequestsUser = async (req, res) => {
  try {
    const { user_uuid } = req.params;
    const userRequests = await Request.find({ user_uuid });
    
    if (userRequests.length === 0) {
      return res.status(404).json({ message: 'No requests found for this user' });
    }

    // Populate car details including picture
    const requestsWithCarDetails = await Promise.all(
      userRequests.map(async (request) => {
        const car = await Car.findOne({ car_uuid: request.car_uuid }); // FIXED: use car_uuid
        return {
          ...request.toObject(),
          car_picture: car?.picture || null,
          car_model: car?.car_model || null,
          car_number: car?.car_number || null,
        };
      })
    );

    res.status(200).json(requestsWithCarDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user requests', error: error.message });
  }
};

// Get all requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find();
    
    // Populate car details including picture for all requests
    const requestsWithCarDetails = await Promise.all(
      requests.map(async (request) => {
        const car = await Car.findOne({ car_uuid: request.car_uuid }); // FIXED: use car_uuid
        return {
          ...request.toObject(),
          car_picture: car?.picture || null,
          car_model: car?.car_model || null,
          car_number: car?.car_number || null,
        };
      })
    );

    res.status(200).json(requestsWithCarDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving requests', error: error.message });
  }
};

// Get a request by UUID
exports.getRequestByUUID = async (req, res) => {
  try {
    const request = await Request.findOne({ request_uuid: req.params.request_uuid });
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Get car details
    const car = await Car.findOne({ car_uuid: request.car_uuid }); // FIXED: use car_uuid
    
    const requestWithCarDetails = {
      ...request.toObject(),
      car_picture: car?.picture || null,
      car_model: car?.car_model || null,
      car_number: car?.car_number || null,
    };

    res.status(200).json(requestWithCarDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving request', error: error.message });
  }
};

// Update a request
exports.updateRequest = async (req, res) => {
  try {
    const { fuel, fuel_type, amount, status, station_uuid, car_uuid, agent_uuid } = req.body;
    const updatedRequest = await Request.findOneAndUpdate(
      { request_uuid: req.params.request_uuid },
      { fuel, fuel_type, amount, status, station_uuid, car_uuid, agent_uuid, date_modified: Date.now() },
      { new: true }
    );
    
    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Get car details
    const car = await Car.findOne({ car_uuid: updatedRequest.car_uuid }); // FIXED: use car_uuid and updatedRequest
    
    const requestWithCarDetails = {
      ...updatedRequest.toObject(),
      car_picture: car?.picture || null,
      car_model: car?.car_model || null,
      car_number: car?.car_number || null,
    };

    res.status(200).json({ message: 'Request updated successfully', request: requestWithCarDetails });
  } catch (error) {
    res.status(500).json({ message: 'Error updating request', error: error.message });
  }
};

// Delete a request
exports.deleteRequest = async (req, res) => {
  try {
    const deletedRequest = await Request.findOneAndDelete({ request_uuid: req.params.request_uuid });
    
    if (!deletedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    res.status(200).json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting request', error: error.message });
  }
};