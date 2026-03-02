# 🏗️ Decision Companion System — Architecture

This document contains visual diagrams describing the architecture, data flow, component hierarchy, and core decision logic of the Smart Destination Decision System. All diagrams reflect the current implementation state.

---

## 1. High-Level Architecture

The system is split into three layers: a **React/Vite frontend** served on port 5173, an **Express.js backend API** running on port 3000, and a **MongoDB** database managed via Mongoose.

```mermaid
graph TD
    classDef client fill:#e0f2fe,stroke:#0284c7,stroke-width:2px;
    classDef server fill:#dcfce7,stroke:#16a34a,stroke-width:2px;
    classDef database fill:#fef08a,stroke:#ca8a04,stroke-width:2px;

    subgraph Client ["Frontend — React / Vite (port 5173)"]
        UI([💬 ChatLayout — State Machine]):::client
        Form([📝 DestinationForm]):::client
        Results([📊 Results & Polar Chart]):::client
    end

    subgraph Server ["Backend — Node.js / Express (port 3000)"]
        Router([🌐 /api Router]):::server
        ScoringEngine([⚙️ WSM Scoring Engine]):::server
    end

    subgraph Database [MongoDB]
        TripHistory[(📜 TripEvaluation\nCollection)]:::database
        Catalog[(🧭 CatalogDestination\nCollection)]:::database
    end

    UI -- POST /api/evaluate --> Router
    UI -- POST /api/destinations/suggest --> Router
    UI -- GET  /api/history --> Router
    Router -- Orchestrates --> ScoringEngine
    Router -- Read/Write --> TripHistory
    Router -- Read --> Catalog
```

---

## 2. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/evaluate` | Manually rank 2+ user-provided destinations via WSM |
| `POST` | `/api/destinations/suggest` | Auto-suggest & rank destinations from the catalog |
| `GET`  | `/api/history` | Return the last 10 saved trip evaluations |

---

## 3. Data Flow — Manual Ranking Mode (`POST /api/evaluate`)

The user manually enters destination details; the engine ranks them using the Weighted Sum Model.

```mermaid
sequenceDiagram
    participant User
    participant ChatLayout
    participant APIRouter as API Router
    participant ScoringService
    participant DB as MongoDB (TripEvaluation)

    User->>ChatLayout: Fills DestinationForm (location, mode, 2+ destinations)
    ChatLayout->>APIRouter: POST /api/evaluate
    APIRouter->>APIRouter: Validate required fields & rating ranges (1–10)
    APIRouter->>ScoringService: evaluateDestinations(destinations)
    ScoringService->>ScoringService: Compute min/max per factor
    ScoringService->>ScoringService: Min-max normalize (cost-type inverted)
    ScoringService->>ScoringService: Multiply by WEIGHTS, sum → final score
    ScoringService->>ScoringService: Generate plain-English explanation for winner
    ScoringService-->>APIRouter: Ranked array with scoreBreakdown
    APIRouter->>DB: trip.save() (async, non-blocking)
    APIRouter-->>ChatLayout: { winner, rankedResults, weightsUsed, count }
    ChatLayout->>User: Renders Results (table + polar chart)
```

---

## 4. Data Flow — Auto-Suggest Mode (`POST /api/destinations/suggest`)

The user provides constraints; the system filters the catalog and returns the top 5 affordable destinations.

```mermaid
sequenceDiagram
    participant User
    participant ChatLayout
    participant APIRouter as API Router
    participant Catalog as MongoDB (CatalogDestination)
    participant ScoringService

    User->>ChatLayout: Inputs constraints (location, mode, budget, days, members, filters)
    ChatLayout->>APIRouter: POST /api/destinations/suggest
    APIRouter->>Catalog: find({}) — fetch all catalog entries
    Catalog-->>APIRouter: All destinations
    APIRouter->>APIRouter: Filter by landType (if set)
    APIRouter->>APIRouter: Filter by scope / isOutsideIndia (if set)
    APIRouter->>APIRouter: Calculate estimated cost per destination\n(hotel + food + travel × members/rooms)
    APIRouter->>APIRouter: Discard destinations where cost > totalBudget
    APIRouter->>ScoringService: evaluateDestinations(validDestinations)
    ScoringService-->>APIRouter: Ranked array
    APIRouter-->>ChatLayout: { rankedResults: top 5, count }
    ChatLayout->>User: Renders Results (table + polar chart)
```

---

## 5. Frontend Component Tree

```mermaid
classDiagram
    class App {
        <<Root Container>>
        Renders ChatLayout
    }
    class ChatLayout {
        +Object tripData
        +Array messages
        +handleInputSubmit()
        +initiateSuggestion()
        +initiateRanking()
        +handleUndo()
    }
    class ChatMessage {
        +String role
        +String content
        +render()
    }
    class DestinationForm {
        +captureConstraints()
        +validateNumbers()
        +handleAddDestination()
        +handleRemoveDestination()
    }
    class Results {
        +renderPolarChart()
        +renderRankingTable()
        +renderWinnerExplanation()
    }

    App *-- ChatLayout : Renders
    ChatLayout *-- ChatMessage : Maps messages array to
    ChatLayout *-- DestinationForm : Conditionally embeds
    ChatLayout *-- Results : Conditionally embeds
```

---

## 6. MongoDB Data Models

### `TripEvaluation` (Manual Ranking History)

```
TripEvaluationSchema
├── startLocation        String  (required)
├── modeOfTravel         String  (required) — Car | Bike | Bus | Train | Flight
├── destinations[]
│   ├── name             String
│   ├── budget           Number  (₹, total estimated cost)
│   ├── travelTimeHours  Number
│   ├── distanceKm       Number
│   ├── safetyRating     Number  (1–10)
│   ├── weatherSuitability Number (1–10)
│   ├── userRating       Number  (1–10)
│   └── imageUrl         String
├── results[]
│   ├── name             String
│   ├── score            Number
│   ├── rank             Number
│   └── scoreBreakdown   Mixed
└── createdAt            Date
```

### `CatalogDestination` (Auto-Suggest Catalog)

```
CatalogDestinationSchema
├── name                 String  (required)
├── scope                String  — "Within India" | "Outside India"
├── landType             String  — "Beach" | "Hills" | "City" | "Forest" | …
├── weather              String
├── distanceFromMajorCities  Mixed  — { Kochi: 130, Trivandrum: 280, … }
├── hotelCostPerDay      Number  (₹ per room per day)
├── foodCostPerDay       Number  (₹ per person per day)
├── baseTravelCost       Mixed   — { Bike: 500, Bus: 350, Car: 1500, Train: 2200, Flight: 5500 }
├── imageUrl             String
└── createdAt            Date
```

---

## 7. Scoring Algorithm (WSM)

The **Weighted Sum Model** inside `scoringService.js` operates in four steps:

```mermaid
flowchart TD
    classDef process fill:#f3f4f6,stroke:#4b5563,stroke-width:2px;
    classDef decision fill:#bfdbfe,stroke:#2563eb,stroke-width:2px;
    classDef action fill:#dcfce7,stroke:#16a34a,stroke-width:2px;

    Start((Start)) --> FindMinMax["Step 1 — Find Min & Max\nfor each factor across all destinations"]:::process
    FindMinMax --> Normalize["Step 2 — Min-Max Normalize\neach factor value to [0, 1]"]:::process

    Normalize --> CostBenefit{Factor type?}:::decision
    CostBenefit -- "Cost (lower = better)\nBudget · TravelTime · Distance" --> Invert["Inverted: (max − v) / (max − min)"]:::process
    CostBenefit -- "Benefit (higher = better)\nSafety · Weather · UserRating" --> Proportional["Standard: (v − min) / (max − min)"]:::process

    Invert --> ApplyWeights["Step 3 — Multiply normalized value × weight"]:::process
    Proportional --> ApplyWeights

    ApplyWeights --> Sum["Step 4 — Sum contributions = Final Score"]:::action
    Sum --> Sort["Sort descending by score"]:::action
    Sort --> Explanation["Generate plain-English explanation\nfor rank-1 winner only"]:::process
    Explanation --> End(("Return ranked array"))
```

### System Weights (fixed)

| Factor | Weight | Type |
|--------|--------|------|
| Budget (₹) | **0.35** | Cost — lower is better |
| Travel Time (hours) | **0.20** | Cost — lower is better |
| Distance (km) | **0.15** | Cost — lower is better |
| Safety Rating (1–10) | **0.15** | Benefit — higher is better |
| Weather Suitability (1–10) | **0.10** | Benefit — higher is better |
| User Rating (1–10) | **0.05** | Benefit — higher is better |
| **Total** | **1.00** | |
