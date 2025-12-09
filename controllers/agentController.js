const { v4: uuidv4 } = require('uuid');
const { Agent, User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateUser } = require('../middlewares/auth'); // Import authentication middleware

// Create a new agent
exports.createAgent = async (req, res) => {
  try {
    const { station_uuid, fullname, phone, transaction_pin } = req.body;

    // Ensure the user exists based on the authenticated user (JWT)
    const user_uuid = req.user.id; 

    const user = await User.findOne({ _id: user_uuid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the transaction pin before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(transaction_pin, salt);

    const newAgent = new Agent({
      user_uuid,
      station_uuid,
      agent_uuid: uuidv4(), // Generate UUID automatically
      fullname,
      phone,
      transaction_pin: hashedPin, // Store hashed pin
    });

    await newAgent.save();
    
    // Don't send the hashed pin in response
    const agentResponse = newAgent.toObject();
    delete agentResponse.transaction_pin;
    
    res.status(201).json({ message: 'Agent created successfully', agent: agentResponse });
  } catch (error) {
    res.status(500).json({ message: 'Error creating agent', error: error.message });
  }
};

// Agent login with phone and transaction pin
exports.loginAgent = async (req, res) => {
  try {
    const { phone, transaction_pin } = req.body;

    // Validate input
    if (!phone || !transaction_pin) {
      return res.status(400).json({ message: 'Phone and transaction pin are required' });
    }

    // Find agent by phone
    const agent = await Agent.findOne({ phone });
    
    if (!agent) {
      return res.status(401).json({ message: 'Invalid phone or transaction pin' });
    }

    // Check if agent is active (you might want to add an 'is_active' field)
    if (agent.status && agent.status !== 'active') {
      return res.status(403).json({ message: 'Agent account is not active' });
    }

    // Compare transaction pin
    const isPinValid = await bcrypt.compare(transaction_pin, agent.transaction_pin);
    
    if (!isPinValid) {
      return res.status(401).json({ message: 'Invalid phone or transaction pin' });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: agent.agent_uuid, 
        phone: agent.phone,
        fullname: agent.fullname,
        user_uuid: agent.user_uuid,
        station_uuid: agent.station_uuid,
        role: 'agent' // Add role for authorization
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' } // Token expires in 24 hours
    );

    // Don't send the hashed pin in response
    const agentResponse = agent.toObject();
    delete agentResponse.transaction_pin;

    res.status(200).json({
      message: 'Login successful',
      token,
      agent: agentResponse,
      expiresIn: 24 * 60 * 60 // 24 hours in seconds
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
};

// Get all agents (Only authenticated users can access)
exports.getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find().select('-transaction_pin'); // Exclude transaction pin
    res.status(200).json(agents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching agents', error: error.message });
  }
};

// Get a single agent by agent_uuid
exports.getAgentById = async (req, res) => {
  try {
    const { agent_uuid } = req.params;
    const agent = await Agent.findOne({ agent_uuid }).select('-transaction_pin'); // Exclude transaction pin

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.status(200).json(agent);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching agent', error: error.message });
  }
};

// Update an agent by agent_uuid (Only authenticated users)
exports.updateAgent = async (req, res) => {
  try {
    const { agent_uuid } = req.params;
    const updatedData = req.body;

    // If updating transaction pin, hash it first
    if (updatedData.transaction_pin) {
      const salt = await bcrypt.genSalt(10);
      updatedData.transaction_pin = await bcrypt.hash(updatedData.transaction_pin, salt);
    }

    const updatedAgent = await Agent.findOneAndUpdate(
      { agent_uuid }, 
      updatedData, 
      { new: true }
    ).select('-transaction_pin'); // Exclude transaction pin from response

    if (!updatedAgent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.status(200).json({ message: 'Agent updated successfully', agent: updatedAgent });
  } catch (error) {
    res.status(500).json({ message: 'Error updating agent', error: error.message });
  }
};

// Delete an agent by agent_uuid (Only authenticated users)
exports.deleteAgent = async (req, res) => {
  try {
    const { agent_uuid } = req.params;

    const deletedAgent = await Agent.findOneAndDelete({ agent_uuid });

    if (!deletedAgent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.status(200).json({ message: 'Agent deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting agent', error: error.message });
  }
};

// Get current agent profile (for logged-in agent)
exports.getAgentProfile = async (req, res) => {
  try {
    // Assuming req.user is set by authentication middleware for agents
    const agent_uuid = req.user.id;
    
    const agent = await Agent.findOne({ agent_uuid }).select('-transaction_pin');
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.status(200).json(agent);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching agent profile', error: error.message });
  }
};