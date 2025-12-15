const { v4: uuidv4 } = require('uuid');
const { Request, Car, Loan, RepaymentSchedule, Station, Profile } = require('../models'); // Added Profile

// Helper function to check profile limit
const checkProfileLimit = async (user_uuid, car_uuid, requestAmount) => {
  try {
    // Get user profile
    const profile = await Profile.findOne({ user_uuid });
    
    if (!profile || !profile.limit) {
      // If no profile or limit set, allow the request
      return { 
        allowed: true, 
        currentTotal: 0, 
        limit: 0,
        profileExists: !!profile 
      };
    }
    
    // Get all active loans for this user-car combination
    const activeLoans = await Loan.find({ 
      user_uuid, 
      car_uuid,
      status: 'active' 
    });
    
    // Calculate total of current active loans
    const currentTotal = activeLoans.reduce((sum, loan) => sum + loan.balance, 0);
    
    // Check if adding new request would exceed limit
    const newTotal = currentTotal + requestAmount;
    
    return {
      allowed: newTotal <= profile.limit,
      currentTotal,
      limit: profile.limit,
      newTotal,
      activeLoansCount: activeLoans.length,
      profileExists: true
    };
  } catch (error) {
    console.error('Error checking profile limit:', error);
    // In case of error, allow the request (fail-open approach)
    return { 
      allowed: true, 
      error: error.message,
      profileExists: false 
    };
  }
};

// Create a new request
exports.createRequest = async (req, res) => {
  try {
    const { user_uuid, fuel, fuel_type, amount, station_uuid, car_uuid } = req.body;
    
    // Validate that all required fields are present
    if (!user_uuid || !fuel || !fuel_type || !amount || !station_uuid || !car_uuid) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Validate amount is positive number
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }
    
    // Check profile limit before creating request
    const limitCheck = await checkProfileLimit(user_uuid, car_uuid, amount);
    
    if (!limitCheck.allowed) {
      return res.status(400).json({ 
        message: `Request would exceed credit limit. Current: ${limitCheck.currentTotal}, Limit: ${limitCheck.limit}, Request: ${amount}`,
        details: limitCheck
      });
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
    res.status(201).json({ 
      message: 'Request created successfully', 
      request: newRequest,
      limit_check: limitCheck
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating request', error: error.message });
  }
};

// Get all requests for a specific user
exports.getRequestsUser = async (req, res) => {
  try {
    const { user_uuid } = req.params;
    const userRequests = await Request.find({ user_uuid }).sort({ date_created: -1 });
    
    if (userRequests.length == 0) {
      return res.status(404).json({ message: 'No requests found for this user' });
    }

    // Populate car details including picture
    const requestsWithDetails = await Promise.all(
      userRequests.map(async (request) => {
        const car = await Car.findOne({ car_uuid: request.car_uuid });
        const station = await Station.findOne({ station_uuid: request.station_uuid });
        const loan = request.status == 'Approved' 
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

    const requests = await Request.find({ status }).sort({ date_created: -1 });
    
    if (requests.length == 0) {
      return res.status(404).json({ message: `No requests found with status: ${status}` });
    }

    // Populate car details including picture
    const requestsWithDetails = await Promise.all(
      requests.map(async (request) => {
        const car = await Car.findOne({ car_uuid: request.car_uuid });
        const station = await Station.findOne({ station_uuid: request.station_uuid });
        const loan = request.status == 'Approved' 
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

    const requests = await Request.find(query).sort({ date_created: -1 });
    
    if (requests.length == 0) {
      return res.status(404).json({ 
        message: status 
          ? `No ${status} requests found for station: ${station_uuid}`
          : `No requests found for station: ${station_uuid}`,
        requests: []
      });
    }

    // Populate details
    const requestsWithDetails = await Promise.all(
      requests.map(async (request) => {
        const car = await Car.findOne({ car_uuid: request.car_uuid });
        const station = await Station.findOne({ station_uuid: request.station_uuid });
        const loan = request.status == 'Approved' 
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
    const requests = await Request.find({ station_uuid }).sort({ date_created: -1 });
    
    if (requests.length == 0) {
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
        const loan = request.status == 'Approved' 
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
        pending: requests.filter(r => r.status == 'Pending').length,
        approved: requests.filter(r => r.status == 'Approved').length,
        declined: requests.filter(r => r.status == 'Declined').length,
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
    const requests = await Request.find().sort({ date_created: -1 });
    
    // Populate car details including picture for all requests
    const requestsWithDetails = await Promise.all(
      requests.map(async (request) => {
        const car = await Car.findOne({ car_uuid: request.car_uuid });
        const station = await Station.findOne({ station_uuid: request.station_uuid });
        const loan = request.status == 'Approved' 
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
    
    if (request.status == 'Approved') {
      loan = await Loan.findOne({ 
        user_uuid: request.user_uuid, 
        car_uuid: request.car_uuid 
      });
      
      if (loan) {
        repaymentSchedule = await RepaymentSchedule.findOne({ loan_uuid: loan.loan_uuid });
      }
    }
    
    // Get profile limit information
    const profile = await Profile.findOne({ user_uuid: request.user_uuid });
    const activeLoans = await Loan.find({ 
      user_uuid: request.user_uuid, 
      car_uuid: request.car_uuid,
      status: 'active' 
    });
    const currentTotal = activeLoans.reduce((sum, loan) => sum + loan.balance, 0);
    
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
      } : null,
      credit_info: {
        profile_limit: profile?.limit || 0,
        current_active_loans_total: currentTotal,
        active_loans_count: activeLoans.length,
        remaining_credit: profile?.limit ? profile.limit - currentTotal : 0
      }
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
    
    // Check profile limit if amount is being increased or status changed to Approved
    if ((amount && amount > request.amount) || status == 'Approved') {
      const targetCarUuid = car_uuid || request.car_uuid;
      const targetAmount = amount || request.amount;
      
      const limitCheck = await checkProfileLimit(request.user_uuid, targetCarUuid, targetAmount);
      
      if (!limitCheck.allowed) {
        return res.status(400).json({ 
          message: `Action would exceed credit limit. Current: ${limitCheck.currentTotal}, Limit: ${limitCheck.limit}, Request: ${targetAmount}`,
          details: limitCheck
        });
      }
    }
    
    // If status is being updated to "Approved" and wasn't already approved
    if (status == 'Approved' && request.status != 'Approved') {
      // Check if an active loan already exists for this user and car combination
      const targetCarUuid = car_uuid || request.car_uuid;
      const existingActiveLoan = await Loan.findOne({ 
        user_uuid: request.user_uuid, 
        car_uuid: targetCarUuid,
        status: 'active'
      });
      
      // Note: We allow multiple loans per user-car, so we don't block here
      // Only check was for limit (already done above)
    }
    
    // Proceed with the update
    const updatedRequest = await Request.findOneAndUpdate(
      { request_uuid: req.params.request_uuid },
      { fuel, fuel_type, amount, status, station_uuid, car_uuid, agent_uuid, date_modified: Date.now() },
      { new: true }
    );
    
    // If status is now "Approved" and wasn't already approved before
    if (status == 'Approved' && request.status != 'Approved') {
      // Check if loan already exists for this request
      const targetCarUuid = car_uuid || request.car_uuid;
      const targetAmount = amount || request.amount;
      const existingLoan = await Loan.findOne({ 
        user_uuid: request.user_uuid, 
        car_uuid: targetCarUuid 
      });
      
      // Create new loan (multiple loans allowed per user-car)
      const newLoan = new Loan({
        loan_uuid: uuidv4(),
        user_uuid: request.user_uuid,
        amount: targetAmount,
        balance: targetAmount,
        agent_uuid: agent_uuid || null,
        car_uuid: targetCarUuid,
        status: 'active'
      });
      
      await newLoan.save();
      
      // Create repayment schedule with default 'anytime' frequency
      const repaymentSchedule = new RepaymentSchedule({
        repayment_schedule_uuid: uuidv4(),
        loan_uuid: newLoan.loan_uuid,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        repayment_frequency: 'anytime',
        total_amount_due: targetAmount,
        status: 'pending'
      });
      
      await repaymentSchedule.save();
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

// Set request status to Approved
exports.approveRequest = async (req, res) => {
  try {
    const { request_uuid } = req.params;
    const { agent_uuid } = req.body;
    
    // Find the request first
    const request = await Request.findOne({ request_uuid });
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Check if request is already approved or declined
    if (request.status == 'Approved') {
      return res.status(400).json({ message: 'Request is already approved' });
    }
    
    if (request.status == 'Declined') {
      return res.status(400).json({ message: 'Request is already declined' });
    }
    
    // Check profile limit before approval
    const limitCheck = await checkProfileLimit(request.user_uuid, request.car_uuid, request.amount);
    
    // Only decline if limit would be exceeded
    if (!limitCheck.allowed) {
      // Update request status to Declined
      const declinedRequest = await Request.findOneAndUpdate(
        { request_uuid },
        { 
          status: 'Declined',
          decline_reason: `Request would exceed credit limit. Current: ${limitCheck.currentTotal}, Limit: ${limitCheck.limit}`,
          agent_uuid: agent_uuid || null,
          date_modified: Date.now()
        },
        { new: true }
      );
      
      // Get car and station details for response
      const car = await Car.findOne({ car_uuid: request.car_uuid });
      const station = await Station.findOne({ station_uuid: request.station_uuid });
      
      const responseData = {
        ...declinedRequest.toObject(),
        car_picture: car?.picture || null,
        car_model: car?.car_model || null,
        car_number: car?.car_number || null,
        station_name: station?.name || null,
        station_location: station?.location || null,
        limit_check: limitCheck
      };

      return res.status(200).json({ 
        message: 'Request declined: Would exceed credit limit',
        data: responseData 
      });
    }
    
    // If within limit, proceed with approval (multiple loans allowed)
    
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
    
    // Create new loan for this request (multiple loans allowed per user-car)
    const newLoan = new Loan({
      loan_uuid: uuidv4(),
      user_uuid: request.user_uuid,
      amount: request.amount,
      balance: request.amount,
      agent_uuid: agent_uuid || null,
      car_uuid: request.car_uuid,
      status: 'active'
    });
    
    await newLoan.save();
    
    // Create repayment schedule with default 'anytime' frequency
    const repaymentSchedule = new RepaymentSchedule({
      repayment_schedule_uuid: uuidv4(),
      loan_uuid: newLoan.loan_uuid,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      repayment_frequency: 'anytime',
      total_amount_due: request.amount,
      status: 'pending'
    });
    
    await repaymentSchedule.save();
    
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
      loan: {
        loan_uuid: newLoan.loan_uuid,
        amount: newLoan.amount,
        balance: newLoan.balance,
        status: newLoan.status
      },
      repayment_schedule: {
        repayment_schedule_uuid: repaymentSchedule.repayment_schedule_uuid,
        due_date: repaymentSchedule.due_date,
        repayment_frequency: repaymentSchedule.repayment_frequency,
        total_amount_due: repaymentSchedule.total_amount_due,
        status: repaymentSchedule.status
      },
      limit_check: limitCheck
    };

    res.status(200).json({ 
      message: 'Request approved successfully and loan created',
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
    if (request.status == 'Declined') {
      return res.status(400).json({ message: 'Request is already declined' });
    }
    
    // Check if request is already approved
    if (request.status == 'Approved') {
      return res.status(400).json({ message: 'Cannot decline an already approved request' });
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
    const { request_uuid } = req.params;
    
    // Find the request first to check status
    const request = await Request.findOne({ request_uuid });
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Check if request is approved - we might want to prevent deletion of approved requests
    if (request.status == 'Approved') {
      return res.status(400).json({ 
        message: 'Cannot delete an approved request. Please contact administrator.',
        suggestion: 'Consider declining the request instead if it was approved in error.'
      });
    }
    
    // Delete the request
    const deletedRequest = await Request.findOneAndDelete({ request_uuid });
    
    res.status(200).json({ 
      message: 'Request deleted successfully',
      deleted_request: {
        request_uuid: deletedRequest.request_uuid,
        status: deletedRequest.status,
        amount: deletedRequest.amount
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting request', error: error.message });
  }
};

// Get user's credit limit information
exports.getUserCreditInfo = async (req, res) => {
  try {
    const { user_uuid, car_uuid } = req.params;
    
    if (!user_uuid || !car_uuid) {
      return res.status(400).json({ message: 'User UUID and Car UUID are required' });
    }
    
    // Get profile
    const profile = await Profile.findOne({ user_uuid });
    
    // Get all active loans for this user-car combination
    const activeLoans = await Loan.find({ 
      user_uuid, 
      car_uuid,
      status: 'active' 
    });
    
    // Calculate totals
    const currentTotal = activeLoans.reduce((sum, loan) => sum + loan.balance, 0);
    const limit = profile?.limit || 0;
    const remainingCredit = limit - currentTotal;
    
    const creditInfo = {
      user_uuid,
      car_uuid,
      profile_limit: limit,
      current_active_loans_total: currentTotal,
      active_loans_count: activeLoans.length,
      remaining_credit: remainingCredit > 0 ? remainingCredit : 0,
      limit_exceeded: currentTotal > limit,
      active_loans: activeLoans.map(loan => ({
        loan_uuid: loan.loan_uuid,
        amount: loan.amount,
        balance: loan.balance,
        date_created: loan.date_created
      })),
      can_request_up_to: remainingCredit > 0 ? remainingCredit : 0
    };
    
    res.status(200).json(creditInfo);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching credit information', 
      error: error.message 
    });
  }
};