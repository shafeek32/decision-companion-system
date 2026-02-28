const mongoose = require('mongoose');

// Stores a single evaluated destination input from user
const destinationInputSchema = new mongoose.Schema({
    name: { type: String, required: true },
    budget: { type: Number, required: true },          // Total estimated cost in ₹
    travelTimeHours: { type: Number, required: true }, // One-way travel time in hours
    distanceKm: { type: Number, required: true },      // Distance in km
    safetyRating: { type: Number, min: 1, max: 10, required: true },
    weatherSuitability: { type: Number, min: 1, max: 10, required: true },
    userRating: { type: Number, min: 1, max: 10, required: true },
    imageUrl: { type: String, default: '' }
}, { _id: false });

// Stores a ranked result entry
const rankedResultSchema = new mongoose.Schema({
    name: { type: String },
    score: { type: Number },
    rank: { type: Number },
    scoreBreakdown: { type: mongoose.Schema.Types.Mixed }
}, { _id: false });

// Stores a full trip evaluation session
const tripEvaluationSchema = new mongoose.Schema({
    startLocation: { type: String, required: true },
    modeOfTravel: { type: String, required: true },
    destinations: [destinationInputSchema],
    results: [rankedResultSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TripEvaluation', tripEvaluationSchema);
