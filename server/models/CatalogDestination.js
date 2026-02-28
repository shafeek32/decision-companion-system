const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    scope: { type: String },
    landType: { type: String },
    weather: { type: String },
    distanceFromMajorCities: { type: mongoose.Schema.Types.Mixed }, // e.g. { Kochi: 130, Trivandrum: 280 }
    hotelCostPerDay: { type: Number, required: true },
    foodCostPerDay: { type: Number, required: true },
    baseTravelCost: { type: mongoose.Schema.Types.Mixed }, // e.g. { Bike: 500, Bus: 350, Car: 1500, Train: 99999, Flight: 99999 }
    imageUrl: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CatalogDestination', destinationSchema);
