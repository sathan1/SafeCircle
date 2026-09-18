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

## 8. How to Run the Project & Multi-Device Setup

### Prerequisites
- Node.js (v18+ recommended, v24/v26 tested)
- npm

### 1. Configure Backend Environment
Copy the configuration template:
```bash
cd backend
cp .env.example .env
```
Inside `.env`:
- `PORT=5000`
- `EMAIL_PROVIDER=console`: Set to `console` for local hackathon testing (OTPs print directly to terminal without needing an API key). For production, set to `resend` or `sendgrid` and provide `EMAIL_PROVIDER_API_KEY`.
- No MongoDB is required! SafeCircle includes an atomic, zero-dependency persistent JSON store (`backend/data/safecircle_db.json`) that works immediately on any laptop.

### 2. Start the Backend Server
```bash
cd backend
npm install
node src/server.js
```
*Backend runs on `http://localhost:5000` with WebSocket gateway at `ws://localhost:5000/ws`.*

### 3. Start the Frontend Web Application
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 9. Physical Android Phone & Local Wi-Fi Setup

You can run SafeCircle on physical Android phones connected to your laptop's backend over local Wi-Fi:

1. **Ensure Same Network**: Connect your laptop and Android phones to the same Wi-Fi network (or turn on your laptop's mobile hotspot and connect phones to it).
2. **Find Your Laptop's IP Address**:
   - In Windows PowerShell, run `ipconfig`.
   - Look for `IPv4 Address` under your active Wi-Fi adapter (e.g. `192.168.1.50`).
3. **Install the APK on Phones**:
   - Install `build-output/SafeCircle-debug.apk` on Phone 1 (Person), Phone 2 (Mom), and Phone 3 (Dad).
4. **Point Phones to Laptop Backend**:
   - Open SafeCircle on each phone.
   - Tap **Settings** → **Server & Network**.
   - Enter `http://<your-laptop-ip>:5000` (e.g. `http://192.168.1.50:5000`) and tap **Apply URL**.
   - Tap **Test Connection**. A green check confirms real-time communication.

---

## 10. Automated Testing Suites

Run all automated verification test suites:
```bash
cd backend
node test_multidevice_sync.js # 30/30 checks passed: 3 accounts, invitations, differential disclosures
node test_e2e_flow.js         # 13/13 checks passed: complete 17-step end-to-end integration flow
node test_auth_otp.js         # Real email OTP registration and login flow
node test_phase7.js           # Safety State Engine & scoring tests (32 assertions)
node test_phase8.js           # Check-In & Escalation tests (40 assertions)
node test_phase9.js           # Contact Dashboard & Privacy tests (23 assertions)
node test_phase10.js          # Anomaly Intelligence tests (13 assertions)
node test_phase11.js          # Wearable Fallback tests (13 assertions)
node test_phase12.js          # Discreet Mode & Native Launcher tests (8 assertions)
```

Build the frontend web assets:
```bash
cd frontend
npm run build
```

---

## 11. 3-Account Hackathon Demo Walkthrough (7 Scenarios)

For live hackathon evaluations across 3 devices (Person, Mom, Dad):

### Step 1: Log In All Three Accounts
- **Device 1 (Person)**: Log in as `user@safecircle.app` (Password: `SafeUser123!`).
- **Device 2 (Mom)**: Log in as `mom@safecircle.app` (Password: `MomSecure123!`).
- **Device 3 (Dad)**: Log in as `dad@safecircle.app` (Password: `DadSecure123!`).

### Step 2: Establish Circle Guardian Relationship
- On Person's phone, tap **Safety Circle** → **Add Contact**. Enter Mom's email (`mom@safecircle.app`).
- On Mom's phone, the **Wards Under Escort** card instantly shows the invitation via WebSocket push. Tap **Accept Protection Request**.
- Repeat for Dad (`dad@safecircle.app`).

### Step 3: Run the 7 One-Click Scenarios from Demo Mode (`/demo`)
Open **Demo** (`/demo`) on Person's phone and step through the 7 scenarios:

1. **Scenario 1 (Normal Commute)**:
   - State: `NORMAL` (Score 0). Person has green shield.
   - Mom & Dad see "In Transit (Safe)", ETA. **Live GPS coordinates are strictly hidden** by backend differential privacy.
2. **Scenario 2 (Route Deviation / Caution)**:
   - State: `CAUTION` (Score 25). Person gets prompt: "Are you on track?".
   - Mom & Dad see amber alert: "Caution: Route variation". Transit sector revealed; live GPS remains protected.
3. **Scenario 3 (Missed Check-In / Elevated)**:
   - State: `ELEVATED` (Score 50). Person gets vibrating 60s prompt.
   - **Differential Privacy in Action**: Mom (Priority 1) receives SMS & Push with approximate location and battery (84%). Dad (Priority 2) remains in standby to prevent unnecessary panic.
4. **Scenario 4 (Panic Button / Crisis)**:
   - State: `CRISIS` (Score 100). Red flashing crisis screen, emergency audio beacon.
   - Mom and Dad both receive urgent distress sirens, precise real-time GPS coordinates, nearest street address, and emergency medical notes (Blood O+, Asthma Inhaler).
5. **Scenario 5 (Fallback: GPS Lost)**:
   - Satellite fix lost in tunnel. Dead reckoning engages, pins last verified coordinate with 140m accuracy radius.
6. **Scenario 6 (Fallback: Internet Disconnected)**:
   - Cellular data dropped. Offline banner appears, local safety beacon caches telemetry, native SMS escalation queued.
7. **Scenario 7 (Fallback: Phone Powered Off)**:
   - Battery dead or device shut down. Companion wearable elevates to active fallback; server inactivity watchdog arms.
   - Honest disclosure: No app can track after shutdown; SafeCircle relies on wearable companion handoff and server watchdog.

---

## 11. SafeCircle Android Application

SafeCircle is packaged as a production-grade native Android application (`com.safecircle.app`) engineered with Capacitor, Gradle, and modern Android APIs.

### Mobile-Native Architecture
- **Native Bottom Navigation**: 5-tab quick-access bar (`Home`, `Journeys`, `Circle`, `Privacy`, `Alerts`) with high-contrast active states and emergency indicators.
- **Hardware Back Button Handling**: Managed via `@capacitor/app`. Intelligently dismisses open modals, exits Discreet Mode, or steps back through navigation history.
- **FusedLocationProvider GPS**: Integrated via `@capacitor/geolocation`. Provides real accuracy in meters, detects weak/stale signals, and refuses to falsely report stale data as live.
- **Offline & Connectivity Awareness**: Monitored via `@capacitor/network`. Unobtrusive banner alerts the user when cellular/Wi-Fi is lost, preserving local privacy enforcement.
- **Device & Battery Telemetry**: Monitored via `@capacitor/device`. Warns user when battery drops below 15% and incorporates battery status into the Safety State Engine.
- **Emergency Evidence Mode**: Integrated via `@capacitor/camera`. Provides transparent, user-authorized photo capture of situational evidence without secret background recording.
- **Local Notifications**: Scheduled via `@capacitor/local-notifications` with a dedicated Android Notification Channel (`SafeCircle Emergency Alerts`).

### Android Directory Structure
```
frontend/
├── android/
│   ├── app/
│   │   ├── build.gradle                   # Target SDK 36, Min SDK 24, ProGuard rules
│   │   └── src/main/
│   │       ├── AndroidManifest.xml        # Location, Camera, Notification, Network permissions
│   │       ├── java/com/safecircle/app/   # Native MainActivity entrypoint
│   │       └── res/                       # SafeCircle Rose Shield icons & Splash drawable
│   ├── build.gradle                       # Android Gradle Plugin 8.13.0
│   └── gradlew.bat                        # Gradle Wrapper 8.14.3
└── src/services/native/                   # Mobile hardware service adapters
```

### Pre-Built Debug APK
A verified, ready-to-install debug build is compiled and available at:
```
build-output/SafeCircle-debug.apk
```
Transfer this file to any Android phone (Android 7.0+ / API 24+) to install and test directly.

### Building the Android APK from Source

#### Prerequisites
- **JDK**: OpenJDK 21 (or OpenJDK 17+)
- **Android SDK**: Platform 36 (Android 15) or Platform 34 (Android 14) + Build Tools 34.0.0+

#### Build Commands
```powershell
# 1. Build optimized web assets
cd frontend
npm run build

# 2. Sync web bundle to Android native assets
npx cap sync android

# 3. Compile native Debug APK with Gradle Wrapper
cd android
$env:JAVA_HOME = "D:\Android\jdk-21"       # Path to your JDK 21
$env:ANDROID_HOME = "D:\Android\Sdk"      # Path to your Android SDK
.\gradlew.bat assembleDebug
```
The output APK is generated at:
`frontend/android/app/build/outputs/apk/debug/app-debug.apk`

### Release Build Configuration
To build a signed release APK / Android App Bundle (AAB) for Google Play:
```powershell
# Generate signing keystore
keytool -genkey -v -keystore safecircle.keystore -alias safecircle -keyalg RSA -keysize 2048 -validity 10000

# Compile release APK
.\gradlew.bat assembleRelease
```
Configure `signingConfigs` in `frontend/android/app/build.gradle` referencing your keystore and credentials.
