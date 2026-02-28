const express = require('express');
const router = express.Router();
const Destination = require('../models/Destination');
const { evaluateDestinations } = require('../services/scoringService');

// POST /api/evaluate
// Accepts user constraints and returns ranked destinations
router.post('/evaluate', async (req, res) => {
    try {
        const {
            startLocation,
            budget,
            days,
            scope,
            preferredType, // 'Hill station', 'Beach', 'City', 'Forest', 'No preference'
            preferredWeather, // 'Cool', 'Warm', 'Moderate', 'No preference'
            modeOfTravel, // 'Car', 'Train', 'Flight'
            manualDestinations // Optional array of names
        } = req.body;

        // Basic validation
        if (!startLocation || !budget || !days || !modeOfTravel) {
            return res.status(400).json({ error: 'Missing required constraints.' });
        }

        // Fetch all destinations from DB
        const destinations = await Destination.find({});

        // Calculate and Rank
        const constraints = { startLocation, budget: Number(budget), days: Number(days), scope, preferredType, preferredWeather, modeOfTravel, manualDestinations };
        const results = evaluateDestinations(destinations, constraints);

        res.json({
            success: true,
            results,
            count: results.length
        });

    } catch (error) {
        console.error('Evaluate Error:', error);
        res.status(500).json({ error: 'Internal server error during evaluation.' });
    }
});

// GET /api/destinations
// Simple endpoint to list available destinations (optional, for debugging/UI)
router.get('/destinations', async (req, res) => {
    try {
        const destinations = await Destination.find({});
        res.json(destinations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch destinations' });
    }
});

module.exports = router;
