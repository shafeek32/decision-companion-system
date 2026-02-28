const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const DestinationModel = require('./models/CatalogDestination');

async function testLogic() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/decision_companion');
    console.log('Connected to DB');

    const startLocation = "Kochi";
    const modeOfTravel = "Car";
    const totalBudget = 50000;
    const memberCount = 4;

    const allDestinations = await DestinationModel.find({});
    console.log(`Found ${allDestinations.length} destinations`);

    const validDestinations = allDestinations.filter(dest => {
        const tripDays = 7;
        const numRooms = Math.ceil(memberCount / 2);
        const hotelCost = dest.hotelCostPerDay * tripDays * numRooms;
        const foodCost = dest.foodCostPerDay * tripDays * memberCount;

        let travelCost = dest.baseTravelCost?.[modeOfTravel] || 99999;
        if (travelCost === 99999) return false;

        let totalTravelCost = travelCost * memberCount;
        if (modeOfTravel === 'Car') {
            const numCars = Math.ceil(memberCount / 4);
            totalTravelCost = travelCost * numCars;
        }

        const estimatedTotalCost = hotelCost + foodCost + totalTravelCost;
        console.log(`${dest.name}: Hotel ${hotelCost}, Food ${foodCost}, Travel ${totalTravelCost} = Total ${estimatedTotalCost}. Fits? ${estimatedTotalCost <= totalBudget}`);
        return estimatedTotalCost <= totalBudget;
    });

    console.log(`Valid destinations matching: ${validDestinations.length}`);
    mongoose.connection.close();
}

testLogic();
