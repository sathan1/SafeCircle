export const INFORMATION_TYPES = [
  'JOURNEY_STATUS',
  'APPROXIMATE_LOCATION',
  'LIVE_LOCATION',
  'EMERGENCY_STATUS',
  'JOURNEY_DETAILS'
];

export const INFO_TYPE_LABELS = {
  JOURNEY_STATUS: 'Journey Status',
  APPROXIMATE_LOCATION: 'Approx Location',
  LIVE_LOCATION: 'Live Location',
  EMERGENCY_STATUS: 'Emergency Status',
  JOURNEY_DETAILS: 'Full Details'
};

/**
 * Checks if a contact is authorized to receive a specific information type
 * under the given safety state.
 *
 * Architecture Rule:
 * Safety State Engine -> currentState -> canShareInformation(contact, currentState, infoType)
 */
export function canShareInformation(contact, safetyState, informationType) {
  if (!contact || contact.isActive === false) {
    return false;
  }

  const upperState = String(safetyState || 'NORMAL').toUpperCase();
  const upperInfo = String(informationType || '').toUpperCase();

  const permissions = contact.permissions;
  if (!permissions) {
    return false;
  }

  const stateConfig = permissions[upperState];
  if (!stateConfig) {
    return false;
  }

  return Boolean(stateConfig[upperInfo]);
}

export default {
  INFORMATION_TYPES,
  INFO_TYPE_LABELS,
  canShareInformation
};
