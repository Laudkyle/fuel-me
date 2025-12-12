const { v4: uuidv4 } = require('uuid');
const { Request, Car, Loan, RepaymentSchedule, Station } = require('../models');

// Create a new request
exports.createRequest = async (req, res) => {
  try {
    const { user_uuid, fuel, fuel_type, amount, station_uuid, car_uuid } = req.body;
    
    // Validate that all required fields are present
    if (!user_uuid || !fuel || !fuel_type || !amount || !station_uuid || !car_uuid) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const newRequest = new Request({
      request_uuid: uuidv4(), 
      user_uuid,
      fuel,
      fuel_type,
      amount,
      station_uuid,
      car_uuid,
      status: 'Pending',
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
    const requestsWithDetails = await Promise.all(
      userRequests.map(async (request) => {
        const car = await Car.findOne({ car_uuid: request.car_uuid });
        const station = await Station.findOne({ station_uuid: request.station_uuid });
        const loan = request.status === 'Approved' 
          ? await Loan.findOne({ user_uuid: request.user_uuid, car_uuid: request.car_uuid })
          : null;
        const repaymentSchedule = loan ? await RepaymentSchedule.findOne({ loan_uuid: loan.loan_uuid }) : null;
        
        return {
          ...request.toObject(),
          car_picture: car?.picture || null,
          car_model: car?.car_model || null,
          car_number: car?.car_number || null,
          station_name: station?.name || null,
          station_location: station?.location || null,
          loan: loan ? {
            loan_uuid: loan.loan_uuid,
            amount: loan.amount,
            balance: loan.balance,
            status: loan.status
          } : null,
          repayment_schedule: repaymentSchedule ? {
            repayment_schedule_uuid: repaymentSchedule.repayment_schedule_uuid,
            due_date: repaymentSchedule.due_date,
            repayment_frequency: repaymentSchedule.repayment_frequency,
            total_amount_due: repaymentSchedule.total_amount_due,
            status: repaymentSchedule.status
          } : null
        };
      })
    );

    res.status(200).json(requestsWithDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user requests', error: error.message });
  }
};

// Get requests by specific status
exports.getRequestsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    if (!status) {
      return res.status(400).json({ message: 'Status parameter is required' });
    }

    const requests = await Request.find({ status });
    
    if (requests.length === 0) {
      return res.status(404).json({ message: `No requests found with status: ${status}` });
    }

    // Populate car details including picture
    const requestsWithDetails = await Promise.all(
      requests.map(async (request) => {
        const car = await Car.findOne({ car_uuid: request.car_uuid });
        const station = await Station.findOne({ station_uuid: request.station_uuid });
        const loan = request.status === 'Approved' 
          ? await Loan.findOne({ user_uuid: request.user_uuid, car_uuid: request.car_uuid })
          : null;
        const repaymentSchedule = loan ? await RepaymentSchedule.findOne({ loan_uuid: loan.loan_uuid }) : null;
        
        return {
          ...request.toObject(),
          car_picture: car?.picture || null,
          car_model: car?.car_model || null,
          car_number: car?.car_number || null,
          station_name: station?.name || null,
          station_location: station?.location || null,
          loan: loan ? {
            loan_uuid: loan.loan_uuid,
            amount: loan.amount,
            balance: loan.balance,
            status: loan.status
          } : null,
          repayment_schedule: repaymentSchedule ? {
            repayment_schedule_uuid: repaymentSchedule.repayment_schedule_uuid,
            due_date: repaymentSchedule.due_date,
            repayment_frequency: repaymentSchedule.repayment_frequency,
            total_amount_due: repaymentSchedule.total_amount_due,
            status: repaymentSchedule.status
          } : null
        };
      })
    );

    res.status(200).json(requestsWithDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests by status', error: error.message });
  }
};
// Get requests for a specific station with status filter
exports.getRequestsByStationAndStatus = async (req, res) => {
  try {
    const { station_uuid, status } = req.params;
    
    if (!station_uuid) {
      return res.status(400).json({ message: 'Station UUID parameter is required' });
    }

    // Build query
    const query = { station_uuid };
    if (status && status !== 'all') {
      query.status = status;
    }

    const requests = await Request.find(query);
    
    if (requests.length === 0) {
      return res.status(404).json({ 
        message: status 
          ? `No ${status} requests found for station: ${station_uuid}`
          : `No requests found for station: ${station_uuid}`,
        requests: []
      });
    }

    // Populate details (same as above)
    const requestsWithDetails = await Promise.all(
      requests.map(async (request) => {
        const car = await Car.findOne({ car_uuid: request.car_uuid });
        const station = await Station.findOne({ station_uuid: request.station_uuid });
        const loan = request.status === 'Approved' 
          ? await Loan.findOne({ user_uuid: request.user_uuid, car_uuid: request.car_uuid })
          : null;
        const repaymentSchedule = loan ? await RepaymentSchedule.findOne({ loan_uuid: loan.loan_uuid }) : null;
        
        return {
          ...request.toObject(),
          car_picture: car?.picture || null,
          car_model: car?.car_model || null,
          car_number: car?.car_number || null,
          station_name: station?.name || null,
          station_location: station?.location || null,
          station_latitude: station?.latitude || null,
          station_longitude: station?.longitude || null,
          station_code: station?.code || null,
          loan: loan ? {
            loan_uuid: loan.loan_uuid,
            amount: loan.amount,
            balance: loan.balance,
            status: loan.status
          } : null,
          repayment_schedule: repaymentSchedule ? {
            repayment_schedule_uuid: repaymentSchedule.repayment_schedule_uuid,
            due_date: repaymentSchedule.due_date,
            repayment_frequency: repaymentSchedule.repayment_frequency,
            total_amount_due: repaymentSchedule.total_amount_due,
            status: repaymentSchedule.status
          } : null
        };
      })
    );

    res.status(200).json({
      station_uuid,
      status_filter: status || 'all',
      total_requests: requests.length,
      requests: requestsWithDetails
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching requests by station and status', 
      error: error.message 
    });
  }
};
// Get all requests for a specific station
exports.getRequestsByStation = async (req, res) => {
  try {
    const { station_uuid } = req.params;
    
    if (!station_uuid) {
      return res.status(400).json({ message: 'Station UUID parameter is required' });
    }

    // Find all requests for the specified station
    const requests = await Request.find({ station_uuid });
    
    if (requests.length === 0) {
      return res.status(404).json({ 
        message: `No requests found for station: ${station_uuid}`,
        requests: []
      });
    }

    // Populate car, station, loan, and repayment schedule details
    const requestsWithDetails = await Promise.all(
      requests.map(async (request) => {
        const car = await Car.findOne({ car_uuid: request.car_uuid });
        const station = await Station.findOne({ station_uuid: request.station_uuid });
        const loan = request.status === 'Approved' 
          ? await Loan.findOne({ user_uuid: request.user_uuid, car_uuid: request.car_uuid })
          : null;
        const repaymentSchedule = loan ? await RepaymentSchedule.findOne({ loan_uuid: loan.loan_uuid }) : null;
        
        return {
          ...request.toObject(),
          car_picture: car?.picture || null,
          car_model: car?.car_model || null,
          car_number: car?.car_number || null,
          station_name: station?.name || null,
          station_location: station?.location || null,
          station_latitude: station?.latitude || null,
          station_longitude: station?.longitude || null,
          station_code: station?.code || null,
          loan: loan ? {
            loan_uuid: loan.loan_uuid,
            amount: loan.amount,
            balance: loan.balance,
            status: loan.status
          } : null,
          repayment_schedule: repaymentSchedule ? {
            repayment_schedule_uuid: repaymentSchedule.repayment_schedule_uuid,
            due_date: repaymentSchedule.due_date,
            repayment_frequency: repaymentSchedule.repayment_frequency,
            total_amount_due: repaymentSchedule.total_amount_due,
            status: repaymentSchedule.status
          } : null
        };
      })
    );

    // Get station details for summary
    const stationDetails = await Station.findOne({ station_uuid });
    
    const response = {
      station_details: {
        station_uuid: stationDetails?.station_uuid || station_uuid,
        name: stationDetails?.name || null,
        location: stationDetails?.location || null,
        code: stationDetails?.code || null,
        ppl_diesel: stationDetails?.ppl_diesel || null,
        ppl_petrol: stationDetails?.ppl_petrol || null,
      },
      total_requests: requests.length,
      requests_by_status: {
        pending: requests.filter(r => r.status === 'Pending').length,
        approved: requests.filter(r => r.status === 'Approved').length,
        declined: requests.filter(r => r.status === 'Declined').length,
      },
      requests: requestsWithDetails
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching requests by station', 
      error: error.message 
    });
  }
};

// Get all requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find();
    
    // Populate car details including picture for all requests
    const requestsWithDetails = await Promise.all(
      requests.map(async (request) => {
        const car = await Car.findOne({ car_uuid: request.car_uuid });
        const station = await Station.findOne({ station_uuid: request.station_uuid });
        const loan = request.status === 'Approved' 
          ? await Loan.findOne({ user_uuid: request.user_uuid, car_uuid: request.car_uuid })
          : null;
        const repaymentSchedule = loan ? await RepaymentSchedule.findOne({ loan_uuid: loan.loan_uuid }) : null;
        
        return {
          ...request.toObject(),
          car_picture: car?.picture || null,
          car_model: car?.car_model || null,
          car_number: car?.car_number || null,
          station_name: station?.name || null,
          station_location: station?.location || null,
          loan: loan ? {
            loan_uuid: loan.loan_uuid,
            amount: loan.amount,
            balance: loan.balance,
            status: loan.status
          } : null,
          repayment_schedule: repaymentSchedule ? {
            repayment_schedule_uuid: repaymentSchedule.repayment_schedule_uuid,
            due_date: repaymentSchedule.due_date,
            repayment_frequency: repaymentSchedule.repayment_frequency,
            total_amount_due: repaymentSchedule.total_amount_due,
            status: repaymentSchedule.status
          } : null
        };
      })
    );

    res.status(200).json(requestsWithDetails);
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
    const car = await Car.findOne({ car_uuid: request.car_uuid });
    const station = await Station.findOne({ station_uuid: request.station_uuid });
    
    // Check if there's a corresponding loan for approved requests
    let loan = null;
    let repaymentSchedule = null;
    
    if (request.status === 'Approved') {
      loan = await Loan.findOne({ 
        user_uuid: request.user_uuid, 
        car_uuid: request.car_uuid 
      });
      
      if (loan) {
        repaymentSchedule = await RepaymentSchedule.findOne({ loan_uuid: loan.loan_uuid });
      }
    }
    
    const requestWithDetails = {
      ...request.toObject(),
      car_picture: car?.picture || null,
      car_model: car?.car_model || null,
      car_number: car?.car_number || null,
      station_name: station?.name || null,
      station_location: station?.location || null,
      station_latitude: station?.latitude || null,
      station_longitude: station?.longitude || null,
      loan: loan ? {
        loan_uuid: loan.loan_uuid,
        amount: loan.amount,
        balance: loan.balance,
        status: loan.status
      } : null,
      repayment_schedule: repaymentSchedule ? {
        repayment_schedule_uuid: repaymentSchedule.repayment_schedule_uuid,
        due_date: repaymentSchedule.due_date,
        repayment_frequency: repaymentSchedule.repayment_frequency,
        total_amount_due: repaymentSchedule.total_amount_due,
        status: repaymentSchedule.status
      } : null
    };

    res.status(200).json(requestWithDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving request', error: error.message });
  }
};

// Update a request
exports.updateRequest = async (req, res) => {
  try {
    const { fuel, fuel_type, amount, status, station_uuid, car_uuid, agent_uuid } = req.body;
    
    const request = await Request.findOne({ request_uuid: req.params.request_uuid });
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    const updatedRequest = await Request.findOneAndUpdate(
      { request_uuid: req.params.request_uuid },
      { fuel, fuel_type, amount, status, station_uuid, car_uuid, agent_uuid, date_modified: Date.now() },
      { new: true }
    );
    
    // If status is being updated to "Approved" and wasn't already approved
    if (status === 'Approved' && request.status !== 'Approved') {
      // Check if loan already exists for this request
      const existingLoan = await Loan.findOne({ 
        user_uuid: request.user_uuid, 
        car_uuid: car_uuid || request.car_uuid 
      });
      
      if (!existingLoan) {
        // Create corresponding loan
        const newLoan = new Loan({
          loan_uuid: uuidv4(),
          user_uuid: request.user_uuid,
          amount: amount || request.amount,
          balance: amount || request.amount,
          agent_uuid: agent_uuid || null,
          car_uuid: car_uuid || request.car_uuid,
          status: 'active'
        });
        
        await newLoan.save();
        
        // Create repayment schedule with default 'anytime' frequency
        const repaymentSchedule = new RepaymentSchedule({
          repayment_schedule_uuid: uuidv4(),
          loan_uuid: newLoan.loan_uuid,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          repayment_frequency: 'anytime',
          total_amount_due: amount || request.amount,
          status: 'pending'
        });
        
        await repaymentSchedule.save();
      }
    }

    // Get car details
    const car = await Car.findOne({ car_uuid: updatedRequest.car_uuid });
    const station = await Station.findOne({ station_uuid: updatedRequest.station_uuid });
    
    const requestWithDetails = {
      ...updatedRequest.toObject(),
      car_picture: car?.picture || null,
      car_model: car?.car_model || null,
      car_number: car?.car_number || null,
      station_name: station?.name || null,
      station_location: station?.location || null,
    };

    res.status(200).json({ 
      message: 'Request updated successfully', 
      request: requestWithDetails 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating request', error: error.message });
  }
};

// Set request status to Approved - THIS IS THE KEY FUNCTION
exports.approveRequest = async (req, res) => {
  try {
    const { request_uuid } = req.params;
    const { agent_uuid } = req.body; // Optional: agent who approved it
    
    // Find the request first
    const request = await Request.findOne({ request_uuid });
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Check if request is already approved
    if (request.status === 'Approved') {
      return res.status(400).json({ message: 'Request is already approved' });
    }
    
    // Update request status to Approved
    const updatedRequest = await Request.findOneAndUpdate(
      { request_uuid },
      { 
        status: 'Approved',
        agent_uuid: agent_uuid || null,
        date_modified: Date.now()
      },
      { new: true }
    );
    
    // Check if loan already exists for this user and car combination
    const existingLoan = await Loan.findOne({ 
      user_uuid: request.user_uuid, 
      car_uuid: request.car_uuid 
    });
    
    let newLoan = null;
    let repaymentSchedule = null;
    
    // Create loan only if it doesn't already exist
    if (!existingLoan) {
      // Create corresponding loan
      newLoan = new Loan({
        loan_uuid: uuidv4(),
        user_uuid: request.user_uuid,
        amount: request.amount,
        balance: request.amount, // Initial balance equals amount
        agent_uuid: agent_uuid || null,
        car_uuid: request.car_uuid,
        status: 'active'
      });
      
      await newLoan.save();
      
      // Create repayment schedule with default 'anytime' frequency
      repaymentSchedule = new RepaymentSchedule({
        repayment_schedule_uuid: uuidv4(),
        loan_uuid: newLoan.loan_uuid,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default: 30 days from now
        repayment_frequency: 'anytime', // Default as requested
        total_amount_due: request.amount,
        status: 'pending'
      });
      
      await repaymentSchedule.save();
    } else {
      // Use existing loan
      newLoan = existingLoan;
      repaymentSchedule = await RepaymentSchedule.findOne({ loan_uuid: existingLoan.loan_uuid });
    }
    
    // Get car and station details
    const car = await Car.findOne({ car_uuid: request.car_uuid });
    const station = await Station.findOne({ station_uuid: request.station_uuid });
    
    const responseData = {
      ...updatedRequest.toObject(),
      car_picture: car?.picture || null,
      car_model: car?.car_model || null,
      car_number: car?.car_number || null,
      station_name: station?.name || null,
      station_location: station?.location || null,
      loan_created: !existingLoan,
      loan: newLoan ? {
        loan_uuid: newLoan.loan_uuid,
        amount: newLoan.amount,
        balance: newLoan.balance,
        status: newLoan.status
      } : null,
      repayment_schedule: repaymentSchedule ? {
        repayment_schedule_uuid: repaymentSchedule.repayment_schedule_uuid,
        due_date: repaymentSchedule.due_date,
        repayment_frequency: repaymentSchedule.repayment_frequency,
        total_amount_due: repaymentSchedule.total_amount_due,
        status: repaymentSchedule.status
      } : null
    };

    res.status(200).json({ 
      message: existingLoan ? 'Request approved (existing loan used)' : 'Request approved successfully and loan created',
      data: responseData 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error approving request', error: error.message });
  }
};

// Set request status to Declined
exports.declineRequest = async (req, res) => {
  try {
    const { request_uuid } = req.params;
    const { agent_uuid, decline_reason } = req.body; 
    
    const request = await Request.findOne({ request_uuid });
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Check if request is already declined
    if (request.status === 'Declined') {
      return res.status(400).json({ message: 'Request is already declined' });
    }
    
    const updatedRequest = await Request.findOneAndUpdate(
      { request_uuid },
      { 
        status: 'Declined',
        agent_uuid: agent_uuid || null,
        decline_reason: decline_reason || null,
        date_modified: Date.now()
      },
      { new: true }
    );

    // Get car and station details
    const car = await Car.findOne({ car_uuid: updatedRequest.car_uuid });
    const station = await Station.findOne({ station_uuid: updatedRequest.station_uuid });
    
    const requestWithDetails = {
      ...updatedRequest.toObject(),
      car_picture: car?.picture || null,
      car_model: car?.car_model || null,
      car_number: car?.car_number || null,
      station_name: station?.name || null,
      station_location: station?.location || null,
    };

    res.status(200).json({ 
      message: 'Request declined successfully', 
      request: requestWithDetails 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error declining request', error: error.message });
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