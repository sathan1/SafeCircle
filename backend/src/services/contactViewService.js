const journeyService = require('./journeyService');
const contactService = require('./contactService');
const { canShareInformation, INFORMATION_TYPES } = require('./permissionService');
const safetyStateEngine = require('./safetyStateEngine');
const escalationEngine = require('./escalationEngine');

/**
 * Human-readable friendly names for information categories
 */
const INFORMATION_NAMES = {
  JOURNEY_STATUS: 'Journey Status',
  APPROXIMATE_LOCATION: 'Approximate Location',
  LIVE_LOCATION: 'Live Location',
  EMERGENCY_STATUS: 'Emergency Status',
  JOURNEY_DETAILS: 'Journey Details'
};

/**
 * Evaluates and returns ONLY the permitted information a specific trusted contact
 * is authorized to inspect for a given journey under the current safety state.
 *
 * CRITICAL SECURITY PRINCIPLE:
 * The backend is the source of truth.
 * Restricted information is NEVER sent to the client.
 * If permission is denied, sensitive fields are completely stripped from the response.
 *
 * @param {string} journeyId - Active journey ID
 * @param {string} contactId - Trusted Contact ID in Safety Circle
 * @returns {Promise<Object>} Permission-filtered contact view payload
 */
async function getContactViewForJourney(journeyId, contactId) {
  // 1. Verify journey exists
  const journey = await journeyService.getJourneyById(journeyId);
  if (!journey) {
    const error = new Error('Journey not found');
    error.statusCode = 404;
    throw error;
  }

  // 2. Verify contact belongs to Safety Circle
  const contact = await contactService.getContactById(contactId);
  if (!contact) {
    const error = new Error('Contact not found in Safety Circle');
    error.statusCode = 404;
    throw error;
  }

  // 3. Current safety state
  const safetyState = journey.currentState || 'NORMAL';

  // 4. Retrieve journey contextual data for authorized disclosures
  const allEvents = (await safetyStateEngine.getJourneyEvents(journeyId)) || [];
  const activeEvents = allEvents.filter(e => e.type !== 'USER_CONFIRMED_SAFE');
  const escalations = (await escalationEngine.getEscalations(journeyId)) || [];
  const latestEscalation = escalations.length > 0 ? escalations[0] : null;

  // 5. Evaluate permissions for each information category
  const visibilityMatrix = {};
  const disclosed = {};

  const isContactActive = contact.isActive !== false;

  for (const infoType of INFORMATION_TYPES) {
    const isAllowed = canShareInformation(contact, safetyState, infoType);

    // Explainability text
    let explanation;
    if (!isContactActive) {
      explanation = 'Restricted because contact is currently inactive in your Safety Circle.';
    } else if (isAllowed) {
      explanation = `Allowed because your privacy policy permits this information during the current safety state (${safetyState}).`;
    } else {
      explanation = `Restricted because your privacy policy does not permit this information during the current safety state (${safetyState}).`;
    }

    visibilityMatrix[infoType] = {
      type: infoType,
      name: INFORMATION_NAMES[infoType] || infoType,
      allowed: isAllowed,
      status: isAllowed ? 'ALLOWED' : 'RESTRICTED',
      explanation
    };

    // STRICT SECURITY: Include actual data ONLY when allowed is true
    if (isAllowed) {
      switch (infoType) {
        case 'JOURNEY_STATUS':
          disclosed.JOURNEY_STATUS = {
            allowed: true,
            status: 'ALLOWED',
            data: {
              status: journey.status,
              safetyState: journey.currentState,
              startedAt: journey.startedAt,
              isMonitoring: true
            }
          };
          break;

        case 'APPROXIMATE_LOCATION':
          // Expose ONLY general landmark/zone representation; strictly omit exact GPS coordinates
          disclosed.APPROXIMATE_LOCATION = {
            allowed: true,
            status: 'ALLOWED',
            data: {
              approximateArea: `${journey.destination?.name || 'Destination'} vicinity (approx. 500m zone)`,
              approximateCity: 'Bangalore, KA',
              radiusMeters: 500,
              simulationNotice: 'Prototype approximate zone — exact coordinates concealed by policy'
            }
          };
          break;

        case 'LIVE_LOCATION':
          // Real/simulated GPS coordinates exposed ONLY when explicitly permitted by user policy
          disclosed.LIVE_LOCATION = {
            allowed: true,
            status: 'ALLOWED',
            data: {
              latitude: 12.9520,
              longitude: 77.6120,
              accuracy: 'High (GPS Simulation)',
              lastUpdated: new Date().toISOString(),
              simulationNotice: 'Demo / Prototype Simulation — Live GPS location authorized by user policy'
            }
          };
          break;

        case 'EMERGENCY_STATUS':
          disclosed.EMERGENCY_STATUS = {
            allowed: true,
            status: 'ALLOWED',
            data: {
              safetyState: journey.currentState,
              escalationLevel: latestEscalation ? latestEscalation.level : (safetyState === 'NORMAL' ? 'NONE' : 'LEVEL_1'),
              escalationStatus: latestEscalation ? latestEscalation.status : 'NORMAL_OPERATION',
              activeSignalCount: activeEvents.length,
              latestEvent: activeEvents.length > 0 ? activeEvents[activeEvents.length - 1].description : 'Normal transit underway',
              simulationNotice: 'Prototype Simulation Status'
            }
          };
          break;

        case 'JOURNEY_DETAILS':
          disclosed.JOURNEY_DETAILS = {
            allowed: true,
            status: 'ALLOWED',
            data: {
              startLocation: journey.startLocation?.name || 'Starting Point',
              destination: journey.destination?.name || 'Destination',
              expectedArrival: journey.expectedArrival,
              routeName: journey.selectedRoute?.name || 'Direct Transit Route',
              notes: journey.notes || 'SafeCircle protected journey'
            }
          };
          break;

        default:
          break;
      }
    } else {
      // SENSITIVE DATA IS STRIPPED: Return standard restricted notice
      disclosed[infoType] = {
        allowed: false,
        status: 'RESTRICTED',
        message: 'Restricted by your privacy policy.'
      };
    }
  }

  return {
    contact: {
      id: contact.id,
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      priority: contact.priority,
      isActive: isContactActive
    },
    journey: {
      id: journey.id,
      status: journey.status,
      safetyState: journey.currentState,
      startedAt: journey.startedAt,
      expectedArrival: journey.expectedArrival
    },
    evaluatedAt: new Date().toISOString(),
    visibilityMatrix,
    disclosed
  };
}

module.exports = {
  getContactViewForJourney,
  INFORMATION_NAMES
};
