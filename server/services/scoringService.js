/**
 * Scoring Service for the Travel Decision Companion
 */

// Calculate raw estimated trip cost
const calculateTotalCost = (destination, days, modeOfTravel) => {
    const travelCost = destination.baseTravelCost[modeOfTravel] || 0;
    const hotelCost = days * destination.hotelCostPerDay;
    const foodCost = days * destination.foodCostPerDay;
    return travelCost + hotelCost + foodCost;
};

// Generate rule-based human-readable explanation
const generateExplanation = (destination, constraints, scoreDetails) => {
    let explanation = `Based on your ₹${constraints.budget} budget and ${constraints.days}-day trip from ${constraints.startLocation}, ${destination.name} is an excellent choice. `;

    // Cost aspect
    const budgetPercentage = (scoreDetails.estimatedCost / constraints.budget) * 100;
    if (budgetPercentage < 50) {
        explanation += `It is highly affordable, taking up less than half of your budget. `;
    } else if (budgetPercentage < 85) {
        explanation += `It fits comfortably within your budget. `;
    } else {
        explanation += `It maximizes your budget without exceeding it. `;
    }

    // Preference aspect
    const prefs = [];
    if (constraints.preferredType && constraints.preferredType !== 'No preference') {
        if (destination.landType === constraints.preferredType) {
            prefs.push(`your preference for ${constraints.preferredType.toLowerCase()}s`);
        }
    }
    if (constraints.preferredWeather && constraints.preferredWeather !== 'No preference') {
        if (destination.weather === constraints.preferredWeather) {
            prefs.push(`${constraints.preferredWeather.toLowerCase()} weather`);
        }
    }

    if (prefs.length > 0) {
        explanation += `It beautifully matches ${prefs.join(' and ')}. `;
    } else if (constraints.preferredType || constraints.preferredWeather) {
        explanation += `While it may not perfectly match all your specific type or weather preferences, its overall value and convenience make it a top contender. `;
    } else {
        explanation += `Since you were flexible on the type of destination, its strong overall value makes it a top contender. `;
    }

    // Distance aspect
    const distance = destination.distanceFromMajorCities[constraints.startLocation];
    if (distance) {
        if (distance < 150) {
            explanation += `At just ${distance}km away, it is very convenient for a short trip.`;
        } else if (distance < 500) {
            explanation += `The ${distance}km distance is manageable for your timeframe.`;
        } else if (constraints.days <= 2) {
            explanation += `Though it's ${distance}km away, the destination quality makes the longer travel worthwhile if planned well.`;
        }
    }

    return explanation.trim();
};

const evaluateDestinations = (destinations, constraints) => {
    const {
        startLocation,
        budget,
        days,
        scope,
        preferredType,
        preferredWeather,
        modeOfTravel
    } = constraints;

    // 1. Hard Filtering (Constraints)
    const validDestinations = [];
    destinations.forEach(dest => {
        // Always filter out the starting location itself
        if (dest.name.toLowerCase() === startLocation.toLowerCase()) return;

        // If manual list provided, only process those
        if (constraints.manualDestinations && constraints.manualDestinations.length > 0) {
            const isTarget = constraints.manualDestinations.some(
                targetName => targetName.toLowerCase() === dest.name.toLowerCase()
            );
            if (!isTarget) return;
        }

        // Filter by scope if provided (ONLY in auto mode or if manual match found)
        if (!constraints.manualDestinations && scope && dest.scope !== scope) return;

        // Calculate Cost
        const totalCost = calculateTotalCost(dest, days, modeOfTravel);

        // Filter by budget
        if (totalCost > budget) return;

        validDestinations.push({
            ...dest.toObject(),
            estimatedCost: totalCost
        });
    });

    if (validDestinations.length === 0) return [];

    // Base weights
    let weightCost = 0.3;
    let weightDistance = 0.2;
    let weightType = 0.25;
    let weightWeather = 0.25;

    // Dynamic weight adjustments rules
    // Rule 1: Tight budget
    // If the average valid destination takes up > 80% of budget, prioritize cost
    const avgCost = validDestinations.reduce((sum, d) => sum + d.estimatedCost, 0) / validDestinations.length;
    if (avgCost > budget * 0.8) {
        weightCost += 0.2;
        weightType -= 0.1;
        weightWeather -= 0.1;
    }

    // Rule 2: Short trip (<= 2 days) -> prioritize distance
    if (days <= 2) {
        weightDistance += 0.2;
        weightType -= 0.1;
        weightWeather -= 0.1;
    }

    // Rule 3: No preferences -> distribute weights to cost and distance
    if (preferredType === 'No preference') {
        weightCost += weightType / 2;
        weightDistance += weightType / 2;
        weightType = 0;
    }
    if (preferredWeather === 'No preference') {
        weightCost += weightWeather / 2;
        weightDistance += weightWeather / 2;
        weightWeather = 0;
    }

    // Normalize weights to ensure sum = 1
    const totalWeight = weightCost + weightDistance + weightType + weightWeather;
    weightCost /= totalWeight;
    weightDistance /= totalWeight;
    weightType /= totalWeight;
    weightWeather /= totalWeight;

    // Determine max values for normalization
    const maxCost = Math.max(...validDestinations.map(d => d.estimatedCost), 1);
    const maxDist = Math.max(...validDestinations.map(d => d.distanceFromMajorCities[startLocation] || 500), 1);

    // 2. Soft Scoring Model
    const scoredDestinations = validDestinations.map(dest => {
        // Budget Fit: Lower cost is better (1 to 0)
        // We normalize using budget instead of maxCost so we measure how much of the budget is saved
        const budgetFit = 1 - (dest.estimatedCost / budget);

        // Distance Suitability: Lower distance is better
        const dist = dest.distanceFromMajorCities[startLocation] || maxDist;
        const distanceSuitability = 1 - (dist / (dist + 500)); // Non-linear normalization to keep it between 0-1

        // Preference Match: 1 for exact match, 0 for mismatch
        const typeMatch = (preferredType === 'No preference' || dest.landType === preferredType) ? 1 : 0;
        const weatherMatch = (preferredWeather === 'No preference' || dest.weather === preferredWeather) ? 1 : 0;

        // Calculate Weighted Score
        const score = (weightCost * budgetFit) +
            (weightDistance * distanceSuitability) +
            (weightType * typeMatch) +
            (weightWeather * weatherMatch);

        const scoreDetails = {
            budgetFit,
            distanceSuitability,
            typeMatch,
            weatherMatch,
            estimatedCost: dest.estimatedCost
        };

        return {
            destination: dest,
            estimatedCost: dest.estimatedCost,
            score: parseFloat(score.toFixed(4)),
            scoreDetails,
            explanation: generateExplanation(dest, constraints, scoreDetails)
        };
    });

    // Rank descending by score
    scoredDestinations.sort((a, b) => b.score - a.score);

    return scoredDestinations;
};

module.exports = {
    evaluateDestinations
};
