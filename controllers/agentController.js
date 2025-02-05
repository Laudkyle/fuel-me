const { Agent, User } = require('../models');
const { authenticateUser } = require('../middlewares/auth'); // Import authentication middleware

// Create a new agent
exports.createAgent = async (req, res) => {
  try {
    const { station_uuid, agent_uuid, fullname, transaction_pin } = req.body;

    // Ensure the user exists based on the authenticated user (JWT)
    const user_uuid = req.user.id; // Get user ID from token

    const user = await User.findOne({ _id: user_uuid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newAgent = new Agent({
      user_uuid,
      station_uuid,
      agent_uuid,
      fullname,
      transaction_pin,
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

// Update an agent by agent_uuid (Only authenticated users)
exports.updateAgent = async (req, res) => {
  try {
    const { agent_uuid } = req.params;
    const updatedData = req.body;

    const updatedAgent = await Agent.findOneAndUpdate({ agent_uuid }, updatedData, { new: true });

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
