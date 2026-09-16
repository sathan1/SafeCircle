const { 
  EVENT_TYPES, 
  SEVERITY_LEVELS, 
  DEFAULT_SCORE_CONTRIBUTIONS, 
  DEFAULT_SEVERITIES 
} = require('../models/JourneyEvent');
const journeyService = require('./journeyService');

// In-memory repositories for prototype demo operation
let inMemoryEvents = [
  {
    id: 'evt-init-1',
    journeyId: 'j-active-1',
    type: 'JOURNEY_STARTED',
    severity: 'INFO',
    description: 'Journey started on scheduled trajectory',
    scoreContribution: 0,
    metadata: {},
    source: 'SYSTEM',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString()
  }
];

let inMemoryTransitions = [
  {
    id: 'tr-init-1',
    journeyId: 'j-active-1',
    previousState: 'NORMAL',
    newState: 'NORMAL',
    reason: 'Initial journey escort baseline established',
    signalScore: 0,
    triggeredBy: 'Safety State Engine',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString()
  }
];

/**
 * Determine safety state from calculated signal score
 * Thresholds:
 * 0–29:  NORMAL
 * 30–49: CAUTION
 * 50–74: ELEVATED
 * 75+:   CRISIS
 */
function scoreToSafetyState(score, hasEmergencyActivated = false) {
  if (hasEmergencyActivated || score >= 75) {
    return 'CRISIS';
  }
  if (score >= 50) {
    return 'ELEVATED';
  }
  if (score >= 30) {
    return 'CAUTION';
  }
  return 'NORMAL';
}

/**
 * Evaluates active events for a journey to calculate the Anomaly Signal Score
 * and determine the appropriate safety state.
 *
 * EXPLAINABLE PROTOTYPE RULES:
 * 1. Events chronologically preceding the latest USER_CONFIRMED_SAFE are considered
 *    cleared/mitigated and do not contribute to the active anomaly score.
 * 2. EMERGENCY_ACTIVATED immediately mandates a CRISIS state.
 * 3. Otherwise, score is the sum of active anomaly contributions.
 */
function evaluateEvents(events = []) {
  // Sort events chronologically ascending to evaluate chronological progression
  const sorted = [...events].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Find index of the most recent USER_CONFIRMED_SAFE event
  let lastSafeIndex = -1;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].type === 'USER_CONFIRMED_SAFE') {
      lastSafeIndex = i;
      break;
    }
  }

  // Active anomaly events are only those occurring AFTER the latest user safe confirmation
  const activeEvents = lastSafeIndex >= 0 ? sorted.slice(lastSafeIndex + 1) : sorted;

  let score = 0;
  let hasEmergency = false;
  const activeSignals = [];

  for (const evt of activeEvents) {
    if (evt.type === 'EMERGENCY_ACTIVATED') {
      hasEmergency = true;
      score = Math.max(score, 100);
      activeSignals.push({
        type: evt.type,
        description: evt.description || 'Emergency activation triggered',
        score: evt.scoreContribution || 80,
        severity: 'CRITICAL',
        timestamp: evt.timestamp
      });
    } else if (evt.scoreContribution && evt.scoreContribution > 0) {
      score += evt.scoreContribution;
      activeSignals.push({
        type: evt.type,
        description: evt.description,
        score: evt.scoreContribution,
        severity: evt.severity || 'MEDIUM',
        timestamp: evt.timestamp
      });
    }
  }

  const calculatedState = scoreToSafetyState(score, hasEmergency);

  // Formulate human-readable explanation
  let reason = '';
  if (hasEmergency) {
    reason = 'Emergency activation triggered critical escort state';
  } else if (activeSignals.length === 0) {
    if (lastSafeIndex >= 0) {
      reason = 'User confirmed safe — previous anomaly signals cleared, state returned toward NORMAL';
    } else {
      reason = 'Normal movement — no active anomaly signals detected';
    }
  } else {
    const signalDescriptions = activeSignals
      .map(s => `${s.description} (+${s.score})`)
      .join(', ');
    reason = `Active signals [${signalDescriptions}] accumulated Safety Signal Score to ${score}`;
  }

  return {
    signalScore: score,
    state: calculatedState,
    activeSignals,
    reason,
    isPrototype: true,
    lastSafeConfirmation: lastSafeIndex >= 0 ? sorted[lastSafeIndex].timestamp : null
  };
}

// Service Methods

/**
 * Get all events for a journey (newest first)
 */
async function getJourneyEvents(journeyId) {
  return inMemoryEvents
    .filter(e => e.journeyId === journeyId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Get safety state evaluation for a journey
 */
async function getSafetyState(journeyId) {
  const journey = await journeyService.getJourneyById(journeyId);
  if (!journey) {
    const error = new Error(`Journey with ID "${journeyId}" not found`);
    error.statusCode = 404;
    throw error;
  }

  const events = await getJourneyEvents(journeyId);
  const evaluation = evaluateEvents(events);

  return {
    journeyId,
    state: evaluation.state,
    currentStateInJourney: journey.currentState,
    signalScore: evaluation.signalScore,
    signals: evaluation.activeSignals,
    reason: evaluation.reason,
    lastSafeConfirmation: evaluation.lastSafeConfirmation,
    isPrototype: true,
    evaluationType: 'Explainable Rule-Based Prototype Engine'
  };
}

/**
 * Get state transition history for a journey
 */
async function getSafetyHistory(journeyId) {
  return inMemoryTransitions
    .filter(t => t.journeyId === journeyId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Ingest and process a new journey event
 * 1. Validate event and journey
 * 2. Save event
 * 3. Re-evaluate safety state
 * 4. If state changed, update journey model and record transition history
 * 5. Return event, score, state, and transition info
 */
async function processNewEvent(journeyId, eventData) {
  const journey = await journeyService.getJourneyById(journeyId);
  if (!journey) {
    const error = new Error(`Journey with ID "${journeyId}" not found`);
    error.statusCode = 404;
    throw error;
  }

  const type = String(eventData.type || '').toUpperCase();
  if (!EVENT_TYPES.includes(type)) {
    const error = new Error(`Invalid event type "${type}". Allowed types: ${EVENT_TYPES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const severity = eventData.severity || DEFAULT_SEVERITIES[type] || 'INFO';
  if (!SEVERITY_LEVELS.includes(severity)) {
    const error = new Error(`Invalid severity "${severity}". Allowed: ${SEVERITY_LEVELS.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const scoreContribution = eventData.scoreContribution !== undefined
    ? Number(eventData.scoreContribution)
    : (DEFAULT_SCORE_CONTRIBUTIONS[type] !== undefined ? DEFAULT_SCORE_CONTRIBUTIONS[type] : 0);

  const newEvent = {
    id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    journeyId,
    type,
    severity,
    description: (eventData.description || `Event ${type} detected`).trim(),
    scoreContribution,
    metadata: eventData.metadata || {},
    source: eventData.source || 'DEMO',
    timestamp: eventData.timestamp ? new Date(eventData.timestamp).toISOString() : new Date().toISOString()
  };

  inMemoryEvents.push(newEvent);

  // Retrieve all events for this journey (including the newly added one)
  const allEvents = inMemoryEvents.filter(e => e.journeyId === journeyId);
  const evaluation = evaluateEvents(allEvents);

  const previousState = journey.currentState;
  const newState = evaluation.state;
  let stateChanged = false;
  let transitionRecord = null;

  if (previousState !== newState) {
    stateChanged = true;

    // Update journey's currentState in the journey service
    await journeyService.updateJourneyState(journeyId, newState);

    // Record transition history
    transitionRecord = {
      id: `tr-${Date.now()}`,
      journeyId,
      previousState,
      newState,
      reason: evaluation.reason,
      signalScore: evaluation.signalScore,
      triggeredBy: `Safety State Engine (${type})`,
      timestamp: new Date().toISOString()
    };
    inMemoryTransitions.push(transitionRecord);
  }

  return {
    event: newEvent,
    signalScore: evaluation.signalScore,
    currentSafetyState: newState,
    previousSafetyState: previousState,
    stateChanged,
    transition: transitionRecord,
    activeSignals: evaluation.activeSignals,
    reason: evaluation.reason,
    isPrototype: true
  };
}

/**
 * Reset simulation for a journey back to NORMAL with 0 score
 */
async function resetSafetySimulation(journeyId) {
  const journey = await journeyService.getJourneyById(journeyId);
  if (!journey) {
    const error = new Error(`Journey with ID "${journeyId}" not found`);
    error.statusCode = 404;
    throw error;
  }

  // Retain only JOURNEY_STARTED or clear all anomaly events for this journey
  inMemoryEvents = inMemoryEvents.filter(e => e.journeyId !== journeyId || e.type === 'JOURNEY_STARTED');

  const previousState = journey.currentState;
  await journeyService.updateJourneyState(journeyId, 'NORMAL');

  const transitionRecord = {
    id: `tr-${Date.now()}`,
    journeyId,
    previousState,
    newState: 'NORMAL',
    reason: 'Safety State Simulation manually reset by user to standard baseline',
    signalScore: 0,
    triggeredBy: 'User Simulation Reset',
    timestamp: new Date().toISOString()
  };
  inMemoryTransitions.push(transitionRecord);

  return {
    success: true,
    journeyId,
    state: 'NORMAL',
    signalScore: 0,
    message: 'Safety simulation reset to NORMAL baseline with 0 score'
  };
}

module.exports = {
  processNewEvent,
  getJourneyEvents,
  getSafetyState,
  getSafetyHistory,
  resetSafetySimulation,
  evaluateEvents,
  scoreToSafetyState,
  EVENT_TYPES,
  SEVERITY_LEVELS
};
