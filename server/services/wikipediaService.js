const axios = require('axios');

const DOMESTIC_CITIES = [
    { name: 'Goa', type: 'Beach', distanceKm: 700 }, // From Kochi
    { name: 'Munnar', type: 'Hill station', distanceKm: 130 },
    { name: 'Manali, Himachal Pradesh', type: 'Hill station', distanceKm: 2800 },
    { name: 'Shimla', type: 'Hill station', distanceKm: 2700 },
    { name: 'Udaipur', type: 'City', distanceKm: 1900 },
    { name: 'Jaipur', type: 'City', distanceKm: 2200 },
    { name: 'Varanasi', type: 'City', distanceKm: 2400 },
    { name: 'Darjeeling', type: 'Hill station', distanceKm: 2600 },
    { name: 'Ooty', type: 'Hill station', distanceKm: 280 },
    { name: 'Andaman and Nicobar Islands', type: 'Beach', distanceKm: 1800 }, // Flight over sea
    { name: 'Rishikesh', type: 'City', distanceKm: 2600 },
    { name: 'McLeod Ganj', type: 'Hill station', distanceKm: 2900 },
    { name: 'Agra', type: 'City', distanceKm: 2300 },
    { name: 'Jaisalmer', type: 'City', distanceKm: 2300 },
    { name: 'Coorg', type: 'Hill station', distanceKm: 340 },
    { name: 'Puducherry', type: 'Beach', distanceKm: 530 },
    { name: 'Srinagar', type: 'Hill station', distanceKm: 3300 },
    { name: 'Hampi', type: 'City', distanceKm: 800 },
    { name: 'Gokarna', type: 'Beach', distanceKm: 650 },
    { name: 'Leh', type: 'Hill station', distanceKm: 3500 },
    { name: 'Wayanad', type: 'Forest', distanceKm: 250 },
    { name: 'Jim Corbett National Park', type: 'Forest', distanceKm: 2500 },
    { name: 'Kaziranga National Park', type: 'Forest', distanceKm: 3100 },
    { name: 'Varkala', type: 'Beach', distanceKm: 160 },
    { name: 'Kodaikanal', type: 'Hill station', distanceKm: 300 }
];

const INTERNATIONAL_CITIES = [
    { name: 'Paris', type: 'City', distanceKm: 8100 }, // Approx from India
    { name: 'Rome', type: 'City', distanceKm: 6800 },
    { name: 'Tokyo', type: 'City', distanceKm: 6500 },
    { name: 'London', type: 'City', distanceKm: 8300 },
    { name: 'New York City', type: 'City', distanceKm: 13500 },
    { name: 'Dubai', type: 'City', distanceKm: 2800 },
    { name: 'Singapore', type: 'City', distanceKm: 3200 },
    { name: 'Bali', type: 'Beach', distanceKm: 4200 },
    { name: 'Bangkok', type: 'City', distanceKm: 2500 },
    { name: 'Istanbul', type: 'City', distanceKm: 5500 },
    { name: 'Amsterdam', type: 'City', distanceKm: 8000 },
    { name: 'Barcelona', type: 'Beach', distanceKm: 8200 },
    { name: 'Sydney', type: 'Beach', distanceKm: 9200 },
    { name: 'Kyoto', type: 'City', distanceKm: 6400 },
    { name: 'Cape Town', type: 'Beach', distanceKm: 7600 },
    { name: 'Prague', type: 'City', distanceKm: 7100 },
    { name: 'Venice', type: 'City', distanceKm: 6700 },
    { name: 'Rio de Janeiro', type: 'Beach', distanceKm: 14000 },
    { name: 'Machu Picchu', type: 'Hill station', distanceKm: 16500 },
    { name: 'Santorini', type: 'Beach', distanceKm: 5400 },
    { name: 'Maldives', type: 'Beach', distanceKm: 1100 },
    { name: 'Mauritius', type: 'Beach', distanceKm: 3800 },
    { name: 'Phuket Province', type: 'Beach', distanceKm: 2600 },
    { name: 'Hong Kong', type: 'City', distanceKm: 4200 },
    { name: 'Seoul', type: 'City', distanceKm: 5600 },
    { name: 'Zermatt', type: 'Hill station', distanceKm: 7200 },
    { name: 'Banff, Alberta', type: 'Hill station', distanceKm: 12500 },
    { name: 'Amazon rainforest', type: 'Forest', distanceKm: 15000 },
    { name: 'Borneo', type: 'Forest', distanceKm: 3800 }
];

/**
 * Shuffles an array and returns the top N items.
 */
function getRandomCities(cityList, limit) {
    const shuffled = [...cityList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
}

/**
 * Searches Wikipedia for destinations based on constraints.
 * @param {string} startLocation - Original starting city (e.g., Kochi).
 * @param {string} landType - Hill station, Beach, City, Forest, or Any.
 * @param {boolean} isOutsideIndia - true or false.
 * @param {number} totalBudget - Total trip budget (helps filter/simulate).
 * @returns {Array} - List of destination objects suitable for the scoring service.
 */
async function suggestFromWikipedia(startLocation, landType, isOutsideIndia, totalBudget, modeOfTravel, memberCount) {
    try {
        // Step 1: Select Random Real Cities
        let targetList = isOutsideIndia ? INTERNATIONAL_CITIES : DOMESTIC_CITIES;

        // Filter by user preference if not 'Any'
        if (landType !== 'Any') {
            const filtered = targetList.filter(city => city.type === landType);
            if (filtered.length > 0) {
                targetList = filtered;
            }
        }

        const selectedCities = getRandomCities(targetList, 5);
        const selectedTitles = selectedCities.map(c => c.name);

        // Step 2: Fetch details directly for these exact titles
        const searchUrl = `https://en.wikipedia.org/w/api.php`;
        const headers = { 'User-Agent': 'DecisionCompanionApp/1.0 (contact@example.com)' };

        const detailsRes = await axios.get(searchUrl, {
            params: {
                action: 'query',
                prop: 'pageimages|extracts',
                exintro: '1',
                explaintext: '1',
                piprop: 'original',
                titles: selectedTitles.join('|'),
                format: 'json'
            },
            headers
        });

        const pages = detailsRes.data?.query?.pages || {};

        let validDestinations = [];

        for (const pageId in pages) {
            const p = pages[pageId];
            if (!p.title) continue;

            const imageUrl = p.original?.source || 'https://images.unsplash.com/photo-1488646953014-c8cb19684b55?q=80&w=800&auto=format&fit=crop';

            // Clean title (remove Wikipedia disambiguations like ", Himachal Pradesh")
            const cleanName = p.title.split(',')[0];

            // Find the exact original city object for hardcoded distance
            const originalCity = selectedCities.find(c => p.title.toLowerCase().startsWith(c.name.split(',')[0].toLowerCase()));
            const distanceKm = originalCity ? originalCity.distanceKm : (isOutsideIndia ? 8000 : 1500);

            // Travel time calculation based on mode (using realistic speeds for India/Intl)
            let travelTimeHours = distanceKm / 60; // default car/bus 60km/h
            if (modeOfTravel === 'Flight') travelTimeHours = (distanceKm / 750) + 3; // +3 hrs for airport prep
            if (modeOfTravel === 'Train') travelTimeHours = distanceKm / 70; // Avg Train speed

            // Generate Budget
            let finalBudget;
            if (isOutsideIndia) {
                // International budgets are heavily inflated by flights and exchange rates
                const baseFlightCost = distanceKm * 8;
                const hotelFoodCost = (Math.random() * 15000 + 10000) * memberCount; // 10k-25k per person
                finalBudget = baseFlightCost + hotelFoodCost;

                // For international, strictly punish budgets if the user only has 10k by showing realistic limits
                if (finalBudget < 40000) finalBudget = Math.floor(Math.random() * 40000) + 40000;
            } else {
                // Domestic budgets scale gently based on accurate distance
                let baseDestBudget = (distanceKm * 5) + (memberCount * 2000);
                const maxAllowedBudget = Math.max(totalBudget + 5000, 10000);
                const scalingFactor = (Math.random() * 0.8) + 0.3; // 0.3 to 1.1 multiplier
                finalBudget = Math.floor(Math.min(baseDestBudget, maxAllowedBudget) * scalingFactor);
                if (finalBudget < 2000) finalBudget = 2000;
            }

            // Simulate subjective ratings
            const safetyRating = (Math.random() * 3) + 7; // 7 to 10
            const weatherSuitability = (Math.random() * 4) + 6; // 6 to 10
            const userRating = (Math.random() * 1.5) + 8.5; // 8.5 to 10

            validDestinations.push({
                name: cleanName,
                budget: Math.floor(finalBudget),
                travelTimeHours: Number(travelTimeHours.toFixed(1)),
                distanceKm: distanceKm,
                safetyRating: Number(safetyRating.toFixed(1)),
                weatherSuitability: Number(weatherSuitability.toFixed(1)),
                userRating: Number(userRating.toFixed(1)),
                imageUrl: imageUrl,
                description: p.extract ? p.extract.substring(0, 200) + '...' : ''
            });
        }

        return validDestinations;

    } catch (error) {
        console.error("Wikipedia API Error:", error.message);
        return [];
    }
}

module.exports = { suggestFromWikipedia };
