const express = require('express');
const {
  getUsers,
  getUserByPhone,
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { authenticateUser } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateUser, getUsers);
router.get('/:phone', authenticateUser, getUserByPhone);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/:phone', authenticateUser, updateUser);
router.delete('/:phone', authenticateUser, deleteUser);

module.exports = router;
