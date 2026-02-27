const mongoose = require('mongoose');

const distanceSchema = new mongoose.Schema({
    Kochi: { type: Number, required: true },
    Trivandrum: { type: Number, required: true },
    Calicut: { type: Number, required: true }
}, { _id: false });

const destinationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    scope: { type: String, enum: ['Inside Kerala', 'Outside Kerala (India)', 'Outside India'], required: true },
    landType: { type: String, enum: ['Hill station', 'Beach', 'City', 'Forest'], required: true },
    weather: { type: String, enum: ['Cool', 'Warm', 'Moderate'], required: true },
    distanceFromMajorCities: { type: distanceSchema, required: true },
    hotelCostPerDay: { type: Number, required: true },
    foodCostPerDay: { type: Number, required: true },
    baseTravelCost: {
        Car: { type: Number, required: true },
        Train: { type: Number, required: true },
        Flight: { type: Number, required: true }
    },
    imageUrl: { type: String }
});

module.exports = mongoose.model('Destination', destinationSchema);
