const { v4: uuidv4 } = require("uuid");
const { Station } = require("../models");

// Get Petrol Price (PPU - Price Per Unit)
exports.getPetrolPrice = async (req, res) => {
  try {
    const { code } = req.params;
    
    if (code) {
      // Get petrol price for specific station by code
      const station = await Station.findOne({ code });
      if (!station) {
        return res.status(404).json({ message: "Station not found" });
      }
      
      if (!station.ppl_petrol && station.ppl_petrol !== 0) {
        return res.status(404).json({ 
          message: "Petrol price not set for this station",
          station: {
            name: station.name,
            code: station.code,
            location: station.location
          }
        });
      }
      
      res.status(200).json({
        station: {
          name: station.name,
          code: station.code,
          location: station.location
        },
        fuel_type: "petrol",
        price: station.ppl_petrol,
        currency: "GHS",
        unit: "litre",
        last_updated: station.date_modified || station.date_created
      });
    } else {
      // Get average petrol price across all stations
      const stations = await Station.find({ 
        ppl_petrol: { $exists: true, $ne: null } 
      });
      
      if (stations.length === 0) {
        return res.status(404).json({ 
          message: "No petrol prices available" 
        });
      }
      
      const total = stations.reduce((sum, station) => sum + station.ppl_petrol, 0);
      const averagePrice = total / stations.length;
      
      res.status(200).json({
        fuel_type: "petrol",
        average_price: averagePrice.toFixed(2),
        currency: "GHS",
        unit: "litre",
        station_count: stations.length,
        min_price: Math.min(...stations.map(s => s.ppl_petrol)),
        max_price: Math.max(...stations.map(s => s.ppl_petrol)),
        stations: stations.map(station => ({
          name: station.name,
          code: station.code,
          location: station.location,
          price: station.ppl_petrol
        }))
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: "Error retrieving petrol price", 
      error: error.message 
    });
  }
};

// Get Diesel Price (PPU - Price Per Unit)
exports.getDieselPrice = async (req, res) => {
  try {
    const { code } = req.params;
    
    if (code) {
      // Get diesel price for specific station by code
      const station = await Station.findOne({ code });
      if (!station) {
        return res.status(404).json({ message: "Station not found" });
      }
      
      if (!station.ppl_diesel && station.ppl_diesel !== 0) {
        return res.status(404).json({ 
          message: "Diesel price not set for this station",
          station: {
            name: station.name,
            code: station.code,
            location: station.location
          }
        });
      }
      
      res.status(200).json({
        station: {
          name: station.name,
          code: station.code,
          location: station.location
        },
        fuel_type: "diesel",
        price: station.ppl_diesel,
        currency: "GHS",
        unit: "litre",
        last_updated: station.date_modified || station.date_created
      });
    } else {
      // Get average diesel price across all stations
      const stations = await Station.find({ 
        ppl_diesel: { $exists: true, $ne: null } 
      });
      
      if (stations.length === 0) {
        return res.status(404).json({ 
          message: "No diesel prices available" 
        });
      }
      
      const total = stations.reduce((sum, station) => sum + station.ppl_diesel, 0);
      const averagePrice = total / stations.length;
      
      res.status(200).json({
        fuel_type: "diesel",
        average_price: averagePrice.toFixed(2),
        currency: "GHS",
        unit: "litre",
        station_count: stations.length,
        min_price: Math.min(...stations.map(s => s.ppl_diesel)),
        max_price: Math.max(...stations.map(s => s.ppl_diesel)),
        stations: stations.map(station => ({
          name: station.name,
          code: station.code,
          location: station.location,
          price: station.ppl_diesel
        }))
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: "Error retrieving diesel price", 
      error: error.message 
    });
  }
};

// Get Both Fuel Prices
exports.getFuelPrices = async (req, res) => {
  try {
    const { code } = req.params;
    
    if (code) {
      // Get both prices for specific station by code
      const station = await Station.findOne({ code });
      if (!station) {
        return res.status(404).json({ message: "Station not found" });
      }
      
      res.status(200).json({
        station: {
          name: station.name,
          code: station.code,
          location: station.location
        },
        petrol: station.ppl_petrol || null,
        diesel: station.ppl_diesel || null,
        currency: "GHS",
        unit: "litre",
        last_updated: station.date_modified || station.date_created,
        has_petrol: station.ppl_petrol !== undefined && station.ppl_petrol !== null,
        has_diesel: station.ppl_diesel !== undefined && station.ppl_diesel !== null
      });
    } else {
      // Get average prices across all stations
      const stationsWithPetrol = await Station.find({ 
        ppl_petrol: { $exists: true, $ne: null } 
      });
      const stationsWithDiesel = await Station.find({ 
        ppl_diesel: { $exists: true, $ne: null } 
      });
      
      const petrolAvg = stationsWithPetrol.length > 0 
        ? stationsWithPetrol.reduce((sum, s) => sum + s.ppl_petrol, 0) / stationsWithPetrol.length 
        : null;
      
      const dieselAvg = stationsWithDiesel.length > 0 
        ? stationsWithDiesel.reduce((sum, s) => sum + s.ppl_diesel, 0) / stationsWithDiesel.length 
        : null;
      
      res.status(200).json({
        petrol: petrolAvg ? petrolAvg.toFixed(2) : null,
        diesel: dieselAvg ? dieselAvg.toFixed(2) : null,
        currency: "GHS",
        unit: "litre",
        petrol_station_count: stationsWithPetrol.length,
        diesel_station_count: stationsWithDiesel.length
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: "Error retrieving fuel prices", 
      error: error.message 
    });
  }
};

// Create a new station
exports.createStation = async (req, res) => {
  try {
    const {
      name,
      code,
      agent_uuid,
      location,
      longitude,
      latititude,
      ppl_diesel,
      ppl_petrol,
      bank_uuid,
    } = req.body;

    const newStation = new Station({
      station_uuid: uuidv4(), // Generate UUID automatically
      agent_uuid,
      name,
      longitude,
      latititude,
      code,
      location,
      ppl_diesel,
      ppl_petrol,
      bank_uuid,
    });

    await newStation.save();
    res
      .status(201)
      .json({ message: "Station created successfully", station: newStation });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating station", error: error.message });
  }
};

// Get all stations
exports.getAllStations = async (req, res) => {
  try {
    const stations = await Station.find();
    res.status(200).json(stations);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving stations", error: error.message });
  }
};

// Get a station by UUID
exports.getStationByUUID = async (req, res) => {
  try {
    const station = await Station.findOne({
      station_uuid: req.params.station_uuid,
    });
    if (!station) {
      return res.status(404).json({ message: "Station not found" });
    }
    res.status(200).json(station);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving station", error: error.message });
  }
};

// Get a station by Code
exports.getStationByCode = async (req, res) => {
  try {
    const station = await Station.findOne({ code: req.params.code });
    if (!station) {
      return res.status(404).json({ message: "Station not found" });
    }
    res.status(200).json(station);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving station", error: error.message });
  }
};

// Update a station
exports.updateStation = async (req, res) => {
  try {
    const { name,location, longitude,latitude, code, bank_uuid,ppl_diesel,
      ppl_petrol } = req.body;

    const updatedStation = await Station.findOneAndUpdate(
      { station_uuid: req.params.station_uuid },
      {
        location,
        longitude,
        latitude,
        code,
        name,
        bank_uuid,
        ppl_diesel,
      ppl_petrol,
        date_modified: Date.now(),
      },
      { new: true }
    );

    if (!updatedStation) {
      return res.status(404).json({ message: "Station not found" });
    }

    res
      .status(200)
      .json({
        message: "Station updated successfully",
        station: updatedStation,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating station", error: error.message });
  }
};

// Delete a station
exports.deleteStation = async (req, res) => {
  try {
    const deletedStation = await Station.findOneAndDelete({
      station_uuid: req.params.station_uuid,
    });

    if (!deletedStation) {
      return res.status(404).json({ message: "Station not found" });
    }

    res.status(200).json({ message: "Station deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting station", error: error.message });
  }
};