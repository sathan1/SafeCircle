# SafeCircle — Privacy-First Progressive Emergency Protection System

SafeCircle is an intelligent personal safety platform engineered around a core principle: **presence in a safety circle does not grant blanket access to private data**. By coupling contextual route planning and explainable anomaly signals with a deterministic Safety State Engine and a progressive Privacy Permission Engine, SafeCircle dynamically governs what information trusted contacts can access as journey conditions evolve.

---

## 1. Problem & Objective

### The Problem
Traditional personal safety applications rely on an **all-or-nothing privacy model**. Either a user must broadcast their continuous, precise live GPS coordinates to friends or family at all times, or they remain completely unmonitored during potential emergencies. Furthermore, conventional safety apps frequently produce false alarms, lack transparent explainability, and make unrealistic claims about device capabilities (such as tracking a phone after shutdown or secretly recording without OS notice).

### The Objective
SafeCircle resolves this dilemma through **Progressive Emergency Protection**:
- During routine travel, precise locations and sensitive details are strictly withheld.
- When explainable anomalies occur (e.g. route deviation, prolonged stationary stop, missed prompt), the system steps through calibrated safety tiers (`NORMAL` → `CAUTION` → `ELEVATED` → `CRISIS`).
- At each tier, access is unlocked **only** according to the user's pre-configured disclosure policy.

---

## 2. Core Innovation: Privacy-First Escalation

Traditional model:
```
Trusted Contact ──► Complete Unrestricted Access (At All Times)
```

SafeCircle model:
```
Trusted Contact
      ↓
Privacy Permission Policy (Per-contact, user-configured)
      ↓
Current Safety State (Evaluated by deterministic rules)
      ↓
Allowed Information Packet (Coarse status, approx area, or live GPS)
```

### Safety Tiers & Progressive Disclosures
| Safety State | System Description | Default Allowed Disclosures |
| :--- | :--- | :--- |
| **NORMAL** (0–29 pts) | Route conforms to corridor timetable. Routine baseline. | Journey Status only. Live GPS and exact details strictly stripped. |
| **CAUTION** (30–49 pts) | Mild variance detected (e.g., 400m detour, 8 min stationary). | Journey Status & Emergency Notice. Approximate area optional. Live GPS stripped. |
| **ELEVATED** (50–74 pts) | Repeated missed check-ins or multiple compounding signals. | Approximate Location & Journey Trajectory disclosed to primary contacts. |
| **CRISIS** (75–100 pts) | Explicit SOS beacon triggered or prolonged unresponsiveness. | Full Live GPS telemetry and route details unlocked per user's emergency policy. |

---

## 3. System Architecture

SafeCircle operates across two coordinated architectural pipelines:

### 1. Journey & Safety Intelligence Pipeline
```
USER APP
  ↓
JOURNEY (Origin, Destination, Timetable, Recipient Circle)
  ↓
SAFEPATH (Contextual alternative route selection with safety signals)
  ↓
JOURNEY EVENTS (Deviation, prolonged stop, check-in timeout, battery)
  ↓
ANOMALY INTELLIGENCE (Explainable signal analysis & pattern confidence)
  ↓
SAFETY STATE ENGINE (Sole authority evaluating cumulative score & thresholds)
  ↓
SAFETY STATE (NORMAL, CAUTION, ELEVATED, CRISIS)
  ↓
PRIVACY PERMISSION ENGINE (Evaluates per-contact policy against safety state)
  ↓
CONTACT-SPECIFIC INFORMATION (Server-side stripped, zero data leakage)
  ↓
ESCALATION / COMMUNICATION (Multi-tier circle dispatch)
```

### 2. Device & Hardware Fallback Pipeline
```
DEVICE LAYER
  ↓
PRIMARY PHONE (Cellular 5G, GPS, BLE)
  ↓
DEVICE UNAVAILABLE (Battery depletion / signal disruption)
  ↓
LAST KNOWN STATE (Preserved on backend; DEVICE_OFFLINE signal emitted +10 pts)
  ↓
COMPANION WEARABLE SIMULATION (Autonomous fallback telemetry source)
  ↓
FUTURE HARDWARE INTEGRATION (OEM / OS-level emergency hooks)
```

---

## 4. Key Subsystems & Modules

### 1. Safety State Engine
The final authority for all state transitions. The engine accumulates explainable points from sensory and user events:
- `ROUTE_DEVIATION`: +25 to +35 pts
- `PROLONGED_STOP`: +20 pts
- `MISSED_CHECKIN`: +25 pts
- `DEVICE_OFFLINE`: +10 pts (does not cause a false crisis)
- `NEED_HELP`: +50 pts
- `USER_CONFIRMED_SAFE`: Clears score to 0 and immediately de-escalates to `NORMAL`.

### 2. Privacy Permission Engine
Evaluates whether a trusted contact can access any of the 5 sensitive information categories:
1. `JOURNEY_STATUS` (Active, ETA, Completed)
2. `APPROXIMATE_LOCATION` (Neighborhood/city block radius)
3. `LIVE_LOCATION` (Exact GPS coordinates)
4. `EMERGENCY_STATUS` (Active alerts and dispatched escalation)
5. `JOURNEY_DETAILS` (Full notes, start/destination names)
**Security Enforcement**: Restricted information is stripped on the backend before the response leaves the server.

### 3. SafePath Route Engine
Visual map component built on Leaflet, React Leaflet, and OpenStreetMap tiles. Displays contextual route choices:
- Primary Fast Route vs. SafePath Route Alternative.
- Environmental safety attributes: continuous street lighting, active commercial storefronts, checkpoint beacons, cellular Escort density.

### 4. Check-In & Multi-Tier Escalation Engine
- Prompts user with discreet check-in notifications when stationary or overdue.
- Automated timer with `SAFE` or `NEED_HELP` actions.
- Escalation Engine dispatches multi-tier circle alerts:
  - `LEVEL_1`: Priority 1 contacts notified.
  - `LEVEL_2`: Priority 1 & 2 contacts notified.
  - `LEVEL_3`: Full circle notified.

### 5. Contact Dashboard
Permits the user to view their escort from any trusted contact's perspective. Real-time comparison views demonstrate how identical safety events result in different visibility matrices based on relationship-specific policies.

### 6. Anomaly Intelligence Layer
Prototype detector providing explainable heuristic analysis. Evaluates confidence ratings (`Low`, `Medium`, `High`) describing pattern divergence from expected baselines—**never described as a medical or safety "probability of danger"**.

### 7. Wearable Fallback Simulation
Simulates handover from a primary smartphone to an independent companion smartwatch when phone telemetry drops. Emits `DEVICE_OFFLINE` to the Safety State Engine without jumping directly to `CRISIS`.

### 8. Discreet Mode (Calculator Presentation)
Utility-style calculator interface allowing visual discretion in public transit or under duress. Includes standard arithmetic keypad, simulated discreet trigger (`911=`), and an immediate, user-controlled **Safe Return** button.

---

## 5. Architectural Distinction: Prototype vs. Future Concepts

To uphold scientific and engineering integrity, SafeCircle explicitly differentiates implemented prototype components from future platform concepts:

### Implemented Prototype Features
- [x] Full responsive web client (React 19, Vite, Tailwind CSS v4)
- [x] Express REST backend with modular service repositories
- [x] Deterministic Safety State Engine with state transition audit logging
- [x] Dynamic Privacy Permission Engine with server-side field stripping
- [x] SafePath route planner with OpenStreetMap & contextual attributes
- [x] Check-in prompt lifecycle and configurable escalation tiers
- [x] Contact Dashboard with side-by-side visibility comparison
- [x] Rule-based Anomaly Intelligence with explainability metadata
- [x] Device fallback abstraction and companion smartwatch simulation
- [x] Discreet calculator interface with transparent safe exit

### Future / OS-Level / Hardware Concepts (Documented Concepts Only)
- [ ] **OS-Level Safety Shutdown Interception**: Android/iOS user-space apps cannot intercept or prevent device power-off. This would require dedicated OS kernel or firmware support.
- [ ] **Global Hardware Power-Button Trigger**: Intercepting multi-press power button events outside an active app requires vendor/OEM system-level integration.
- [ ] **Autonomous Wearable Telemetry Handover**: Physical smartwatches require standalone cellular eSIM hardware to transmit telemetry independent of a tethered smartphone.

---

## 6. Honest Limitations & Platform Disclaimers

SafeCircle is an advanced academic prototype for personal privacy and safety systems. It explicitly does **NOT** claim:
1. **Guaranteed Danger Prevention**: The software cannot physically prevent harm or guarantee personal safety.
2. **Emergency Dispatch Integration**: SafeCircle does **not** call 911/112 or dispatch emergency response services.
3. **Hidden / Covert Tracking**: The app does not bypass operating system permissions, spy on users, or access microphones/cameras without consent.
4. **Post-Shutdown Tracking**: No smartphone app can track location once the operating system is powered off.
5. **Scientifically Validated Danger Probabilities**: Anomaly confidence measures heuristic pattern variance, not actuarial danger probability.

---

## 7. Technology Stack & Design System

- **Frontend**: React 19, Vite 8, React Router v7, Lucide React, Leaflet, React Leaflet.
- **Backend**: Node.js v26, Express, cors, dotenv.
- **Design System**: Built exclusively with soft pink, rose (`#e11d48`, `#be123c`), white, warm neutrals (`#fcf8f8`), and dark charcoal (`#1f2937`).
- **Color Rule**: In accordance with college project guidelines, **blue is strictly prohibited as a primary or accent UI color**. An automated grep audit verified 0 blue classes across the frontend codebase.

---

## 8. How to Run the Project

### Prerequisites
- Node.js (v18+ recommended, v26 tested)
- npm

### 1. Start the Backend Server
```bash
cd backend
npm install
node src/server.js
```
*Backend runs on `http://localhost:5000`.*

### 2. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 9. How to Test

### Run All Backend Automated Suites
```bash
cd backend
node test_e2e_flow.js   # Complete 17-step end-to-end integration flow
node test_phase7.js      # Safety State Engine & scoring tests (32 assertions)
node test_phase8.js      # Check-In & Escalation tests (40 assertions)
node test_phase9.js      # Contact Dashboard & Privacy tests (23 assertions)
node test_phase10.js     # Anomaly Intelligence tests (13 assertions)
node test_phase11.js     # Wearable Fallback tests (13 assertions)
node test_phase12.js     # Discreet Mode & Advanced Safety tests (8 assertions)
```

### Build Frontend for Production
```bash
cd frontend
npm run build
```

---

## 10. Recommended Demo Flow

For presentations and grading evaluations, execute the following walkthrough:

1. **Dashboard Overview (`/`)**:
   - Inspect the summary cards showing current safety state, active journey, selected SafePath, check-in status, and trusted circle count.
2. **Safety Circle & Privacy Policy (`/safety-circle`, `/privacy`)**:
   - Review registered contacts (Mom, Priya, Ananya) and examine how each contact has customized permissions across `NORMAL`, `CAUTION`, `ELEVATED`, and `CRISIS`.
3. **Contact Dashboard (`/contact-dashboard`)**:
   - Switch between contacts (e.g. Mom vs. Ananya) in `NORMAL` state. Observe that Mom has status access while precise coordinates are strictly restricted.
4. **Interactive Simulator (`/demo`)**:
   - Trigger a **Route Deviation** (+25 pts). Watch the state transition to `CAUTION`.
   - Revisit the Contact Dashboard: see emergency status reveal while live GPS remains withheld.
   - Trigger a **Missed Check-In** (+25 pts). Watch state escalate to `ELEVATED`. Notice approximate location unlock for primary contacts.
   - Trigger **Emergency Activated** (Straight to `CRISIS`). Observe full live coordinates unlock per policy.
   - Click **Mark as Safe**. Watch the score reset to 0, state return to `NORMAL`, and all sensitive disclosures immediately revoke.
5. **Device Fallback Simulator (`/demo`)**:
   - Click **[Phone Unavailable]**. Observe the primary phone transition to `UNAVAILABLE`, companion wearable assume fallback duty, and `DEVICE_OFFLINE` signal (+10 pts) emitted without causing a false crisis.
   - Click **[Phone Connected]** to restore primary connectivity.
6. **Discreet Mode (`/`)**:
   - Click **Discreet Mode** in the top navigation bar. Demonstrate the working calculator utility interface.
   - Type `911=` to simulate a discreet emergency trigger.
   - Click **Return to SafeCircle (Standard Mode)** to return with journey data intact.
7. **Advanced Device Safety Concepts (`/settings` → Advanced Safety Concepts)**:
   - Review documented OS-level platform boundaries, the 5x power-button trigger simulation, and user-controlled privacy principles.
8. **Reset Demo (`/demo`)**:
   - Click **Reset Demo** to safely clear all simulation signals and restore the system to a clean baseline.
