const express = require('express');
const { authenticateUser } = require('../middlewares/auth');

const router = express.Router();
const CardController = require('../controllers/cardController');

// Create a new card
router.post('/create', authenticateUser, CardController.createCard);

// Get all cards
router.get('/', authenticateUser, CardController.getAllCards);
// Get all cards of a specific user
router.get('/user/:user_uuid', authenticateUser, CardController.getUserCards);

// Get a specific card by UUID
router.get('/:card_uuid', authenticateUser, CardController.getCardByUUID);

// Update a card
router.put('/:card_uuid', authenticateUser, CardController.updateCard);

// Delete a card
router.delete('/:card_uuid', authenticateUser, CardController.deleteCard);

module.exports = router;
