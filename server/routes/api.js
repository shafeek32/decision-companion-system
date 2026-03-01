const express = require('express');
const router = express.Router();
const TripEvaluation = require('../models/Destination');
const { evaluateDestinations, WEIGHTS } = require('../services/scoringService');

/**
 * POST /api/evaluate
 * Body:
 * {
 *   startLocation: "Kochi",
 *   modeOfTravel: "Train",
 *   destinations: [
 *     { name, budget, travelTimeHours, distanceKm, safetyRating, weatherSuitability, userRating, imageUrl? }
 *   ]
 * }
 */
router.post('/evaluate', async (req, res) => {
    try {
        const { startLocation, modeOfTravel, destinations } = req.body;

        // --- Validation ---
        if (!startLocation || typeof startLocation !== 'string') {
            return res.status(400).json({ error: 'startLocation is required.' });
        }
        if (!modeOfTravel || typeof modeOfTravel !== 'string') {
            return res.status(400).json({ error: 'modeOfTravel is required.' });
        }
        if (!Array.isArray(destinations) || destinations.length < 2) {
            return res.status(400).json({ error: 'At least 2 destinations are required for comparison.' });
        }

        const REQUIRED_FIELDS = ['name', 'budget', 'travelTimeHours', 'distanceKm', 'safetyRating', 'weatherSuitability', 'userRating'];
        for (let i = 0; i < destinations.length; i++) {
            const d = destinations[i];
            for (const field of REQUIRED_FIELDS) {
                if (d[field] === undefined || d[field] === null || d[field] === '') {
                    return res.status(400).json({ error: `Destination #${i + 1} is missing field: ${field}` });
                }
            }
            // Validate rating ranges
            for (const ratingField of ['safetyRating', 'weatherSuitability', 'userRating']) {
                const val = Number(d[ratingField]);
                if (isNaN(val) || val < 1 || val > 10) {
                    return res.status(400).json({ error: `${ratingField} in destination #${i + 1} must be between 1 and 10.` });
                }
            }
            // Coerce all numeric fields
            d.budget = Number(d.budget);
            d.travelTimeHours = Number(d.travelTimeHours);
            d.distanceKm = Number(d.distanceKm);
            d.safetyRating = Number(d.safetyRating);
            d.weatherSuitability = Number(d.weatherSuitability);
            d.userRating = Number(d.userRating);
        }

        // --- Run WSM Scoring ---
        const results = evaluateDestinations(destinations);

        // --- Persist to DB (async, non-blocking for response) ---
        const trip = new TripEvaluation({
            startLocation,
            modeOfTravel,
            destinations,
            results: results.map(r => ({
                name: r.name,
                score: r.score,
                rank: r.rank,
                scoreBreakdown: r.scoreBreakdown
            }))
        });
        trip.save().catch(err => console.error('DB save error (non-fatal):', err.message));

        // --- Return Response ---
        res.json({
            success: true,
            weightsUsed: WEIGHTS,
            winner: results[0],
            rankedResults: results,
            count: results.length
        });

    } catch (error) {
        console.error('Evaluate Error:', error);
        res.status(500).json({ error: 'Internal server error during evaluation.' });
    }
});

/**
 * GET /api/history
 * Returns the last 10 trip evaluations.
 */
router.get('/history', async (req, res) => {
    try {
        const history = await TripEvaluation.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .select('startLocation modeOfTravel createdAt results');
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history.' });
    }
});

/**
 * POST /api/destinations/suggest
 * Body: { startLocation, modeOfTravel, totalBudget, memberCount }
 */
router.post('/destinations/suggest', async (req, res) => {
    try {
        const { startLocation, modeOfTravel, totalBudget, memberCount, tripDays = 3, landType } = req.body;

        if (!startLocation || !modeOfTravel || !totalBudget || !memberCount) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        const DestinationModel = require('../models/CatalogDestination');
        const allDestinations = await DestinationModel.find({});

        // Filter destinations that fit the budget
        const validDestinations = allDestinations.filter(dest => {
            if (landType && landType !== 'Any' && dest.landType !== landType) {
                return false;
            }

            // Assume 2 people per hotel room
            const numRooms = Math.ceil(memberCount / 2);
            const hotelCost = dest.hotelCostPerDay * tripDays * numRooms;

            const foodCost = dest.foodCostPerDay * tripDays * memberCount;

            let travelCost = dest.baseTravelCost?.[modeOfTravel] || 99999;
            if (travelCost === 99999) return false;

            let totalTravelCost = travelCost * memberCount;
            // Car travel cost is usually for the whole car, not per person, up to ~4-5 people.
            // Let's simplified it: if car, just use base cost * num vehicles needed.
            if (modeOfTravel === 'Car') {
                const numCars = Math.ceil(memberCount / 4);
                totalTravelCost = travelCost * numCars;
            }

            const estimatedTotalCost = hotelCost + foodCost + totalTravelCost;
            return estimatedTotalCost <= totalBudget;
        });

        if (validDestinations.length === 0) {
            return res.json({ success: true, count: 0, rankedResults: [] });
        }

        // Map them to the format expected by evaluateDestinations for ranking best overall options
        const formattedDestinations = validDestinations.map(d => {
            const distance = d.distanceFromMajorCities?.[startLocation] || 500;
            const numRooms = Math.ceil(memberCount / 2);
            const hotelCost = d.hotelCostPerDay * tripDays * numRooms;
            const foodCost = d.foodCostPerDay * tripDays * memberCount;
            let travelCost = d.baseTravelCost?.[modeOfTravel] * memberCount || 5000;
            if (modeOfTravel === 'Car') {
                travelCost = (d.baseTravelCost?.['Car'] || 3000) * Math.ceil(memberCount / 4);
            }

            return {
                name: d.name,
                budget: hotelCost + foodCost + travelCost,
                travelTimeHours: distance / (modeOfTravel === 'Train' ? 60 : modeOfTravel === 'Flight' ? 500 : 50), // Rough estimate
                distanceKm: distance,
                safetyRating: 8, // Default fallback if missing
                weatherSuitability: 8, // Default fallback if missing
                userRating: 8.5, // Default fallback if missing
                imageUrl: d.imageUrl
            };
        });

        // Use existing scoring logic
        const results = evaluateDestinations(formattedDestinations);

        res.json({
            success: true,
            count: results.length,
            rankedResults: results.slice(0, 5) // Return top 5
        });

    } catch (error) {
        console.error('Suggest Error:', error);
        res.status(500).json({ error: 'Internal server error during suggestion.' });
    }
});

module.exports = router;
