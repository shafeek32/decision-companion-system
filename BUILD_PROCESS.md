# Build Process — Smart Destination Decision System

This document records the complete development journey of the Smart Destination Decision System, including decisions made, mistakes encountered and corrected, architectural pivots, and every major iteration from concept to the current working state.

---

## 🧭 Project Direction

For this project, I built a **Decision Companion System** focused on intelligent travel planning. The core idea is to help users choose the best travel destination based on a set of personal constraints — budget, travel mode, trip duration, group size, and destination preference — using a transparent mathematical ranking engine.

I chose the **travel domain** because:
- Travel decisions naturally involve measurable trade-offs (cost, time, distance).
- They also include subjective factors (vibes, weather, experience type).
- The result can be meaningfully explained in plain language.

---

## 🚀 How It Started

I initially explored building a fully generic weighted decision engine where users could define their own criteria dynamically. While technically flexible, this felt abstract and hard to demonstrate.

After reflection, I narrowed the scope to travel planning with a fixed set of criteria, which made the system immediately practical and demonstrable. From there I defined:

1. A clear **set of criteria** to evaluate: Budget, Travel Time, Distance, Safety, Weather, User Rating
2. A clean **two-branch user flow**: users with destinations in mind vs. users who want suggestions
3. A **MERN stack** implementation with a separated scoring service layer

---

## 🧠 How Thinking Evolved

**Phase 1: Static Form UI**
The first version used a large, multi-field HTML form where users filled in everything at once. While functional, it was overwhelming and didn't feel intelligent.

**Phase 2: Chat Interface**
Replaced the static form with a step-by-step conversational chat UI (`ChatLayout.jsx`). Each question appears one at a time, messages are styled like a messaging app, and clickable button options replace dropdowns.

**Phase 3: Branching Constraints**
Added a branching state machine to the chat. Instead of always asking the same fixed questions, the system now dynamically routes users:
- If user has destinations → skip suggestion flow → collect each destination manually
- If user wants suggestions → apply filters → auto-suggest from database

**Phase 4: Richer Filters**
Extended the filtering with two new conversational constraints:
- **Land Type** (Beach, Hill Station, City, Forest, Any)
- **Outside India** (the system asks whether the trip is domestic or international and filters the catalog accordingly)

**Phase 5: Undo Feature**
Added a `history` stack in state. Before every user action, the current `tripData` is snapshotted. The "Back" button pops the stack and removes the last message pair from the UI, allowing users to go back and change any answer without restarting.

**Phase 6: Wikipedia Fallback Engine**
If a user provided extreme constraints (e.g. "Outside India" + "Any" experience) the static database catalog eventually couldn't keep up. Integrated the `wikipediaService.js` to dynamically fall back to a curated list of ~55 global real-world destinations, fetching pristine, descriptive, and image-rich Wikipedia pages on the fly.

**Phase 7: Exact Distance Mathematical Generation**
Random travel distances created logical inconsistencies (e.g. Paris showing as a 3000km drive). Overhauled the `wikipediaService.js` generation logic to use hardcoded baseline `distanceKm` mappings representing accurate travel distances from India to global cities. Travel time costs now use literal mathematical flight formulas.

---

## 🔄 Alternative Approaches Considered and Rejected

| Approach | Reason Rejected |
|---|---|
| Fully AI-driven recommendation | Black-box — can't explain the result |
| Rule-based if/else scoring | Doesn't scale as criteria increase |
| Pure cheapest-option selection | Cheap ≠ best, ignores other factors |
| GraphQL API layer | Overkill for this project scope |
| Third-party chatbot library (react-chatbot-kit) | Limits custom branching control |
| Dynamic weight sliders for users | Contradicts "smart auto-recommendation" goal |
| Visa/insurance costs in budget | Would require live API data to be accurate |

---

## 🔑 Core Algorithm

**Two-step evaluation pipeline:**

### Step 1 — Hard Constraint Filtering
Destinations are removed if their estimated total cost exceeds the user's budget.

```
estimatedHotelCost = hotelCostPerDay × tripDays × ceil(memberCount / 2)
estimatedFoodCost  = foodCostPerDay × tripDays × memberCount
estimatedTransport = baseTravelCost[mode] × (scaled per person or per vehicle)
estimatedTotal     = hotel + food + transport

if estimatedTotal > totalBudget → EXCLUDE
```

### Step 2 — Weighted Sum Model (WSM) Scoring
Remaining destinations are ranked using min-max normalized scores across six criteria.

**Weight Distribution:**
| Criterion     | Weight | Reasoning |
|---------------|--------|-----------|
| Budget Fit    | 0.35   | Top priority — most trips fail over budget |
| Travel Time   | 0.20   | Critical for short trips |
| Distance      | 0.15   | Correlated with time but distinct |
| Safety        | 0.15   | Important for family travelers |
| Weather       | 0.10   | Seasonal and subjective |
| User Rating   | 0.05   | Supporting signal only |

**Normalization Logic:**
- Benefit criteria (Safety, Rating, Weather score): `(value - min) / (max - min)`
- Cost criteria (Budget, Time, Distance): `(max - value) / (max - min)`
- If `min === max`: assign `1` to avoid divide-by-zero

---

## 🛠️ Architectural Decisions

```
client/
  src/
    components/
      ChatLayout.jsx     ← Main state machine + chat UI
      ChatMessage.jsx    ← Renders individual messages
      Results.jsx        ← Displays ranked results + chart
      DestinationMiniForm.jsx ← Inline form for manual destination entry

server/
  models/
    CatalogDestination.js  ← Destination catalog schema (read-only reference)
    TripEvaluation.js      ← Records of user-submitted trips and results
  routes/
    api.js                 ← All REST endpoints
  services/
    scoringService.js      ← Pure scoring + normalization logic
    wikipediaService.js    ← Dynamic external Wikipedia fetching + Exact Mapping
  seed.js                  ← Database population script (25 destinations)
```

**Why two separate models?**
`CatalogDestination` is the destination library — it's seeded, static, and filterable. `TripEvaluation` records what users submitted and what results were returned. Mixing them would corrupt the catalog with user-specific trip data.

**Why a service layer?**
All math lives in `scoringService.js` independent of Express. This means the scoring algorithm can be unit-tested in complete isolation from HTTP request handling.

---

## 📡 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/evaluate` | Accept user destinations + constraints, run WSM, return ranked results |
| `POST` | `/api/destinations/suggest` | Filter catalog by budget, scope, and landType; return top suggestions |
| `GET`  | `/api/history` | Return all past trip evaluations from database |

**Key parameters for `/api/destinations/suggest`:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `startLocation` | String | Starting city for distance lookup |
| `modeOfTravel` | String | Car / Train / Flight / Bus / Bike |
| `memberCount` | Number | Group size (affects hotel + food scaling) |
| `tripDays` | Number | Duration in days |
| `totalBudget` | Number | Maximum ₹ budget for the whole trip |
| `landType` | String | Beach / Hill station / City / Forest / Any |
| `isOutsideIndia` | Boolean | Filters by `scope` field in catalog |

---

## ⚠️ Mistakes Encountered and Fixed

### 1. Scoring before filtering
**Problem:** Early versions ran all destinations through the scoring engine before applying budget constraints. This produced misleading rankings where over-budget destinations appeared in results.
**Fix:** Added a strict filtering stage before scoring. Destinations that fail budget math are excluded before any normalization.

### 2. Dynamic weight rebalancing
**Problem:** An early attempt dynamically redistributed weights based on which criteria a user "cared about." This caused weights to no longer sum to 1 reliably.
**Fix:** Fixed the weight array as a constant in `scoringService.js`. Weights are clearly documented and always sum to exactly 1.0.

### 3. Scoring logic inside route handlers
**Problem:** The first working version had WSM calculations written directly inside the Express route callback in `api.js`. Testing it required an active HTTP server.
**Fix:** Extracted all scoring logic into `scoringService.js`. The route just calls the service, unpacks the result, and returns JSON.

### 4. Duplicate messages (React Strict Mode bug)
**Problem:** A `setTimeout` was placed inside a `setTripData` state updater callback. React Strict Mode double-invokes state updaters in development, causing two bot messages to appear for one user action.
**Fix:** Moved the `setTimeout` call outside the state updater so it runs exactly once as a side effect.

### 5. Single model for catalog + user history
**Problem:** The original `Destination` model was used both for the catalog and to record user trip evaluations. This caused the suggest endpoint to return user sessions instead of catalog data.
**Fix:** Created dedicated `CatalogDestination` and `TripEvaluation` schemas. Added a `seed.js` script to populate CatalogDestination independently.

### 6. Validation errors breaking input type
**Problem:** When users entered invalid data (e.g., letters in a budget field), the system showed an error but the next input no longer knew what question it was answering. The `type` context was lost.
**Fix:** Error messages now carry the same `type` as the original question (e.g., `ASK_BUDGET`), so the input box stays correctly bound.

---

## 🔁 Key Iterations and Why

| What Changed | Why |
|---|---|
| Static form → Chat UI | Reduces cognitive load, feels modern and guided |
| Fixed 3-day duration → Dynamic `tripDays` | Real trips are not all 3 days |
| Raw score comparison → min-max normalization | Apples-to-apples comparison across different units |
| Hardcoded destinations → MongoDB catalog | Makes the system dynamic and scalable |
| Single model → Two models | Clean separation of concerns |
| Basic chat → Branching state machine | Supports both "I know where" and "suggest me" flows |
| No undo → History stack + Back button | Forgiving UX — mistakes shouldn't restart everything |
| India only → Outside India filter | International trips have different cost profiles |
| Fixed experience → Land type filter | Match user's vibe (beach vs. hills vs. city) |
| Flat hotel cost → Per-room scaled by days | More accurate real-world cost modelling |
| Static Catalog Walls → Wikipedia API Fallback | Infinite suggestions when DB doesn't have matches |
| Randomized distance logic → Exact Distance Mapping | Prevents logical impossibilities (e.g. 100km drives to Paris) |

---

## ✅ Current System Capabilities

The system can currently:

- Collect travel constraints via a conversational chat interface
- Route users through two branches: manual destination entry OR auto-suggestion
- Ask whether the user wants domestic or international travel
- Ask what type of experience the user wants (beach, hill station, city, forest)
- Filter the destination catalog by budget, scope, land type, and travel mode
- **Gracefully fallback to querying the Wikipedia API against a curated list of ~55 authentic global cities to pull authentic datasets when DB options are exhausted**
- Apply Min-Max normalization across 6 scored criteria
- Rank viable destinations using the Weighted Sum Model
- Generate natural-language explanations for the top recommendation
- Display a comparison table and polar chart for all ranked destinations
- Allow users to undo any previous answer with the "Back" button
- Allow users to start fresh with the "New Chat" button

---

## � Future Improvements

With more time, I would:

- **User-configurable weights** — Let users adjust priority sliders so someone who cares more about safety than budget can express that.
- **Live pricing APIs** — Integrate Skyscanner, IRCTC, and Booking.com so costs are real-time, not seeded estimates.
- **Mobile responsiveness** — The polar chart and comparison table need specific treatment for small screens.
- **User account system** — Save past trips per user so the system can learn preferences over time.
- **Performance logging** — Track which destinations get suggested most, where users drop off in the chat, and average session length.
- **Multi-language support** — Add Tamil, Hindi, and Malayalam chat prompts for broader accessibility.

---

## 🧩 Final Reflection

This project reinforced that a good decision support system must be two things simultaneously: **mathematically rigorous** and **humanly understandable**.

The most important lesson was that explainability is not a feature you bolt on at the end — it's a design constraint you start with. By choosing a transparent WSM over an opaque ML model, every score in the system can be traced back to a simple formula and explained in plain language.

The chat UI was an unexpected win. Users naturally trust a system that "asks them questions" more than one that presents a form. That shift from passive form to active conversation made the whole experience feel fundamentally different.
