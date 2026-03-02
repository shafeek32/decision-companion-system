const { suggestFromWikipedia } = require('./services/wikipediaService');

async function test() {
    try {
        const res = await suggestFromWikipedia('Kochi', 'Any', true, 50000, 'Flight', 2);
        console.log(JSON.stringify(res, null, 2));
    } catch (err) {
        console.error(err);
    }
}

test();
