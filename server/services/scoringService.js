/**
 * Smart Destination Decision System — Scoring Service
 * Uses Weighted Sum Model (WSM) with min-max normalization.
 *
 * SYSTEM WEIGHTS (fixed, not user-configurable):
 *   Budget            → 0.35  (cost-type: lower is better)
 *   Travel Time       → 0.20  (cost-type: lower is better)
 *   Distance          → 0.15  (cost-type: lower is better)
 *   Safety Rating     → 0.15  (benefit-type: higher is better)
 *   Weather Suit.     → 0.10  (benefit-type: higher is better)
 *   User Rating       → 0.05  (benefit-type: higher is better)
 */

const WEIGHTS = {
    budget: 0.35,
    travelTimeHours: 0.20,
    distanceKm: 0.15,
    safetyRating: 0.15,
    weatherSuitability: 0.10,
    userRating: 0.05
};

// Cost-type factors: lower raw value = better outcome
const COST_FACTORS = ['budget', 'travelTimeHours', 'distanceKm'];

// Benefit-type factors: higher raw value = better outcome
const BENEFIT_FACTORS = ['safetyRating', 'weatherSuitability', 'userRating'];

/**
 * Min-max normalize a value within a range.
 * For cost-type: inverted so that lower value → score closer to 1.
 * For benefit-type: direct so that higher value → score closer to 1.
 */
const normalize = (value, min, max, isCost) => {
    if (max === min) return 1; // All values are identical → perfect score for all
    if (isCost) {
        return (max - value) / (max - min);
    } else {
        return (value - min) / (max - min);
    }
};

/**
 * Generate a human-readable explanation of why the winner was chosen.
 */
const generateExplanation = (winner, allResults) => {
    const breakdown = winner.scoreBreakdown;
    const points = [];

    // Budget
    if (breakdown.budget.normalized >= 0.7) {
        points.push(`✅ **Highly affordable** — its cost (₹${winner.input.budget.toLocaleString()}) offers excellent value, well within a comfortable range compared to alternatives.`);
    } else if (breakdown.budget.normalized >= 0.4) {
        points.push(`✅ **Reasonably priced** — its cost (₹${winner.input.budget.toLocaleString()}) is competitive among the destinations evaluated.`);
    } else {
        points.push(`⚠️ **Higher cost** (₹${winner.input.budget.toLocaleString()}), but its advantages in other areas compensate.`);
    }

    // Travel time
    if (breakdown.travelTimeHours.normalized >= 0.7) {
        points.push(`✅ **Quick to reach** — travel time of ${winner.input.travelTimeHours}h is among the shortest of all options.`);
    } else if (breakdown.travelTimeHours.normalized >= 0.4) {
        points.push(`✅ **Moderate travel time** of ${winner.input.travelTimeHours}h — acceptable for most itineraries.`);
    }

    // Safety
    if (breakdown.safetyRating.normalized >= 0.7) {
        points.push(`✅ **High safety rating** of ${winner.input.safetyRating}/10 — a standout in this comparison.`);
    } else if (breakdown.safetyRating.normalized >= 0.4) {
        points.push(`✅ **Adequate safety rating** of ${winner.input.safetyRating}/10 — meets standard expectations.`);
    }

    // Weather
    if (breakdown.weatherSuitability.normalized >= 0.7) {
        points.push(`✅ **Excellent weather suitability** score of ${winner.input.weatherSuitability}/10 for your travel period.`);
    }

    // User rating
    if (breakdown.userRating.normalized >= 0.7) {
        points.push(`✅ **Top-rated** with a user rating of ${winner.input.userRating}/10 — highly recommended by travellers.`);
    } else if (breakdown.userRating.normalized >= 0.4) {
        points.push(`✅ **Well-rated** by travellers at ${winner.input.userRating}/10.`);
    }

    // Overall summary
    const winnerScore = (winner.score * 100).toFixed(1);
    const secondPlace = allResults[1];
    if (secondPlace) {
        const gap = ((winner.score - secondPlace.score) * 100).toFixed(1);
        points.push(`🏆 **Final Score: ${winnerScore}%** — beating the runner-up (${secondPlace.name}) by ${gap} points.`);
    } else {
        points.push(`🏆 **Final Score: ${winnerScore}%** — the clear best choice.`);
    }

    return points;
};

/**
 * Main evaluation function.
 * @param {Array} destinations - Array of destination input objects from the user
 * @returns {Array} Ranked results with scores and explanations
 */
const evaluateDestinations = (destinations) => {
    if (!destinations || destinations.length === 0) return [];

    // Edge case: single destination
    if (destinations.length === 1) {
        const d = destinations[0];
        const breakdown = {};
        [...COST_FACTORS, ...BENEFIT_FACTORS].forEach(factor => {
            breakdown[factor] = {
                rawValue: d[factor],
                normalized: 1,
                weight: WEIGHTS[factor],
                contribution: WEIGHTS[factor]
            };
        });
        return [{
            name: d.name,
            rank: 1,
            score: 1,
            input: d,
            scoreBreakdown: breakdown,
            explanationPoints: generateExplanation({ name: d.name, score: 1, input: d, scoreBreakdown: breakdown }, [])
        }];
    }

    // Step 1: Compute min and max for each factor across all destinations
    const stats = {};
    [...COST_FACTORS, ...BENEFIT_FACTORS].forEach(factor => {
        const values = destinations.map(d => d[factor]);
        stats[factor] = {
            min: Math.min(...values),
            max: Math.max(...values)
        };
    });

    // Step 2: Score each destination
    const scored = destinations.map(d => {
        const breakdown = {};
        let totalScore = 0;

        COST_FACTORS.forEach(factor => {
            const { min, max } = stats[factor];
            const normalized = normalize(d[factor], min, max, true);
            const contribution = normalized * WEIGHTS[factor];
            totalScore += contribution;
            breakdown[factor] = {
                rawValue: d[factor],
                normalized: parseFloat(normalized.toFixed(4)),
                weight: WEIGHTS[factor],
                contribution: parseFloat(contribution.toFixed(4))
            };
        });

        BENEFIT_FACTORS.forEach(factor => {
            const { min, max } = stats[factor];
            const normalized = normalize(d[factor], min, max, false);
            const contribution = normalized * WEIGHTS[factor];
            totalScore += contribution;
            breakdown[factor] = {
                rawValue: d[factor],
                normalized: parseFloat(normalized.toFixed(4)),
                weight: WEIGHTS[factor],
                contribution: parseFloat(contribution.toFixed(4))
            };
        });

        return {
            name: d.name,
            score: parseFloat(totalScore.toFixed(4)),
            input: d,
            scoreBreakdown: breakdown
        };
    });

    // Step 3: Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    // Step 4: Assign ranks and generate explanations
    const ranked = scored.map((item, index) => ({
        ...item,
        rank: index + 1,
        explanationPoints: index === 0 ? generateExplanation(item, scored) : []
    }));

    return ranked;
};

module.exports = {
    evaluateDestinations,
    WEIGHTS
};
