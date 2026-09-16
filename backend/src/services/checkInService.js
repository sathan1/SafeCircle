const { CHECKIN_STATUSES, CHECKIN_RESPONSES } = require('../models/CheckIn');
const journeyService = require('./journeyService');
const safetyStateEngine = require('./safetyStateEngine');
const escalationEngine = require('./escalationEngine');

// In-memory check-in repository
let inMemoryCheckIns = [];

/**
 * Handle a check-in transitioning to MISSED
 */
const markCheckInAsMissed = async (checkIn) => {
  if (checkIn.status !== 'PENDING') return checkIn;

  checkIn.status = 'MISSED';
  checkIn.updatedAt = new Date().toISOString();

  // 1. Create MISSED_CHECKIN journey event and process through Safety State Engine
  const engineResult = await safetyStateEngine.processNewEvent(checkIn.journeyId, {
    type: 'MISSED_CHECKIN',
    description: `Check-in requested at ${new Date(checkIn.requestedAt).toLocaleTimeString()} expired without response`,
    source: 'SYSTEM'
  });

  // 2. Trigger Level 1 escalation workflow
  const escalation = await escalationEngine.triggerEscalation(
    checkIn.journeyId,
    checkIn.id,
    'MISSED_CHECKIN',
    {
      level: 'LEVEL_1',
      currentState: engineResult.currentSafetyState,
      reason: `Check-in missed. Safety signal score reached ${engineResult.signalScore}. Initiating Level 1 simulated notification.`
    }
  );

  return {
    checkIn,
    engineResult,
    escalation
  };
};

/**
 * Creates a new check-in for an active journey
 */
const createCheckIn = async (journeyId, options = {}) => {
  const journey = await journeyService.getJourneyById(journeyId);
  if (!journey) {
    const error = new Error(`Journey with ID "${journeyId}" not found`);
    error.statusCode = 404;
    throw error;
  }

  // Cancel any existing pending check-ins for this journey
  for (const c of inMemoryCheckIns) {
    if (c.journeyId === journeyId && c.status === 'PENDING') {
      c.status = 'CANCELLED';
      c.updatedAt = new Date().toISOString();
    }
  }

  const requestedAt = new Date().toISOString();
  let dueAt;

  if (options.dueAt) {
    dueAt = new Date(options.dueAt).toISOString();
  } else {
    // Default 5 minutes from now, or minutesUntilDue if specified
    const minutes = options.minutesUntilDue !== undefined ? Number(options.minutesUntilDue) : 5;
    dueAt = new Date(Date.now() + minutes * 60 * 1000).toISOString();
  }

  const newCheckIn = {
    id: `chk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    journeyId,
    status: 'PENDING',
    requestedAt,
    dueAt,
    respondedAt: null,
    response: null,
    createdAt: new Date().toISOString()
  };

  inMemoryCheckIns.unshift(newCheckIn);
  return newCheckIn;
};

/**
 * Returns all check-ins for a journey
 */
const getCheckIns = async (journeyId) => {
  return inMemoryCheckIns
    .filter(c => c.journeyId === journeyId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * Returns the currently active (PENDING) check-in for a journey.
 * Safely evaluates if dueAt has elapsed and automatically transitions to MISSED.
 */
const getActiveCheckIn = async (journeyId) => {
  const pending = inMemoryCheckIns.find(c => c.journeyId === journeyId && c.status === 'PENDING');
  if (!pending) return null;

  // Auto-check if overdue
  const now = Date.now();
  const dueTime = new Date(pending.dueAt).getTime();
  if (now >= dueTime) {
    await markCheckInAsMissed(pending);
    return null;
  }

  return pending;
};

/**
 * Responds to a check-in (SAFE or NEED_HELP)
 */
const respondToCheckIn = async (checkInId, response) => {
  const upperResponse = String(response || '').toUpperCase();
  if (!CHECKIN_RESPONSES.includes(upperResponse)) {
    const error = new Error(`Invalid response "${response}". Allowed: ${CHECKIN_RESPONSES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const checkIn = inMemoryCheckIns.find(c => c.id === checkInId);
  if (!checkIn) {
    const error = new Error(`Check-in with ID "${checkInId}" not found`);
    error.statusCode = 404;
    throw error;
  }

  if (checkIn.status !== 'PENDING') {
    const error = new Error(`Check-in is already marked as ${checkIn.status}. Cannot respond again.`);
    error.statusCode = 400;
    throw error;
  }

  checkIn.status = 'COMPLETED';
  checkIn.respondedAt = new Date().toISOString();
  checkIn.response = upperResponse;
  checkIn.updatedAt = new Date().toISOString();

  let engineResult;
  let escalation = null;

  if (upperResponse === 'SAFE') {
    // 1. Process USER_CONFIRMED_SAFE event through Safety State Engine
    engineResult = await safetyStateEngine.processNewEvent(checkIn.journeyId, {
      type: 'USER_CONFIRMED_SAFE',
      description: 'User confirmed safe via check-in response',
      source: 'USER'
    });

    // 2. Resolve active escalations
    await escalationEngine.resolveActiveEscalations(checkIn.journeyId, 'User confirmed safe via check-in');
  } else if (upperResponse === 'NEED_HELP') {
    // 1. Process NEED_HELP event through Safety State Engine
    engineResult = await safetyStateEngine.processNewEvent(checkIn.journeyId, {
      type: 'NEED_HELP',
      description: 'User indicated assistance needed via check-in',
      source: 'USER'
    });

    // 2. Trigger Level 3 escalation
    escalation = await escalationEngine.triggerEscalation(
      checkIn.journeyId,
      checkIn.id,
      'NEED_HELP',
      {
        level: 'LEVEL_3',
        currentState: engineResult.currentSafetyState,
        reason: 'User responded NEED_HELP to safety check-in prompt. Initiating high-priority escalation.'
      }
    );
  }

  return {
    checkIn,
    engineResult,
    escalation
  };
};

/**
 * Checks for overdue pending check-ins and marks them as MISSED
 */
const checkMissedCheckIns = async (journeyId) => {
  const now = Date.now();
  const pendingList = inMemoryCheckIns.filter(c => {
    if (c.status !== 'PENDING') return false;
    if (journeyId && c.journeyId !== journeyId) return false;
    return now >= new Date(c.dueAt).getTime();
  });

  const results = [];
  for (const c of pendingList) {
    const res = await markCheckInAsMissed(c);
    results.push(res);
  }

  return results;
};

/**
 * Resets check-ins for demo testing
 */
const resetCheckIns = async (journeyId) => {
  inMemoryCheckIns = inMemoryCheckIns.filter(c => c.journeyId !== journeyId);
  return { success: true, message: 'Check-ins reset for journey' };
};

module.exports = {
  createCheckIn,
  getCheckIns,
  getActiveCheckIn,
  respondToCheckIn,
  checkMissedCheckIns,
  markCheckInAsMissed,
  resetCheckIns,
  CHECKIN_STATUSES,
  CHECKIN_RESPONSES
};
