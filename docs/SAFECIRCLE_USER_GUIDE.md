# SafeCircle — Complete Multi-Device User Guide

SafeCircle is an intelligent, privacy-first personal safety application engineered around a foundational rule: **membership in a safety circle does not grant blanket access to private data**.

This guide provides a comprehensive, screen-by-screen walkthrough of the application, explicitly answering for every view:
1. **What is this screen?**
2. **What does it do?**
3. **What should I press?**
4. **What will happen on the other devices (e.g., Mom and Dad's phones)?**

---

## 1. The Three-Account Multi-Device Architecture

SafeCircle is designed and tested for real-world multi-device demonstrations across three independent accounts:

| User Account | Role in System | Default Privileges |
| :--- | :--- | :--- |
| **Person (`user@safecircle.app`)** | Commuter / Ward | Initiates journeys, configures privacy rules, triggers SOS/check-ins. |
| **Mom (`mom@safecircle.app`)** | Primary Guardian (Priority 1) | Receives Level 1–3 escalations; unlocks approximate and live location in emergency. |
| **Dad (`dad@safecircle.app`)** | Secondary Guardian (Priority 2) | Receives Level 2–3 escalations; receives emergency notices and crisis broadcast. |

All three accounts communicate in real time over secure WebSockets (`ws://<laptop-ip>:5000/ws`) backed by atomic server-side differential privacy filtering.

---

## 2. Physical Phone & Wi-Fi Network Setup

To run SafeCircle on physical Android phones connecting to your laptop backend:

1. **Connect to Same Network**: Ensure your laptop and Android phones are on the same Wi-Fi network (or connect phones to your laptop's mobile hotspot).
2. **Find Laptop IP**: On your laptop, open PowerShell and run `ipconfig`. Note your IPv4 Address (e.g., `192.168.1.50`).
3. **Start SafeCircle Backend**:
   ```bash
   cd d:\Studies\SafeCircle\backend
   node src/server.js
   ```
4. **Configure Server URL on Phone**:
   - Open SafeCircle on the phone.
   - Go to **Settings** (`/settings`) → **Server & Network**.
   - In **Backend Server URL**, enter: `http://<your-laptop-ip>:5000` (e.g. `http://192.168.1.50:5000`).
   - Tap **Apply URL**, then tap **Test Connection**. A green checkmark confirms real-time connectivity.

---

## 3. Screen-by-Screen Walkthrough

---

### Screen 1: Login Screen (`/login`)
- **What is this screen?** The secure gateway to SafeCircle sessions with email OTP or password authentication.
- **What does it do?** Authenticates user credentials against the persistent backend database and initializes real-time WebSocket communication.
- **What should I press?**
  - Enter your registered email (e.g. `user@safecircle.app`, `mom@safecircle.app`, or `dad@safecircle.app`) and password.
  - Tap **Sign In**.
  - New user? Tap **Create an Account** to register with Email OTP.
  - Quick Hackathon Demo Credentials:
    - Person: `user@safecircle.app` / `SafeUser123!`
    - Mom: `mom@safecircle.app` / `MomSecure123!`
    - Dad: `dad@safecircle.app` / `DadSecure123!`
- **What happens on other phones?** When you log in, your presence is registered on the backend gateway.

---

### Screen 2: Registration & Email OTP (`/register`)
- **What is this screen?** Real email verification and account creation.
- **What does it do?** Prevents spam and ensures user ownership of accounts. Generates a cryptographically random 6-digit numeric OTP valid for 10 minutes.
- **What should I press?**
  - Enter your Full Name, Email, and Password.
  - Tap **Continue with Email OTP**.
  - Check your email inbox (or backend terminal output if running console mode).
  - Enter the 6-digit OTP and tap **Verify & Complete Registration**.
- **What happens on other phones?** Nothing until you invite them into your circle.

---

### Screen 3: Person's Dashboard (`/`)
- **What is this screen?** The primary safety cockpit for the commuter.
- **What does it do?**
  - Displays current safety state (`NORMAL`, `CAUTION`, `ELEVATED`, `CRISIS`) with color-coded badges.
  - Displays GPS hardware status (*Live GPS* or *Stale Location*).
  - Houses the **2-Second Hold SOS Emergency Button**.
  - Displays active journey status and quick access to SafePath corridors.
- **What should I press?**
  - Tap **Start Journey** to begin a monitored transit.
  - Hold **Panic SOS** for 2 seconds to immediately trigger a full Crisis escalation.
  - Tap **Discreet Mode** in the top bar to disguise the app as a calculator.
- **What happens on other phones?**
  - During **NORMAL**: Mom and Dad see you are safe; no intrusive GPS tracks are sent.
  - During **CRISIS**: An alarm banner triggers on Mom and Dad's devices with live coordinates.

---

### Screen 4: Guardian Dashboard — "Wards Under Escort" (`/` for Mom & Dad)
- **What is this screen?** The specialized guardian card that appears on Mom and Dad's dashboard.
- **What does it do?**
  - Displays incoming Circle Invitations with a 1-tap **Accept Protection Request** button.
  - Displays live ward status with server-filtered permitted disclosures.
  - Automatically updates in real time via WebSockets whenever the commuter's safety state shifts.
- **What should I press?**
  - When Person invites you: Tap **Accept Protection Request**.
  - To view details: Tap **Open Live Escort View**.
- **What happens on other phones?** Person's phone instantly updates the contact badge from "Pending" to "Active Guardian".

---

### Screen 5: Safety Circle Management (`/safety-circle`)
- **What is this screen?** Your trusted network management center.
- **What does it do?** Lists all trusted contacts, their priority tiers (Primary vs Secondary), active toggle switches, and pending invitations.
- **What should I press?**
  - Tap **Add Trusted Contact**.
  - Enter name (e.g. `Mom`), phone number, relationship (`Mother`), and email address (`mom@safecircle.app`).
  - Tap **Send Circle Invitation**.
- **What happens on other phones?** The recipient's phone instantly receives the invitation on their dashboard via real-time WebSocket push.

---

### Screen 6: Contact Privacy Permissions Matrix (`/safety-circle` → Edit Permissions)
- **What is this screen?** The core user-governed privacy enforcement panel.
- **What does it do?** Allows the user to configure exactly what each contact can see at each safety tier:
  - `NORMAL`: Journey Status only (Default). Live GPS strictly hidden.
  - `CAUTION`: Emergency Notice optional. Live GPS strictly hidden.
  - `ELEVATED`: Approximate Area & Trajectory unlocked for Primary Contact.
  - `CRISIS`: Full Live GPS unlocked according to user policy.
- **What should I press?**
  - Check or uncheck disclosure boxes for each tier.
  - Tap **Save Permissions**.
- **What happens on other phones?** The backend immediately updates the visibility filter. Even if Mom's app requests live GPS during `NORMAL`, the server strips the coordinates before sending the packet.

---

### Screen 7: Active Journey & SafePath Corridor (`/journeys/:id`)
- **What is this screen?** Live transit monitoring view.
- **What does it do?**
  - Displays SafePath route corridor on a live interactive map.
  - Shows progress, battery level, time elapsed, and estimated arrival.
  - Monitors GPS deviation against corridor boundary (300m tolerance).
  - Displays active check-in timers.
- **What should I press?**
  - Tap **Check In Now** to confirm your safety voluntarily.
  - Tap **End Journey** upon arriving safely at your destination.
- **What happens on other phones?**
  - Real-time journey progress is synced.
  - Mom and Dad see ETA and corridor status.
  - Ending journey immediately purges raw telemetry and sets state to COMPLETED.

---

### Screen 8: Safety Check-In Prompts
- **What is this screen?** A non-intrusive safety inquiry that appears when an anomaly is detected or at timed intervals.
- **What does it do?** Asks: *"Are you on track?"* with a 2-minute visual countdown timer.
- **What should I press?**
  - Tap **I Am Safe**: Resets the anomaly score to 0 and clears the prompt.
  - Tap **Need Help**: Directly escalates to ELEVATED/CRISIS and alerts circle contacts.
  - Do nothing: If the 2 minutes elapse, the system automatically triggers a Level 1 escalation to Mom.
- **What happens on other phones?**
  - If unanswered: Mom's phone alerts her with: *"SafeCircle Alert: Check-in unacknowledged for Person."*

---

### Screen 9: Native Android Discreet Mode (`/settings` → Discreet Mode & In-App Calculator)
- **What is this screen?** A dual-layer disguise system for personal privacy in shared spaces or transit.
- **What does it do?**
  1. **Launcher Disguise**: Dynamically switches the Android home screen app icon and title using native Android `activity-alias` between:
     - `SafeCircle` (Standard pink branding)
     - `Calculator` (Neutral utility icon)
     - `Notes` (Neutral notepad icon)
  2. **In-App Disguise**: Replaces the entire user interface with a 100% functional calculator.
  3. **Private PIN Unlock**: Entering your 4-digit PIN (default `1234`) and pressing `=` immediately returns you to SafeCircle.
  4. **Discreet SOS**: Typing `911=` or `0000=` silently dispatches an emergency signal without visual disclosure.
- **What should I press?**
  - To disguise: Tap **Launch Discreet Mode** or use the top navigation button.
  - To return: Type your 4-digit PIN and press `=`, or tap **Return to SafeCircle**.
  - In Settings: Set a custom 4-digit PIN and select your preferred launcher appearance.
- **What happens on other phones?** Background escort monitoring, GPS updates, and safety state evaluations continue running completely uninterrupted.

---

### Screen 10: Server & Network Settings (`/settings` → Server & Network)
- **What is this screen?** Evaluator network connectivity configuration.
- **What does it do?** Allows setting the backend URL dynamically at runtime so physical phones can reach the laptop backend without recompiling the APK.
- **What should I press?**
  - Input laptop IP: `http://192.168.x.x:5000`.
  - Tap **Apply URL**.
  - Tap **Test Connection** to view live latency and server status.
  - Tap **Reset Default** to revert to `http://localhost:5000`.

---

### Screen 11: Hackathon Demo Simulator (`/demo`)
- **What is this screen?** The judge and evaluator testbench featuring one-click triggers for all 7 Hackathon demonstration scenarios.
- **What does it do?** Updates the live backend journey state and broadcasts real-time WebSocket messages to all connected devices with an explicit `SIMULATION ONLY` badge.
- **What should I press?** Tap any of the 7 scenario buttons (1 through 7) to run a live multi-device test.

---

## 4. The 7 Hackathon Demonstration Scenarios

| # | Scenario | Trigger Condition | Person Sees (Phone 1) | Mom & Dad See (Phones 2 & 3) | Honest Boundary Note |
| :- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Normal Commute** | Route conforms to corridor timetable (Score: 0). | Green shield, "NORMAL" status, route progress bar, ETA. | Mom: "In Transit (Safe)", ETA. Live GPS strictly hidden. | Zero surveillance during normal conditions. |
| **2** | **Route Deviation / Caution** | GPS deviates > 300m from SafePath (+25 pts). | Amber badge, "CAUTION", prompt: "Are you on track?". | Mom: "Caution: Route variation near Commercial District". | Discloses transit sector, not raw breadcrumbs. |
| **3** | **Missed Check-In / Elevated** | 2-minute check-in expires without response (Score: 50). | Urgent vibration, 60s countdown prompt before escalation. | Mom (Priority 1) receives SMS & Push. Approx location & battery (84%) unlocked. | Tiered escalation notifies Mom first. Dad sees standby. |
| **4** | **Panic Button / Crisis** | Emergency SOS pressed or keypad trigger `911=` (Score: 100). | Red flashing crisis screen, emergency audio beacon recording. | High-priority siren to Mom & Dad. Live GPS pin, address, and medical notes (Asthma, O+). | Crisis tier bypasses all delays for immediate rescue. |
| **5** | **GPS Signal Lost** | Satellite fix lost in tunnel for > 3 minutes. | "GPS Lost — Dead Reckoning Active" notice. Last verified pin. | Ward card: "Last Verified Position (3 mins ago near Tunnel)", 140m radius. | Flags telemetry uncertainty rather than plotting fake GPS. |
| **6** | **Internet Disconnected** | Cellular data drops in dead zone or airplane mode. | Top banner: "Offline Mode Active. SMS fallback queued." | Mom & Dad: "Connection Dropped" notice with last ping timestamp. | Evaluates safety locally; falls back to native SMS. |
| **7** | **Phone Powered Off** | Battery exhausts or phone powers down. | Companion wearable elevates to active fallback (simulated). | Contact view: "Phone Unreachable (Last ping: 4:18 PM)". Server watchdog arms. | Honest: No app can track after shutdown. Server watchdog handles alerts. |

---

## 5. Summary of Technical Guarantees

1. **Server-Side Data Stripping**: Permissions are enforced on the Node.js backend. Coordinates are never sent to contacts unless authorized by the active safety tier.
2. **Zero Invasiveness**: During normal routine commutes, no live GPS or intrusive surveillance is shared with anyone.
3. **Multi-Device Parity**: Tested and verified across 3 independent accounts with real WebSockets and persistent JSON storage.
4. **Honest Operating System Limits**: No false claims regarding secret background recording, task switcher bypassing, or tracking powered-off hardware.
