# BUILD_PROCESS.md

## 🧭 Project Direction

For this assignment, I decided to build a Decision Companion System focused on **travel planning within constraints**. Instead of creating a completely generic decision tool, I narrowed the scope to a realistic use case: helping users choose the best travel destination based on budget, time, and preferences.

I chose this domain because travel decisions naturally involve trade-offs, making them ideal for a structured decision-support system.

---

## 🚀 How I Started

Initially, I explored building a fully generic weighted decision engine where users could dynamically create criteria and options. While technically flexible, I realized it felt abstract and less relatable.

After reflecting on the assignment goals, I shifted toward a more concrete domain. Travel planning stood out because:

* It involves measurable constraints (budget, days, distance).
* It includes subjective preferences (hill, beach, city).
* It allows meaningful explanation of results.

I then defined a smaller, focused scope and began designing the backend architecture.

---

## 🧠 How My Thinking Evolved

At first, I assumed decision-making could be handled by directly comparing raw values like cost or ratings. However, I recognized that:

* Raw values are not directly comparable.
* Constraints should eliminate invalid options before scoring.
* Users need explanation, not just a final answer.

This led me to design a two-step evaluation process:

1. **Constraint Filtering (Hard Rules)**
   Destinations that exceed budget or available days are removed before scoring.

2. **Weighted Scoring Model (Soft Evaluation)**
   Remaining destinations are ranked using weighted scoring across multiple criteria.

I intentionally chose a deterministic algorithm rather than AI-driven prediction to maintain transparency and explainability.

---

## 🔄 Alternative Approaches Considered

During development, I considered:

### ❌ Fully AI-driven recommendation

Rejected because it would reduce transparency and introduce black-box behavior.

### ❌ Rule-based if/else system

Rejected because it would not scale well as criteria increase.

### ❌ Pure minimum-cost selection

Rejected because cheapest does not always mean best.

### ✅ Weighted Scoring Model (Chosen)

Selected because it:

* Is mathematically grounded.
* Is easy to explain.
* Scales across criteria.
* Aligns with rational decision-support systems.

---

## 🛠️ Architectural Decisions

To keep the code maintainable and modular, I separated responsibilities into:

* **Routes** → Handle HTTP requests.
* **Services** → Contain decision logic and scoring algorithms.
* **Models** → Define data structure for destinations.

This separation ensures that business logic remains independent from request-handling code.

I also added a health check endpoint early to verify backend stability during development.

---

## ⚠️ Mistakes and Corrections

1. **Initial scoring without filtering**
   I initially scored all destinations before checking constraints.
   → This produced misleading results.
   → I corrected this by adding a strict filtering stage first.

2. **Overcomplicating weight calculations**
   My early implementation tried to dynamically rebalance weights.
   → This added unnecessary complexity.
   → I simplified by requiring normalized weights.

3. **Mixing logic inside route handlers**
   Early versions had scoring logic directly inside controllers.
   → I refactored this into a service layer for better structure.

Each correction improved clarity and reliability.

---

## 🔁 What Changed During Development and Why

* **Domain narrowed from generic decisions to travel planning**
  → To make the system more realistic and demonstrable.

* **Added explanation generation**
  → Because decision support requires justification, not just ranking.

* **Separated filtering and scoring logic**
  → To better reflect real-world decision processes.

* **Simplified architecture**
  → To prioritize clarity over unnecessary abstraction.

These changes reflect a shift from simply “building something that works” to designing something intentional and explainable.

---

## ✅ Current System Capabilities

The system can:

* Accept user-defined travel constraints.
* Filter invalid destinations.
* Apply a weighted scoring model.
* Rank available options.
* Generate a human-readable explanation of the result.

---

## 🚀 Future Improvements

If extended further, I would:

* Add dynamic weight adjustment via frontend controls.
* Incorporate real travel datasets or APIs.
* Add personalization based on user history.
* Improve explanation generation using natural language templates.

---

## 🧩 Final Reflection

This project reinforced the importance of clarity in decision systems. A good recommendation engine should not just compute a result but also communicate reasoning transparently.

The focus throughout development was to balance mathematical objectivity with user understanding, ensuring that the system remains both rational and explainable.
