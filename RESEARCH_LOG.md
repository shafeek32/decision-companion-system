# Research Log — Decision Companion System

This document records all AI prompts used, reference material consulted, search queries made, and decisions about what was accepted, modified, or rejected from AI suggestions during the development of the Smart Destination Decision System.

---

## Prompt 1 — System Architecture Design

**Prompt:**
> Act as a senior full-stack MERN architect. I want to transform my project into an intelligent Smart Destination Decision System that evaluates multiple travel destinations using constraints like budget, travel time, distance, safety, weather, and user rating. The system must automatically assign weights (budget highest priority), normalize values, rank destinations, and provide explanations. Suggest proper backend and frontend architecture using MERN.

**Search Queries Ran:**
- "MERN stack travel recommendation system architecture"
- "weighted sum model for multi-criteria decision making Node.js"
- "how to structure Express.js service layer for scoring"

**References That Influenced the Approach:**
- MCDM (Multi-Criteria Decision Making) theory articles on weighted scoring
- MongoDB documentation on `Mixed` schema types for flexible nested objects
- Express.js routing best practice guides (separating `routes/api.js` from `server/index.js`)

**What Was Accepted:**
- Layered backend structure: Routes → Service Layer (`scoringService.js`) → MongoDB
- Dedicated `CatalogDestination` model separated from `TripEvaluation` model
- REST API approach with `/api/evaluate` and `/api/destinations/suggest` endpoints

**What Was Modified:**
- Originally the AI proposed a single `Destination` model for both catalog data and user session history. We split this into two separate models (`CatalogDestination` and `TripEvaluation`) to keep concerns clean.

**What Was Rejected:**
- A GraphQL API layer was initially suggested. We rejected this due to added complexity for a project of this scope. Plain REST was sufficient.

---

## Prompt 2 — Hybrid Suggestion Flow

**Prompt:**
> I need a hybrid travel decision system where users can either provide their own destination options or let the system automatically suggest destinations. The system should filter destinations by affordability first, then apply ranking. Users should not manually set weights.

**Search Queries Ran:**
- "travel planner app user journey flow design"
- "decision support system filtering before ranking pattern"
- "React chat interface state machine design"

**References That Influenced the Approach:**
- ChatGPT's own chat UI as a UX pattern reference
- React documentation on controlled state and `useState` hooks

**What Was Accepted:**
- The two-branch chat flow: "Yes, I have destinations in mind" vs "No, suggest for me"
- Filtering by affordability (`estimatedTotalCost <= totalBudget`) as the very first step before scoring
- The sequential chat-style question flow in `ChatLayout.jsx`

**What Was Modified:**
- The auto-suggest path was extended with additional filters: `landType` (Beach, Hill station, City, Forest) and `isOutsideIndia`. The original AI suggestion only included a budget filter.

**What Was Rejected:**
- A slider-based UI for weights was suggested but rejected because it contradicts the "non-technical user" goal. We want the system to be smart enough to handle weights automatically.

---

## Prompt 3 — Min-Max Normalization and WSM Implementation

**Prompt:**
> Explain how to implement min–max normalization for both cost-type and benefit-type constraints and apply the Weighted Sum Model in Node.js for ranking travel destinations.

**Search Queries Ran:**
- "min-max normalization formula cost vs benefit criteria"
- "divide by zero handling min-max normalization JavaScript"
- "Weighted Sum Model implementation JavaScript array"

**References That Influenced the Approach:**
- Wikipedia: Min-Max feature scaling
- Towards Data Science: "Multi-Criteria Decision Making with WSM"

**What Was Accepted:**
- `normalizedScore = (value - min) / (max - min)` for benefit criteria (safety, rating, weather)
- `normalizedScore = (max - value) / (max - min)` for cost criteria (budget, travel time, distance)
- Fallback: if `min === max`, assign `normalizedScore = 1` to prevent `NaN`
- Final score: `Σ (normalizedValue × weight)` across all criteria

**What Was Modified:**
- The AI suggested hardcoding the weight array inline in the route handler. We moved it to `scoringService.js` as a constant at the top of the file to keep it centrally configurable.

**What Was Rejected:**
- Using `Math.log()` for non-linear normalization of budget was suggested but rejected. It added complexity without a meaningful benefit for our dataset size.

---

## Prompt 4 — Budget Comparison and Cost Estimation

**Prompt:**
> How should I compare total user budget with estimated trip cost and filter out destinations that exceed the budget before applying the scoring algorithm?

**Search Queries Ran:**
- "hotel cost estimation per person per night formula"
- "how travel apps estimate trip cost budget India"
- "car travel cost per km shared vehicle India"

**References That Influenced the Approach:**
- Indian travel blogs (MakeMyTrip, TripAdvisor India estimates)
- Reddit threads on realistic Kerala family trip budgets

**What Was Accepted:**
- `estimatedHotelCost = hotelCostPerDay × tripDays × Math.ceil(memberCount / 2)`
- `estimatedFoodCost = foodCostPerDay × tripDays × memberCount`
- `estimatedTransportCost = baseTravelCost[mode]` (from catalog), scaled per person for Train/Flight/Bus, per vehicle for Car
- `if estimatedTotalCost > totalBudget → exclude destination`

**What Was Modified:**
- Initial AI suggestion used a flat per-person hotel rate. We changed hotel cost to scale per room (2 people per room) to better reflect real-world pricing.
- Trip days were initially hardcoded at `3`. We made this dynamic after user input (`tripDays` from the chat flow).

**What Was Rejected:**
- Suggestion to include "visa costs" and "travel insurance" in budget estimation. Rejected for the MVP scope as data would need a third-party API to be accurate.

---

## Prompt 5 — Additional Constraints

**Prompt:**
> What additional constraints can I add to a travel decision system to make it more realistic and competitive (e.g., crowd level, visa requirement, season suitability, family friendliness)?

**Search Queries Ran:**
- "travel constraints for decision support system"
- "family friendly travel destination features database schema"
- "tourist crowd level data for Indian destinations"

**References That Influenced the Approach:**
- Government tourism data for occupancy patterns by season
- Lonely Planet destination reviews for family suitability

**What Was Accepted:**
- `landType` (Hill station, Beach, City, Forest, Any) — implemented as a conversational filter
- `scope` (Inside Kerala / Outside Kerala / Outside India) — implemented as the "Outside India" constraint
- `weather` as a qualitative rating field in the catalog

**What Was Modified:**
- `crowd level` was suggested as a numeric field (1-10). We simplified it to being implicitly captured through `userRating` in the scoring engine.
- `season suitability` was proposed as an array of month tags. We simplified to the `weather` string field for MVP.

**What Was Rejected:**
- `visaRequired` boolean field. Rejected for MVP as it can't be validated without a live API.
- `familyFriendly` rating field. Rejected because it's too subjective and would require survey data we don't have.

---

## Prompt 6 — Seed Data Review

**Prompt:**
> Review my seed.js data for destinations and suggest improvements to make it production-ready, scalable, and realistic. Identify any bad practices like magic numbers.

**Search Queries Ran:**
- "seed.js best practices MongoDB Mongoose"
- "realistic hotel costs per night India 2024"
- "flight prices Kochi to Dubai Bali Singapore"

**References That Influenced the Approach:**
- MakeMyTrip real-time pricing for reference (Jan-March 2026)
- Booking.com hotel averages per destination
- IRCTC train fare charts Kochi → popular destinations

**What Was Accepted:**
- Adding a comment block at the top of `seed.js` explaining `99999` convention for impractical routes
- Grouping destinations by scope using visual separators for readability
- Printing a breakdown summary after seed completes (`Inside Kerala: X, Outside India: Y`)
- Expanding from 8 to 25 destinations with realistic pricing

**What Was Modified:**
- AI-suggested using a `const UNAVAILABLE = 99999` named constant. We kept the inline value since it's already documented in the comment block and the codebase is small.

**What Was Rejected:**
- Suggestion to move seed data to a separate `.json` file and import it. Rejected to keep things in one file for simplicity.

---

## Prompt 7 — Conversational Chat UI

**Prompt:**
> Design a conversational chat-based UI flow for collecting travel constraints step by step instead of using a large static form.

**Search Queries Ran:**
- "React chat interface with state machine"
- "step by step form wizard vs chat UI UX comparison"
- "ChatGPT style input design React Tailwind"

**References That Influenced the Approach:**
- ChatGPT's UI as the primary UX reference
- React docs on `useEffect`, `useState`, and `useRef` for auto-scroll
- Lucide React icon library for chat icons

**What Was Accepted:**
- Sequential messaging state machine in `ChatLayout.jsx`
- System messages (bot) styled with light gray background, left-aligned
- User messages styled as white with border, right-aligned
- Clickable button options rendered inside system messages
- `useRef` for auto-scroll to bottom on every new message

**What Was Modified:**
- AI originally proposed a single `step` counter for navigation. Replaced with a richer `type` field on each message object (e.g., `ASK_LOCATION`, `ASK_BUDGET`, `ASK_OUTSIDE_INDIA`) to allow branching logic.
- The "Undo" feature was not in the original AI suggestion. We independently designed and implemented a `history` stack to snapshot `tripData` at every transition.

**What Was Rejected:**
- Suggestion to use a third-party chatbot library (e.g., `react-chatbot-kit`). Rejected — building the state machine manually gave us full control over branching logic.
- Animation libraries for message transitions. Rejected to keep dependencies minimal.

---

## Prompt 8 — Weight Distribution Design

**Prompt:**
> Suggest an intelligent default weight distribution where budget has the highest priority and the total weight equals 1 for the Weighted Sum Model.

**Search Queries Ran:**
- "travel decision criteria weights budget priority"
- "AHP analytic hierarchy process travel destination"

**References That Influenced the Approach:**
- Academic research on Analytic Hierarchy Process (AHP) for travel planning
- Survey- and opinion-based weight distributions from travel decision papers

**Final Weights Adopted:**

| Criteria         | Weight | Reasoning                                      |
|------------------|--------|------------------------------------------------|
| Budget fit       | 0.35   | Highest priority — most trips fail over budget |
| Travel time      | 0.20   | Second most critical for a short trip          |
| Distance         | 0.15   | Correlated with time but still distinct        |
| Safety           | 0.15   | Critical for family travelers                  |
| Weather          | 0.10   | Important but seasonal and subjective          |
| User rating      | 0.05   | Supporting factor, not primary driver          |

**What Was Accepted:**
- Budget at 35% weight was exactly as suggested
- Weather at 10% was agreed to be lower importance

**What Was Modified:**
- AI suggested Safety at 10% and Rating at 15%. We reversed these — we felt safety is more important than social ratings, especially for family trips.

**What Was Rejected:**
- Suggesting "crowd level" as a 6th criteria. Rejected for same reason as Prompt 5.

---

## Prompt 9 — README.md Documentation

**Prompt:**
> Help me write a professional README.md explaining problem understanding, assumptions, architecture decisions, edge cases, and future improvements.

**Search Queries Ran:**
- "professional README.md template open source project"
- "how to document an MCDM decision system in README"

**References That Influenced the Approach:**
- GitHub's official README best practices guide
- Open source MERN project READMEs on GitHub for formatting style

**What Was Accepted:**
- Structured README with exactly the 7 sections required:
  1. Your understanding of the problem
  2. Assumptions made
  3. Why you structured the solution the way you did
  4. Design decisions and trade-offs
  5. Edge cases considered
  6. How to run the project
  7. What you would improve with more time
- Friendly, conversational tone rather than dry technical writing

**What Was Modified:**
- AI generated a very dry, bullet-point only README. We rewrote it in a more humanized, first-person narrative tone while keeping all the technical accuracy intact.
- Added a section describing all new features added: Undo button, Outside India filter, land type filter, dynamic cost scaling.

**What Was Rejected:**
- AI included an "API Endpoints" reference table in the README. Rejected — endpoints are already documented in `BUILD_PROCESS.md` to avoid duplication.

---

## Summary Table

| Prompt | Topic                        | Accepted | Modified | Rejected |
|--------|------------------------------|----------|----------|----------|
| 1      | System Architecture          | ✅ Layered MERN | Split model into 2 schemas | GraphQL API |
| 2      | Hybrid Suggestion Flow       | ✅ Two-branch chat flow | Added extra filters | Weight sliders |
| 3      | Normalization + WSM          | ✅ Full formula | Moved weights to service | Log normalization |
| 4      | Budget + Cost Estimation     | ✅ Room-based hotel scaling | Made tripDays dynamic | Visa/insurance costs |
| 5      | Additional Constraints       | ✅ landType + scope | Simplified crowd/season | visaRequired, familyFriendly |
| 6      | Seed Data Review             | ✅ 25 destinations, comments | Kept inline 99999 | Separate JSON file |
| 7      | Conversational Chat UI       | ✅ State machine type system | Added Undo feature | Chatbot library |
| 8      | Weight Distribution          | ✅ Budget at 35% | Swapped Safety/Rating weights | Crowd level criteria |
| 9      | README Documentation         | ✅ 7-section structure | Added humanized tone + new features | API table |
