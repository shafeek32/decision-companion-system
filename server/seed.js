const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Destination = require('./models/Destination');

dotenv.config();

const seedDestinations = [
    {
        name: 'Munnar',
        scope: 'Inside Kerala',
        landType: 'Hill station',
        weather: 'Cool',
        distanceFromMajorCities: { Kochi: 130, Trivandrum: 280, Calicut: 280 },
        hotelCostPerDay: 2500,
        foodCostPerDay: 1000,
        baseTravelCost: { Car: 1500, Train: 99999, Flight: 99999 }, // 99999 means unavailable/impractical
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
        baseTravelCost: { Car: 2000, Train: 300, Flight: 99999 },
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
        baseTravelCost: { Car: 2500, Train: 99999, Flight: 99999 },
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
        baseTravelCost: { Car: 500, Train: 200, Flight: 99999 },
        imageUrl: 'https://images.unsplash.com/photo-1627964177242-eb4bcbfd0d82?auto=format&fit=crop&q=80&w=1000'
    },
    {
        name: 'Goa',
        scope: 'Outside Kerala (India)',
        landType: 'Beach',
        weather: 'Warm',
        distanceFromMajorCities: { Kochi: 800, Trivandrum: 950, Calicut: 600 },
        hotelCostPerDay: 4000,
        foodCostPerDay: 2000,
        baseTravelCost: { Car: 8000, Train: 1500, Flight: 4000 },
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
        baseTravelCost: { Car: 3000, Train: 1000, Flight: 99999 },
        imageUrl: 'https://images.unsplash.com/photo-1585144860106-99858bf868c5?auto=format&fit=crop&q=80&w=1000'
    },
    {
        name: 'Bali',
        scope: 'Outside India',
        landType: 'Beach',
        weather: 'Warm',
        distanceFromMajorCities: { Kochi: 4500, Trivandrum: 4500, Calicut: 4500 }, // approximated
        hotelCostPerDay: 5000,
        foodCostPerDay: 2500,
        baseTravelCost: { Car: 99999, Train: 99999, Flight: 25000 },
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
        baseTravelCost: { Car: 99999, Train: 99999, Flight: 15000 },
        imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=1000'
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/decision_companion');
        console.log('Connected to Database. Purging old data...');
        await Destination.deleteMany({});
        console.log('Inserting seed data...');
        await Destination.insertMany(seedDestinations);
        console.log('Database seeded successfully!');
    } catch (err) {
        console.error('Error seeding data:', err);
    } finally {
        mongoose.connection.close();
    }
};

seedDB();
