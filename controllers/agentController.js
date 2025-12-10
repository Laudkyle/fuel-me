const { v4: uuidv4 } = require('uuid');
const { Agent, User } = require('../models');
const { authenticateUser } = require('../middlewares/auth');
const { generateAccessToken, generateRefreshToken } = require('../middlewares/auth');
const bcrypt = require("bcryptjs");
const { comparePassword } = require('../utils/hash');

// Create a new agent
exports.createAgent = async (req, res) => {
  try {
    const { user_uuid, station_uuid, fullname, phone, transaction_pin } = req.body;

    const user = await User.findOne({ user_uuid: user_uuid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if agent with this phone already exists
    const existingAgent = await Agent.findOne({ phone });
    if (existingAgent) {
      return res.status(400).json({ message: 'Agent with this phone already exists' });
    }

    // Hash the transaction pin
    const hashedPin = await bcrypt.hash(transaction_pin, 10);

    const newAgent = new Agent({
      user_uuid,
      station_uuid,
      agent_uuid: uuidv4(), // Generate UUID automatically
      fullname,
      phone,
      transaction_pin: hashedPin,
    });

    await newAgent.save();
    res.status(201).json({ message: 'Agent created successfully', agent: newAgent });
  } catch (error) {
    res.status(500).json({ message: 'Error creating agent', error: error.message });
  }
};

// Get all agents (Only authenticated users can access)
exports.getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find();
    res.status(200).json(agents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching agents', error: error.message });
  }
};

// Get a single agent by agent_uuid
exports.getAgentById = async (req, res) => {
  try {
    const { agent_uuid } = req.params;
    const agent = await Agent.findOne({ agent_uuid });

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.status(200).json(agent);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching agent', error: error.message });
  }
};

// Agent login with phone and transaction pin
exports.loginAgent = async (req, res) => {
  try {
    const { phone, transaction_pin } = req.body;

    // Check if both phone and pin are provided
    if (!phone || !transaction_pin) {
      return res.status(400).json({ 
        message: 'Phone and transaction pin are required' 
      });
    }

    // Find agent by phone
    const agent = await Agent.findOne({ phone });
    if (!agent) {
      return res.status(400).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Compare the transaction pin
    const isPinValid = await comparePassword(transaction_pin, agent.transaction_pin);
    if (!isPinValid) {
      return res.status(400).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(agent);
    const refreshToken = generateRefreshToken(agent);

    // Remove sensitive information from response
    const agentResponse = agent.toObject();
    delete agentResponse.transaction_pin;

    res.status(200).json({ 
      message: 'Login successful',
      agent: agentResponse,
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error during login', 
      error: error.message 
    });
  }
};

// Update an agent by agent_uuid (Only authenticated users)
exports.updateAgent = async (req, res) => {
  try {
    const { agent_uuid } = req.params;
    const updatedData = req.body;

    // If updating transaction pin, hash it
    if (updatedData.transaction_pin) {
      updatedData.transaction_pin = await bcrypt.hash(updatedData.transaction_pin, 10);
    }

    const updatedAgent = await Agent.findOneAndUpdate(
      { agent_uuid }, 
      updatedData, 
      { new: true }
    );

    if (!updatedAgent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Remove sensitive information from response
    const agentResponse = updatedAgent.toObject();
    delete agentResponse.transaction_pin;

    res.status(200).json({ 
      message: 'Agent updated successfully', 
      agent: agentResponse 
    });
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

// Optional: Get agent by phone
exports.getAgentByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    const agent = await Agent.findOne({ phone });

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Remove sensitive information from response
    const agentResponse = agent.toObject();
    delete agentResponse.transaction_pin;

    res.status(200).json(agentResponse);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching agent', error: error.message });
  }
};