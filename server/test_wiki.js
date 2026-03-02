const axios = require('axios');

async function test() {
    try {
        const res = await axios.post('http://localhost:5000/api/destinations/suggest', {
            startLocation: 'Kochi',
            modeOfTravel: 'Flight',
            totalBudget: 50000,
            memberCount: 2,
            landType: 'Any',
            isOutsideIndia: true
        });
        console.log(JSON.stringify(res.data, null, 2));
    } catch (err) {
        if (err.response) {
            console.error(err.response.data);
        } else {
            console.error(err.message);
        }
    }
}

test();
