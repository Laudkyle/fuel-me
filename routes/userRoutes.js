const express = require('express');
const {
  getUsers,
  getUserByPhone,
  registerUsers,
  loginUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { authenticateUser, refreshAccessToken } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateUser, getUsers);
router.get('/:phone', authenticateUser, getUserByPhone);
router.post('/register', registerUsers);
router.post('/login', loginUser);
router.post('/refresh-token', refreshAccessToken); 
router.put('/:phone', authenticateUser, updateUser);
router.delete('/:phone', authenticateUser, deleteUser);

module.exports = router;
