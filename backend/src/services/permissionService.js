const { SAFETY_STATES, INFORMATION_TYPES, DEFAULT_PERMISSIONS } = require('../models/TrustedContact');

/**
 * Evaluates whether a trusted contact is authorized to access a specific
 * category of information under the given safety state.
 *
 * CRITICAL SECURITY RULES:
 * 1. Inactive contacts (isActive: false) are NEVER authorized for any information.
 * 2. If contact or safetyState is unrecognized, access is denied (fail-safe).
 * 3. Exact per-contact configured policy is enforced.
 *
 * @param {Object} contact - The trusted contact object (including permissions & isActive)
 * @param {string} safetyState - 'NORMAL' | 'CAUTION' | 'ELEVATED' | 'CRISIS'
 * @param {string} informationType - 'JOURNEY_STATUS' | 'APPROXIMATE_LOCATION' | 'LIVE_LOCATION' | 'EMERGENCY_STATUS' | 'JOURNEY_DETAILS'
 * @returns {boolean} true if permitted, false otherwise
 */
function canShareInformation(contact, safetyState, informationType) {
  if (!contact) {
    return false;
  }

  // 1. Inactive contacts are strictly prohibited from receiving data
  if (contact.isActive === false) {
    return false;
  }

  // 2. Validate state and information category
  const upperState = String(safetyState || '').toUpperCase();
  const upperInfo = String(informationType || '').toUpperCase();

  if (!SAFETY_STATES.includes(upperState)) {
    return false;
  }

  if (!INFORMATION_TYPES.includes(upperInfo)) {
    return false;
  }

  // 3. Check contact permissions object
  const permissions = contact.permissions;
  if (!permissions) {
    return false;
  }

  // Handle Mongoose Map or standard JS object
  let stateConfig;
  if (typeof permissions.get === 'function') {
    stateConfig = permissions.get(upperState);
  } else {
    stateConfig = permissions[upperState];
  }

  if (!stateConfig) {
    return false;
  }

  return Boolean(stateConfig[upperInfo]);
}

/**
 * Evaluates all information types for a contact at a given state.
 * Useful for building data packets before dispatching to contacts.
 */
function evaluateContactPermissions(contact, safetyState) {
  const result = {};
  for (const infoType of INFORMATION_TYPES) {
    result[infoType] = canShareInformation(contact, safetyState, infoType);
  }
  return {
    contactId: contact.id,
    contactName: contact.name,
    isActive: contact.isActive !== false,
    safetyState: safetyState.toUpperCase(),
    allowed: result
  };
}

module.exports = {
  canShareInformation,
  evaluateContactPermissions,
  SAFETY_STATES,
  INFORMATION_TYPES,
  DEFAULT_PERMISSIONS
};
