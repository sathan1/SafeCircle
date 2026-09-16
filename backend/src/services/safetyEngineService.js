const JourneyEvent = require('../models/JourneyEvent');

const safetyEngineService = {
  /**
   * Evaluates the current state of a journey based on a new event and past events.
   * Returns { newState, reason } if a transition should occur, otherwise null.
   */
  async evaluateEvent(journey, newEvent) {
    const currentState = journey.currentSafetyState;
    
    // 1. Explicit De-escalation
    if (newEvent.eventType === 'USER_CONFIRMED_SAFE') {
      if (currentState !== 'NORMAL') {
        return {
          newState: 'NORMAL',
          reason: 'User explicitly confirmed they are safe.'
        };
      }
      return null; // Already normal
    }

    // 2. Fetch history to look for compounding factors
    const recentEvents = await JourneyEvent.find({ journeyId: journey._id })
      .sort({ timestamp: -1 })
      .limit(10);
      
    const hasRecentDeviation = recentEvents.some(e => e.eventType === 'ROUTE_DEVIATION');
    const hasRecentStop = recentEvents.some(e => e.eventType === 'UNEXPECTED_STOP');

    // 3. Escalation Rules
    let proposedState = currentState;
    let reason = '';

    switch (newEvent.eventType) {
      case 'DEVICE_OFFLINE':
        proposedState = 'ELEVATED';
        reason = 'Escalated to ELEVATED due to loss of device connectivity (user cannot respond).';
        break;

      case 'ROUTE_DEVIATION':
        if (hasRecentStop) {
          proposedState = 'ELEVATED';
          reason = 'Escalated to ELEVATED because a route deviation was combined with an unexpected stop.';
        } else {
          proposedState = 'CAUTION';
          reason = 'Escalated to CAUTION due to an unexpected route deviation.';
        }
        break;

      case 'UNEXPECTED_STOP':
        if (hasRecentDeviation) {
          proposedState = 'ELEVATED';
          reason = 'Escalated to ELEVATED because an unexpected stop was combined with a route deviation.';
        } else {
          proposedState = 'CAUTION';
          reason = 'Escalated to CAUTION due to an unexpected stop along the route.';
        }
        break;
        
      default:
        // Other events (LOCATION_UPDATED, JOURNEY_STARTED) don't escalate by themselves
        break;
    }

    // Only return if there is an actual state change
    // And ensure we don't accidentally downgrade an ELEVATED state to CAUTION just because a new single CAUTION event arrived
    const stateValues = { 'NORMAL': 0, 'CAUTION': 1, 'ELEVATED': 2, 'CRISIS': 3 };
    
    if (proposedState !== currentState && stateValues[proposedState] > stateValues[currentState]) {
      return { newState: proposedState, reason };
    }

    return null;
  }
};

module.exports = safetyEngineService;
