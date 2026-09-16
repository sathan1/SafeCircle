const { ESCALATION_LEVELS, ESCALATION_STATUSES } = require('../models/Escalation');
const { canShareInformation, INFORMATION_TYPES } = require('./permissionService');
const contactService = require('./contactService');
const journeyService = require('./journeyService');

// In-memory escalation repository
let inMemoryEscalations = [];

/**
 * Resolves eligible contacts for a given escalation level and journey
 */
const getEligibleContacts = async (journey, level) => {
  const allContacts = await contactService.getAllContacts();
  // Filter by contacts attached to this journey and active
  const journeyContactIds = journey.selectedContacts || [];
  const activeContacts = allContacts.filter(c => c.isActive !== false && journeyContactIds.includes(c.id));

  if (level === 'LEVEL_1') {
    // Priority 1 contacts only
    const p1 = activeContacts.filter(c => c.priority === 1);
    return p1.length > 0 ? p1 : activeContacts.slice(0, 1);
  }

  if (level === 'LEVEL_2') {
    // Priority 1 and Priority 2 contacts
    const p12 = activeContacts.filter(c => c.priority <= 2);
    return p12.length > 0 ? p12 : activeContacts;
  }

  // LEVEL_3: All active journey contacts
  return activeContacts;
};

/**
 * Builds permission-controlled disclosure packets for each contact
 * STRICT PRIVACY RULE: Uses canShareInformation(contact, safetyState, infoType)
 */
const buildNotificationPackets = (contacts, safetyState) => {
  return contacts.map(contact => {
    const allowed = {};
    for (const infoType of INFORMATION_TYPES) {
      allowed[infoType] = canShareInformation(contact, safetyState, infoType);
    }

    return {
      contactId: contact.id,
      name: contact.name,
      relationship: contact.relationship,
      priority: contact.priority,
      phone: contact.phone,
      allowedDisclosures: allowed,
      notificationType: 'SIMULATED_ALERT'
    };
  });
};

/**
 * Triggers a configurable escalation
 */
const triggerEscalation = async (journeyId, checkInId, trigger, options = {}) => {
  const journey = await journeyService.getJourneyById(journeyId);
  if (!journey) {
    const error = new Error(`Journey with ID "${journeyId}" not found`);
    error.statusCode = 404;
    throw error;
  }

  const currentState = options.currentState || journey.currentState || 'NORMAL';
  let level = options.level;

  if (!level) {
    // Determine level automatically
    if (currentState === 'CRISIS' || trigger === 'EMERGENCY_TRIGGER' || trigger === 'NEED_HELP') {
      level = 'LEVEL_3';
    } else if (currentState === 'ELEVATED' || trigger === 'REPEATED_MISSED_CHECKIN') {
      level = 'LEVEL_2';
    } else {
      level = 'LEVEL_1';
    }
  }

  if (!ESCALATION_LEVELS.includes(level)) {
    level = 'LEVEL_1';
  }

  const eligibleContacts = await getEligibleContacts(journey, level);
  const targetPackets = buildNotificationPackets(eligibleContacts, currentState);

  const escalationRecord = {
    id: `esc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    journeyId,
    checkInId: checkInId || null,
    level,
    trigger: trigger || 'Safety escalation triggered',
    status: 'NOTIFIED_SIMULATION',
    targetContacts: targetPackets,
    reason: options.reason || `Escalation ${level} dispatched per user privacy policy for safety state ${currentState}`,
    createdAt: new Date().toISOString(),
    resolvedAt: null
  };

  inMemoryEscalations.unshift(escalationRecord);
  return escalationRecord;
};

/**
 * Resolves all active/pending escalations for a journey
 */
const resolveActiveEscalations = async (journeyId, reason = 'User confirmed safe') => {
  const resolvedList = [];
  for (const esc of inMemoryEscalations) {
    if (esc.journeyId === journeyId && esc.status !== 'RESOLVED' && esc.status !== 'CANCELLED') {
      esc.status = 'RESOLVED';
      esc.resolvedAt = new Date().toISOString();
      esc.resolveReason = reason;
      resolvedList.push(esc);
    }
  }
  return resolvedList;
};

/**
 * Resolves a specific escalation by ID
 */
const resolveEscalationById = async (escalationId, reason = 'Manually resolved by user') => {
  const escalation = inMemoryEscalations.find(e => e.id === escalationId);
  if (!escalation) {
    const error = new Error(`Escalation with ID "${escalationId}" not found`);
    error.statusCode = 404;
    throw error;
  }

  escalation.status = 'RESOLVED';
  escalation.resolvedAt = new Date().toISOString();
  escalation.resolveReason = reason;
  return escalation;
};

/**
 * Get all escalations for a journey
 */
const getEscalations = async (journeyId) => {
  return inMemoryEscalations
    .filter(e => e.journeyId === journeyId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

module.exports = {
  triggerEscalation,
  resolveActiveEscalations,
  resolveEscalationById,
  getEscalations,
  getEligibleContacts,
  buildNotificationPackets,
  ESCALATION_LEVELS,
  ESCALATION_STATUSES
};
