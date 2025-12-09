const express = require('express');
const {
  createAgent,
  getAllAgents,
  getAgentById,
  loginAgent,
  updateAgent,
  deleteAgent
} = require('../controllers/agentController');
const { authenticateUser } = require('../middlewares/auth');

const router = express.Router();

router.post('/login', loginAgent);

router.post('/create', authenticateUser, createAgent);  // Protected: Only authenticated users can create agents
router.get('/', authenticateUser, getAllAgents);       // Protected: Only authenticated users can get all agents
router.get('/:agent_uuid', authenticateUser, getAgentById);
router.put('/:agent_uuid', authenticateUser, updateAgent);
router.delete('/:agent_uuid', authenticateUser, deleteAgent);

module.exports = router;
