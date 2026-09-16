# SafeCircle — System Architecture & Design Principles

## Overview
SafeCircle is a **Privacy-First Progressive Emergency Protection System**. It provides a safety net for journeys by escalating safety awareness without compromising personal privacy by default.

---

## Core Innovation: Privacy-First Escalation
Most emergency and tracking tools force an all-or-nothing approach to privacy. SafeCircle introduces a **user-owned dynamic privacy matrix**:

1. **User Controls the Policy**: The user chooses which contacts can view which details (location, ETA, battery, audio status) at each specific safety level.
2. **Progressive Safety States**:
   - **Normal**: Routine journey status. Contacts see minimal or coarse progress (or nothing, depending on configuration).
   - **Caution**: Minor deviation or delay detected. Mild check-in prompts issued.
   - **Elevated**: Unresolved deviation or persistent silence. Select trusted contacts receive authorized status updates.
   - **Crisis**: Confirmed emergency or failure to respond to safety checks. Pre-authorized crisis circle receives emergency packets and location history as explicitly permitted.

---

## Realism & Safety Prototype Principles
1. **Safety Prototype**: This platform is a prototype and does not replace certified emergency dispatch services (911/112).
2. **Realistic Device Capabilities**: Does not claim impossible OS exploits (such as silently bypassing hardware power-down or overriding locked Android security boundaries).
3. **Transparent Integrations**: Advanced modules like hardware wearable fallback, discreet interface, and OS-level safety shutdown are presented as clearly labeled simulations or future integration modules.
4. **Explicit Permission Checks**: Live location or private telemetry is never exposed without an explicit permission check against the user's safety state matrix.
5. **Explainable State Transitions**: Anomaly detection emits explainable signals that are processed deterministically by the Safety State Engine. No black-box AI makes arbitrary danger claims.
