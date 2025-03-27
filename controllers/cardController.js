const { v4: uuidv4 } = require("uuid");
const { Card, User } = require("../models"); // Ensure User model is imported

// Create a new card
exports.createCard = async (req, res) => {
  try {
    const { phone_number, card_number, expiry_date, cvc, name } = req.body;

    // Find the user based on phone number
    const user = await User.findOne({ phone:phone_number });
    if (!user) {
      return res.status(404).json({ message: "User not found with this phone number" });
    }

    // Create new card with user's UUID
    const newCard = new Card({
      user_uuid: user.user_uuid, // Get user UUID from database
      card_uuid: uuidv4(), // Generate UUID automatically
      card_number,
      expiry_date,
      cvc,
      name,
    });

    await newCard.save();
    res.status(201).json({ message: "Card created successfully", card: newCard });
  } catch (error) {
    res.status(500).json({ message: "Error creating card", error: error.message });
  }
};

// Get all cards
exports.getAllCards = async (req, res) => {
  try {
    const cards = await Card.find();
    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving cards", error: error.message });
  }
};

// Get a card by UUID
exports.getCardByUUID = async (req, res) => {
  try {
    const card = await Card.findOne({ card_uuid: req.params.card_uuid });
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }
    res.status(200).json(card);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving card", error: error.message });
  }
};
// Get all cards of a specific user by user_uuid
exports.getUserCards = async (req, res) => {
  try {
    const { user_uuid } = req.params; // Extract user_uuid from request params

    const cards = await Card.find({ user_uuid }); // Find all cards with the given user_uuid

    if (!cards.length) {
      return res.status(404).json({ message: "No cards found for this user" });
    }

    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user cards", error: error.message });
  }
};

// Update a card
exports.updateCard = async (req, res) => {
  try {
    const { card_number, expiry_date, cvc, name } = req.body;

    const updatedCard = await Card.findOneAndUpdate(
      { card_uuid: req.params.card_uuid },
      { card_number, expiry_date, cvc, name, date_modified: Date.now() },
      { new: true }
    );

    if (!updatedCard) {
      return res.status(404).json({ message: "Card not found" });
    }

    res.status(200).json({ message: "Card updated successfully", card: updatedCard });
  } catch (error) {
    res.status(500).json({ message: "Error updating card", error: error.message });
  }
};

// Delete a card
exports.deleteCard = async (req, res) => {
  try {
    const deletedCard = await Card.findOneAndDelete({ card_uuid: req.params.card_uuid });

    if (!deletedCard) {
      return res.status(404).json({ message: "Card not found" });
    }

    res.status(200).json({ message: "Card deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting card", error: error.message });
  }
};
