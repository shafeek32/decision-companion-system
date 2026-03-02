# 🌍 Decision Companion System

Hey there! Welcome to the **Decision Companion System**. 

Have you ever tried planning a trip with friends or family, only to get completely overwhelmed by conflicting opinions, budgets, and travel constraints? Yeah, us too. 

That's exactly why this project exists. It's an intelligent, MERN-stack travel assistant disguised as a friendly chat interface. You tell it your budget, how you're traveling, and who you're going with, and it mathematically evaluates and ranks the absolute best destinations for your specific situation.

---

## Your understanding of the problem

Planning a trip is stressful. Usually, you look at a list of generic places and just guess what works best. But what if you have ₹50,000, 4 days, and want a beach vibe? 

The core problem isn't just suggesting destinations; it's about **multi-criteria decision-making with explainability**. We wanted to build something that doesn't just throw links at you. It needs to take your specific inputs, crunch the numbers (travel time, safety, weather, budget), and give you a transparent, ranked recommendation so you actually understand *why* a certain destination won.

## Assumptions made

To make the math work predictably in this version, we assumed a few things:
*   **Fixed Scoring Weights:** We assume everyone values budget the most (35%), followed by travel time (20%), distance (15%), safety (15%), weather (10%), and user rating (5%).
*   **Cost Estimates:** We assumed hotel rooms accommodate 2 people. We also assumed car travel costs scale per vehicle (like 4 people sharing gas), while Train/Flight/Bus costs scale linearly per person.
*   **Database Completeness:** We assume our underlying catalog (`CatalogDestination`) contains enough varied destination data to provide meaningful recommendations across different budgets, modes, and "Outside India" filters.
*   **Base Travel Speed:** When exact data is missing, we use rough estimates for travel time calculations (e.g., Train=60km/h, Flight=500km/h, Car/Bus=50km/h).

## Why you structured the solution the way you did

We built this to feel like a modern app, not a static spreadsheet:

*   **The MERN Stack:** We used MongoDB, Express, React, Node.js because it’s fast, handles JSON data beautifully, and makes it super easy to grow our non-relational catalog of destinations.
*   **The Chat Interface:** Originally, we thought about using a giant, boring form. Bad idea. Instead, we structured the frontend as a conversational UI (`ChatLayout.jsx`). It asks you one question at a time—like a real travel agent—so you don't feel overwhelmed, and it actively skips unnecessary questions (like asking for member count if you're traveling alone).
*   **The Decoupled Math Engine:** Behind the scenes, we isolated the calculation logic into a `scoringService.js`. This decoupling makes testing the mathematical model straightforward and allows the logic to be reused independently of the Express route handlers.

## Design decisions and trade-offs

*   **Weighted Sum Model (WSM) vs. Complex ML:**
    *   *Decision:* We used a transparent, deterministic mathematical model (Min-Max normalization + WSM) instead of a Machine Learning model.
    *   *Trade-off:* While ML might discover more subtle patterns, WSM guarantees **explainability**. You can literally look at the output table and see exactly why one destination scored 95% and another scored 60%.
*   **Min-Max Normalization:**
    *   *Decision:* All metrics are normalized to a 0-1 scale. Cost-based metrics (budget, time) are inverted so lower values score higher.
    *   *Trade-off:* Min-Max is sensitive to outliers. If one destination is extraordinarily expensive, it can skew the normalization range for the others. However, it is mathematically simple and works exceptionally well for scoped geographic constraints.
*   **Dynamic UI Fallbacks:**
    *   *Decision:* The React `Results` component dynamically gracefully checks for missing verbose fields. 
    *   *Trade-off:* If the backend suggest API omits certain `explanation` strings to save bandwidth or execution time, the frontend falls back rather than crashing, increasing robustness at the cost of slightly more complex rendering code.

## Edge cases considered

Building a math-based system means preparing for weird data:

*   **What if everything costs the exact same?** The engine catches it and assigns a perfect normalized score of 1 instead of crashing with a divide-by-zero (`NaN`) error perfectly balancing the weights.
*   **What if you're totally broke?** The system dynamically multiplies realistic hotel and food prices by the exact number of travel days and travel companions. If your budget is physically too low for *any* destination in our database based on your group size, the system gracefully tells you it couldn't find a match instead of breaking.
*   **Missing Data Fallbacks:** If the seeded database catalog is accidentally missing a user rating, the system gracefully falls back to an average subjective score (like 8/10) so the math keeps running perfectly.

## How to run the project

Want to take it for a spin? Here's how to get it running locally.

**First, you'll need:**
*   Node.js (v18 or higher)
*   MongoDB (A local instance or a free Atlas URI string)

**1. Clone the repo down to your machine.**

**2. Start the Backend:**
```bash
cd server
npm install
node seed.js # Run this once to populate your database with cool destinations!
npm run dev
```
*(The backend runs on `http://localhost:5000`)*

**3. Start the Frontend:**
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```
*(The React app will boot up on `http://localhost:5173`)*

## What you would improve with more time

We're super proud of this, but software is never really "done". If we kept working on it, we'd add:

*   **User-Customizable Weights:** Let users slide bars to express preferences and prioritize budget over safety, or vice versa, instead of hardcoding the backend array.
*   **Live Booking APIs:** Hook up real Skyscanner or Booking.com APIs so the flight and hotel prices fluctuate in real-time instead of relying on our seed catalog estimates.
*   **Even More Mobile Polish:** The conversational chat UI looks great, but rendering giant data comparison charts flawlessly on tiny phone screens is always a fun challenge to iterate on!
*   **Performance Tracking Metrics:** Implement system logging for average response time and user drop-off points in the chat flow.
