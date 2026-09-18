# SafeCircle — Pitch Deck & Presentation Guide

### Privacy-First Progressive Emergency Protection System
*Google Antigravity Hackathon 2026*

---

## Slide 1: Title & Vision
- **Product**: SafeCircle
- **Tagline**: Privacy-First Progressive Emergency Protection System
- **Core Principle**: *"The user controls who can see what, and the system progressively reveals only what is required when safety warrants it."*
- **Team**: Engineering & Product Architecture

---

## Slide 2: The Problem
- **The Modern Dilemma**: Over 78% of women feel uneasy commuting alone at night.
- **The Binary Trap**: Existing safety apps force an unfair trade-off:
  - Either continuous 24/7 live GPS surveillance by family/friends,
  - Or zero protection during an actual crisis.
- **The Result**: Women frequently disable tracking apps because permanent tracking feels intrusive and patronizing.

---

## Slide 3: Why Existing Approaches Fail
| Flaw in Existing Apps | Real-World Impact | SafeCircle Solution |
| :--- | :--- | :--- |
| **All-or-Nothing Access** | Continuous tracking breeds resentment | **Progressive Disclosure Matrix** |
| **Frequent False Alarms** | Cry-wolf syndrome from minor GPS drift | **Deterministic Escalation Engine** |
| **Invasive Evidence Capture** | Secret recording violates OS security & trust | **Transparent User-Authorized Capture** |
| **Unrealistic Claims** | Claiming to track powered-off phones | **Honest Telemetry & Wearable Fallback** |

---

## Slide 4: The SafeCircle Solution
- **A Dynamic Safety Net**: Your circle stands by without tracking your routine steps.
- **Explainable Anomaly Signals**: Route deviations, prolonged stops, and unanswered check-ins accumulate transparent risk points.
- **Strict Privacy Gating**: Backend enforces permissions before sending any byte of telemetry over the wire.

---

## Slide 5: Core Innovation: Progressive Disclosure
```
[ ROUTE PROGRESSION ] ──────────────► [ SAFETY ENGINE ]
                                              │
                                              ▼
                                       State Evaluation
                  ┌──────────────┬────────────┼────────────┬─────────────┐
                  ▼              ▼            ▼            ▼             ▼
               NORMAL        CAUTION      ELEVATED       CRISIS      DE-ESCALATED
             (0–29 pts)    (30–49 pts)   (50–74 pts)  (75–100 pts)    (Reset to 0)
                  │              │            │            │             │
                  ▼              ▼            ▼            ▼             ▼
              Mom: Status   Mom: Notice   Mom: Approx  Mom: Live GPS  Mom: Status
              Friend: None  Friend: None  Friend: None Friend: Info   Friend: None
```

---

## Slide 6: User Journey (End-to-End)
1. **Onboard**: 5-screen first-run walkthrough explaining privacy guarantees.
2. **Configure Circle**: Add trusted contacts and set custom disclosure rules.
3. **Plan Journey**: Pick SafePath corridor with well-lit streets.
4. **Transit**: Peaceful travel without feeling surveilled.
5. **Arrive & Complete**: Safe trip concluded with zero location history retained.

---

## Slide 7: Safety Circle Management
- Granular contact relationships (Parent, Sibling, Friend, Partner).
- Per-contact status toggling (Active vs. Inactive).
- Clear, simple UI: *"You control what each person can see."*

---

## Slide 8: Deterministic Safety State Engine
- **NORMAL (0–29)**: Timetable conforming. All sensitive telemetry strictly withheld.
- **CAUTION (30–49)**: Mild anomaly detected (+25 pts). Generates a 60s user check-in prompt.
- **ELEVATED (50–74)**: Compounding signals or missed prompt. Dispatches Level 1 escalation.
- **CRISIS (75–100)**: Explicit SOS or severe condition. Live GPS and emergency packet disclosed to pre-authorized contacts.

---

## Slide 9: Two-Phone Live Demonstration Architecture
- **Phone A (User / Woman)**:
  - Generates travel data, responds to checkpoints, triggers SOS.
- **Phone B (Trusted Contact / Parent)**:
  - Real-time polling (2.5s interval) against permission-filtered backend.
  - Dynamically updates as Phone A transitions through states.
  - Zero Wi-Fi dependency; functions across independent cellular networks.

---

## Slide 10: Check-In System & Configurable Escalation
- Timed checkpoint prompts with visual countdown.
- 1-tap responses: **"I Am Safe"** (de-escalates) or **"Need Help"** (immediate escalation).
- Unanswered prompts trigger sequential escalation levels without calling the police prematurely.

---

## Slide 11: Offline & Wearable Fallback
- **Network Loss**: Enters Offline Mode, preserving local safety state and cached policies.
- **Honest GPS**: Distinguishes Live FusedLocation GPS (`±10m`) from Stale Cached data.
- **Device Loss**: Seamless handoff to companion wearable fallback simulation.

---

## Slide 12: Security & Privacy Architecture
- **Zero API Keys in Client**: Email providers (Resend/SendGrid) isolated on backend.
- **Backend Source of Truth**: Unauthorized fields are stripped before HTTP transmission.
- **Authentication**: Bcrypt hashing, 6-digit numeric OTPs, 10-minute expiry, rate limiting.
- **Discreet Decoy Mode**: Working calculator interface with PIN unlock.

---

## Slide 13: Technical Architecture Stack
```
┌─────────────────────────────────────────────────────────────────┐
│                     ANDROID APPLICATION                         │
│   Capacitor 8 · Android Gradle Plugin 8.13.0 · OpenJDK 21       │
│   FusedLocationProvider · Camera · LocalNotifications · Device  │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTPS REST / JSON
┌───────────────────────────────▼─────────────────────────────────┐
│                     SAFECIRCLE BACKEND                          │
│   Node.js · Express 5 · MongoDB · JWT Auth · Bcrypt             │
│   Safety State Engine · Escalation Engine · Email OTP Service   │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTPS API
┌───────────────────────────────▼─────────────────────────────────┐
│               EMAIL PROVIDER (Resend / SendGrid)                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Slide 14: Hackathon Demo Scenarios
1. **Scenario 1**: Normal Journey (Zero live location shared).
2. **Scenario 2**: Route Deviation (Caution state + "Are you okay?" prompt).
3. **Scenario 3**: Prompt Timeout (Elevated state + Parent alerted).
4. **Scenario 4**: Crisis Activation (2-second hold SOS -> Live GPS disclosed).
5. **Scenario 5**: Phone Unavailable (Wearable companion fallback).
6. **Scenario 6**: GPS Lost (Transparent stale location indicator).
7. **Scenario 7**: Internet Lost (Offline protection mode).

---

## Slide 15: Future Scope & Roadmap
- **Wear OS / Watch Companion App**: Standalone smartwatch safety client.
- **Offline Mesh Networking**: Bluetooth Low Energy (BLE) neighbor-to-neighbor beaconing.
- **Transit Integration**: Official transit safe-zone corridor partnerships.
- **Dynamic Risk Mapping**: Real-time municipal lighting and emergency kiosk telemetry.

---

## Slide 16: Conclusion
- SafeCircle eliminates the compromise between women's safety and women's freedom.
- **"Traditional tracking asks: Where is she? SafeCircle asks: What information has she chosen to share, and when?"**
- Ready to install, test, and demonstrate today.
