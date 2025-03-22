const {Station} = require('../models');

// Create a new station
exports.createStation = async (req, res) => {
  try {
    const { station_uuid, code, agent_uuid, location, bank_uuid } = req.body;

    const newStation = new Station({
      station_uuid,
      agent_uuid,
      code,
      location,
      bank_uuid,
    });

    await newStation.save();
    res.status(201).json({ message: 'Station created successfully', station: newStation });
  } catch (error) {
    res.status(500).json({ message: 'Error creating station', error: error.message });
  }
};

// Get all stations
exports.getAllStations = async (req, res) => {
  try {
    const stations = await Station.find();
    res.status(200).json(stations);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving stations', error: error.message });
  }
};

// Get a station by UUID
exports.getStationByUUID = async (req, res) => {
  try {
    const station = await Station.findOne({ station_uuid: req.params.station_uuid });
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    res.status(200).json(station);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving station', error: error.message });
  }
};

// Get a station by Code
exports.getStationByCode = async (req, res) => {
  try {
    const station = await Station.findOne({ code: req.params.code });
    if (!station) {
      return res.status(404).json({ message: 'Station not found' });
    }
    res.status(200).json(station);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving station', error: error.message });
  }
};

// Update a station
exports.updateStation = async (req, res) => {
  try {
    const { location,code, bank_uuid } = req.body;

    const updatedStation = await Station.findOneAndUpdate(
      { station_uuid: req.params.station_uuid },
      { location,code, bank_uuid, date_modified: Date.now() },
      { new: true }
    );

    if (!updatedStation) {
      return res.status(404).json({ message: 'Station not found' });
    }

    res.status(200).json({ message: 'Station updated successfully', station: updatedStation });
  } catch (error) {
    res.status(500).json({ message: 'Error updating station', error: error.message });
  }
};

// Delete a station
exports.deleteStation = async (req, res) => {
  try {
    const deletedStation = await Station.findOneAndDelete({ station_uuid: req.params.station_uuid });

    if (!deletedStation) {
      return res.status(404).json({ message: 'Station not found' });
    }

    res.status(200).json({ message: 'Station deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting station', error: error.message });
  }
};
