const express = require('express');
const router = express.Router();
const CardController = require('../controllers/cardController');

// Create a new card
router.post('/', authenticateUser, CardController.createCard);

// Get all cards
router.get('/', authenticateUser, CardController.getAllCards);

// Get a specific card by UUID
router.get('/:card_uuid', authenticateUser, CardController.getCardByUUID);

// Update a card
router.put('/:card_uuid', authenticateUser, CardController.updateCard);

// Delete a card
router.delete('/:card_uuid', authenticateUser, CardController.deleteCard);

module.exports = router;
