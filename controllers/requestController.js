const { v4: uuidv4 } = require('uuid');
const { Request } = require('../models');

// Create a new request
exports.createRequest = async (req, res) => {
  try {
    const { user_uuid, fuel,fuel_type, amount, station_uuid, car_uuid, agent_uuid, status } = req.body;

    const newRequest = new Request({
      request_uuid: uuidv4(), // Generate UUID automatically
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
exports.getUserRequests = async (req, res) => {
  try {
    const { user_uuid } = req.params;

    const userRequests = await Request.find({ user_uuid });

    if (userRequests.length === 0) {
      return res.status(404).json({ message: 'No requests found for this user' });
    }

    res.status(200).json(userRequests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user requests', error: error.message });
  }
};
// Get all requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find();
    res.status(200).json(requests);
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
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving request', error: error.message });
  }
};

// Update a request
exports.updateRequest = async (req, res) => {
  try {
    const { fuel,fuel_type, amount, status, station_uuid, car_uuid, agent_uuid } = req.body;

    const updatedRequest = await Request.findOneAndUpdate(
      { request_uuid: req.params.request_uuid },
      { fuel,fuel_type, amount, status, station_uuid, car_uuid, agent_uuid, date_modified: Date.now() },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.status(200).json({ message: 'Request updated successfully', request: updatedRequest });
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
