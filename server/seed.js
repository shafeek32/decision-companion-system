const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CatalogDestination = require('./models/CatalogDestination');

dotenv.config();

// 99999 means the mode of travel is unavailable or highly impractical for that destination.
// Costs are in INR (Indian Rupees).
// Distances are in KM from major Kerala cities.

const seedDestinations = [

    // ─── Inside Kerala ────────────────────────────────────────────────────
    {
        name: 'Munnar',
        scope: 'Inside Kerala',
        landType: 'Hill station',
        weather: 'Cool',
        distanceFromMajorCities: { Kochi: 130, Trivandrum: 280, Calicut: 280 },
        hotelCostPerDay: 2500,
        foodCostPerDay: 1000,
        baseTravelCost: { Bike: 500, Bus: 350, Car: 1500, Train: 99999, Flight: 99999 },
        imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=1000'
    },
    {
        name: 'Varkala',
        scope: 'Inside Kerala',
        landType: 'Beach',
        weather: 'Warm',
        distanceFromMajorCities: { Kochi: 160, Trivandrum: 45, Calicut: 320 },
        hotelCostPerDay: 2000,
        foodCostPerDay: 1200,
        baseTravelCost: { Bike: 600, Bus: 400, Car: 2000, Train: 300, Flight: 99999 },
        imageUrl: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&q=80&w=1000'
    },
    {
        name: 'Wayanad',
        scope: 'Inside Kerala',
        landType: 'Forest',
        weather: 'Moderate',
        distanceFromMajorCities: { Kochi: 260, Trivandrum: 450, Calicut: 85 },
        hotelCostPerDay: 3000,
        foodCostPerDay: 1200,
        baseTravelCost: { Bike: 800, Bus: 500, Car: 2500, Train: 99999, Flight: 99999 },
        imageUrl: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&q=80&w=1000'
    },
    {
        name: 'Kochi',
        scope: 'Inside Kerala',
        landType: 'City',
        weather: 'Warm',
        distanceFromMajorCities: { Kochi: 0, Trivandrum: 200, Calicut: 190 },
        hotelCostPerDay: 2000,
        foodCostPerDay: 1500,
        baseTravelCost: { Bike: 200, Bus: 150, Car: 500, Train: 200, Flight: 99999 },
        imageUrl: 'https://images.unsplash.com/photo-1627964177242-eb4bcbfd0d82?auto=format&fit=crop&q=80&w=1000'
    },
    {
        name: 'Alleppey (Alappuzha)',
        scope: 'Inside Kerala',
        landType: 'Beach',
        weather: 'Warm',
        distanceFromMajorCities: { Kochi: 55, Trivandrum: 155, Calicut: 255 },
        hotelCostPerDay: 3500,  // Houseboats are popular and pricier
        foodCostPerDay: 1400,
        baseTravelCost: { Bike: 300, Bus: 200, Car: 1000, Train: 200, Flight: 99999 },
        imageUrl: 'https://images.unsplash.com/photo-1593181629936-11c609b8db9b?auto=format&fit=crop&q=80&w=1000'
    },
    {
        name: 'Kumarakom',
        scope: 'Inside Kerala',
        landType: 'Forest',
        weather: 'Warm',
        distanceFromMajorCities: { Kochi: 70, Trivandrum: 170, Calicut: 270 },
        hotelCostPerDay: 4000,
        foodCostPerDay: 1500,
        baseTravelCost: { Bike: 350, Bus: 250, Car: 1200, Train: 250, Flight: 99999 },
        imageUrl: 'https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?auto=format&fit=crop&q=80&w=1000'
    },
    {
        name: 'Kovalam',
        scope: 'Inside Kerala',
        landType: 'Beach',
        weather: 'Warm',
        distanceFromMajorCities: { Kochi: 220, Trivandrum: 16, Calicut: 390 },
        hotelCostPerDay: 3000,
        foodCostPerDay: 1300,
        baseTravelCost: { Bike: 700, Bus: 450, Car: 2200, Train: 350, Flight: 2500 },
        imageUrl: 'https://images.unsplash.com/photo-1583000567685-7a7a4ed05c8a?auto=format&fit=crop&q=80&w=1000'
    },
    {
        name: 'Thekkady (Periyar)',
        scope: 'Inside Kerala',
        landType: 'Forest',
        weather: 'Cool',
        distanceFromMajorCities: { Kochi: 190, Trivandrum: 260, Calicut: 340 },
        hotelCostPerDay: 2800,
        foodCostPerDay: 1100,
        baseTravelCost: { Bike: 700, Bus: 500, Car: 2000, Train: 99999, Flight: 99999 },
        imageUrl: 'https://images.unsplash.com/photo-1562612265-234a3d8e0d88?auto=format&fit=crop&q=80&w=1000'
    },
    {
        name: 'Thrissur',
        scope: 'Inside Kerala',
        landType: 'City',
        weather: 'Warm',
        distanceFromMajorCities: { Kochi: 75, Trivandrum: 270, Calicut: 115 },
        hotelCostPerDay: 1500,
        foodCostPerDay: 900,
        baseTravelCost: { Bike: 250, Bus: 180, Car: 700, Train: 150, Flight: 99999 },
        imageUrl: 'https://images.unsplash.com/photo-1627894486516-1e84e3cbedf4?auto=format&fit=crop&q=80&w=1000'
    },

    // ─── Outside Kerala (India) ────────────────────────────────────────────
    {
        name: 'Goa',
        scope: 'Outside Kerala (India)',
        landType: 'Beach',
        weather: 'Warm',
        distanceFromMajorCities: { Kochi: 800, Trivandrum: 950, Calicut: 600 },
        hotelCostPerDay: 4000,
        foodCostPerDay: 2000,
        baseTravelCost: { Bike: 2500, Bus: 1800, Car: 8000, Train: 1500, Flight: 4000 },
        imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e4f2?auto=format&fit=crop&q=80&w=1000'
    },
    {
        name: 'Ooty',
        scope: 'Outside Kerala (India)',
        landType: 'Hill station',
        weather: 'Cool',
        distanceFromMajorCities: { Kochi: 280, Trivandrum: 450, Calicut: 150 },
        hotelCostPerDay: 3500,
        foodCostPerDay: 1500,
        baseTravelCost: { Bike: 1000, Bus: 700, Car: 3000, Train: 1000, Flight: 99999 },
        imageUrl: 'https://images.unsplash.com/photo-1585144860106-99858bf868c5?auto=format&fit=crop&q=80&w=1000'
    },
    {
        name: 'Coorg (Madikeri)',
        scope: 'Outside Kerala (India)',
        landType: 'Hill station',
        weather: 'Cool',
        distanceFromMajorCities: { Kochi: 270, Trivandrum: 450, Calicut: 150 },
        hotelCostPerDay: 4000,
        foodCostPerDay: 1600,
        baseTravelCost: { Bike: 900, Bus: 650, Car: 2800, Train: 99999, Flight: 99999 },
        imageUrl: 'https://images.unsplash.com/photo-1609557927087-f9cf8e88de18?auto=format&fit=crop&q=80&w=1000'
    },
    {
        name: 'Pondicherry',
        scope: 'Outside Kerala (India)',
        landType: 'Beach',
        weather: 'Warm',
        distanceFromMajorCities: { Kochi: 600, Trivandrum: 700, Calicut: 700 },
        hotelCostPerDay: 3000,
        foodCostPerDay: 1500,
        baseTravelCost: { Bike: 1800, Bus: 1200, Car: 6000, Train: 1200, Flight: 4500 },
        imageUrl: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&q=80&w=1000'
    },
    {
        name: 'Manali',
        scope: 'Outside Kerala (India)',
        landType: 'Hill station',
        weather: 'Cold',
        distanceFromMajorCities: { Kochi: 3400, Trivandrum: 3600, Calicut: 3200 },
        hotelCostPerDay: 3000,
        foodCostPerDay: 1200,
        baseTravelCost: { Bike: 99999, Bus: 3000, Car: 99999, Train: 99999, Flight: 7000 },
        imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=1000'
    },
    {
        name: 'Shimla',
        scope: 'Outside Kerala (India)',
        landType: 'Hill station',
        weather: 'Cold',
        distanceFromMajorCities: { Kochi: 3100, Trivandrum: 3300, Calicut: 2900 },
        hotelCostPerDay: 2800,
        foodCostPerDay: 1100,
        baseTravelCost: { Bike: 99999, Bus: 2800, Car: 99999, Train: 2500, Flight: 6500 },
        imageUrl: 'https://images.unsplash.com/photo-1575120171527-a32b04673bd8?auto=format&fit=crop&q=80&w=1000'
    },
    {
        name: 'Mumbai',
        scope: 'Outside Kerala (India)',
        landType: 'City',
        weather: 'Warm',
        distanceFromMajorCities: { Kochi: 1200, Trivandrum: 1400, Calicut: 1000 },
        hotelCostPerDay: 5000,
        foodCostPerDay: 2500,
        baseTravelCost: { Bike: 99999, Bus: 2200, Car: 99999, Train: 2000, Flight: 5000 },
        imageUrl: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&q=80&w=1000'
    },
    {
        name: 'Bangalore',
        scope: 'Outside Kerala (India)',
        landType: 'City',
        weather: 'Moderate',
        distanceFromMajorCities: { Kochi: 540, Trivandrum: 720, Calicut: 360 },
        hotelCostPerDay: 4000,
        foodCostPerDay: 2000,
        baseTravelCost: { Bike: 1600, Bus: 1000, Car: 5000, Train: 900, Flight: 3500 },
        imageUrl: 'https://images.unsplash.com/photo-1526711657229-e7e080ed7aa1?auto=format&fit=crop&q=80&w=1000'
    },
    {
        name: 'Andaman Islands',
        scope: 'Outside Kerala (India)',
        landType: 'Beach',
        weather: 'Warm',
        distanceFromMajorCities: { Kochi: 1900, Trivandrum: 2100, Calicut: 1800 },
        hotelCostPerDay: 5000,
        foodCostPerDay: 2200,
        baseTravelCost: { Bike: 99999, Bus: 99999, Car: 99999, Train: 99999, Flight: 9000 },
        imageUrl: 'https://images.unsplash.com/photo-1586004104279-01f78ccbdf1f?auto=format&fit=crop&q=80&w=1000'
    },

    // ─── Outside India ─────────────────────────────────────────────────────
    {
        name: 'Bali',
        scope: 'Outside India',
        landType: 'Beach',
        weather: 'Warm',
        distanceFromMajorCities: { Kochi: 4500, Trivandrum: 4500, Calicut: 4500 },
        hotelCostPerDay: 5000,
        foodCostPerDay: 2500,
        baseTravelCost: { Bike: 99999, Bus: 99999, Car: 99999, Train: 99999, Flight: 25000 },
        imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1000'
    },
    {
        name: 'Dubai',
        scope: 'Outside India',
        landType: 'City',
        weather: 'Warm',
        distanceFromMajorCities: { Kochi: 2800, Trivandrum: 2900, Calicut: 2700 },
        hotelCostPerDay: 8000,
        foodCostPerDay: 4000,
        baseTravelCost: { Bike: 99999, Bus: 99999, Car: 99999, Train: 99999, Flight: 15000 },
        imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=1000'
    },
    {
        name: 'Singapore',
        scope: 'Outside India',
        landType: 'City',
        weather: 'Warm',
        distanceFromMajorCities: { Kochi: 3300, Trivandrum: 3500, Calicut: 3200 },
        hotelCostPerDay: 9000,
        foodCostPerDay: 3000,
        baseTravelCost: { Bike: 99999, Bus: 99999, Car: 99999, Train: 99999, Flight: 18000 },
        imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80&w=1000'
    },
    {
        name: 'Thailand (Bangkok)',
        scope: 'Outside India',
        landType: 'City',
        weather: 'Warm',
        distanceFromMajorCities: { Kochi: 3700, Trivandrum: 3900, Calicut: 3600 },
        hotelCostPerDay: 4500,
        foodCostPerDay: 2000,
        baseTravelCost: { Bike: 99999, Bus: 99999, Car: 99999, Train: 99999, Flight: 15000 },
        imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&q=80&w=1000'
    },
    {
        name: 'Maldives',
        scope: 'Outside India',
        landType: 'Beach',
        weather: 'Warm',
        distanceFromMajorCities: { Kochi: 700, Trivandrum: 700, Calicut: 700 },
        hotelCostPerDay: 15000,  // Premium resort pricing
        foodCostPerDay: 5000,
        baseTravelCost: { Bike: 99999, Bus: 99999, Car: 99999, Train: 99999, Flight: 20000 },
        imageUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&q=80&w=1000'
    },
    {
        name: 'Nepal (Kathmandu)',
        scope: 'Outside India',
        landType: 'Hill station',
        weather: 'Cool',
        distanceFromMajorCities: { Kochi: 2800, Trivandrum: 3000, Calicut: 2600 },
        hotelCostPerDay: 3500,
        foodCostPerDay: 1500,
        baseTravelCost: { Bike: 99999, Bus: 99999, Car: 99999, Train: 99999, Flight: 12000 },
        imageUrl: 'https://images.unsplash.com/photo-1585516482738-e505b6f3ed89?auto=format&fit=crop&q=80&w=1000'
    },
    {
        name: 'Sri Lanka (Colombo)',
        scope: 'Outside India',
        landType: 'City',
        weather: 'Warm',
        distanceFromMajorCities: { Kochi: 550, Trivandrum: 500, Calicut: 700 },
        hotelCostPerDay: 4000,
        foodCostPerDay: 1800,
        baseTravelCost: { Bike: 99999, Bus: 99999, Car: 99999, Train: 99999, Flight: 8000 },
        imageUrl: 'https://images.unsplash.com/photo-1580674285054-bb1e7ea3f90c?auto=format&fit=crop&q=80&w=1000'
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/decision_companion');
        console.log('✅ Connected to Database. Purging old data...');
        await CatalogDestination.deleteMany({});
        console.log(`🌱 Inserting ${seedDestinations.length} destinations...`);
        await CatalogDestination.insertMany(seedDestinations);
        console.log('🎉 Database seeded successfully!');
        console.log(`   Total: ${seedDestinations.length} destinations`);
        console.log(`   Inside Kerala: ${seedDestinations.filter(d => d.scope === 'Inside Kerala').length}`);
        console.log(`   Outside Kerala (India): ${seedDestinations.filter(d => d.scope === 'Outside Kerala (India)').length}`);
        console.log(`   Outside India: ${seedDestinations.filter(d => d.scope === 'Outside India').length}`);
    } catch (err) {
        console.error('❌ Error seeding data:', err);
    } finally {
        mongoose.connection.close();
    }
};

seedDB();

