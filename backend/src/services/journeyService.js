const { JOURNEY_STATUSES, SAFETY_STATES } = require('../models/Journey');
const { journeys, contacts, users } = require('./db');
const socketService = require('./socketService');
let contactViewService = null;
function getContactViewService() {
  if (!contactViewService) {
    contactViewService = require('./contactViewService');
  }
  return contactViewService;
}

// In-memory demo repository pre-seeded with historical records (for backward test compatibility)
let inMemoryJourneys = [
  {
    id: 'j-active-1',
    userId: 'demo-user-1',
    startLocation: {
      name: 'College Campus',
      latitude: 12.9716,
      longitude: 77.5946
    },
    destination: {
      name: 'Home',
      latitude: 12.9352,
      longitude: 77.6245
    },
    expectedArrival: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    startedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    endedAt: null,
    status: 'ACTIVE',
    currentState: 'NORMAL',
    selectedContacts: ['tc-1', 'tc-2'],
    selectedRoute: {
      routeId: 'route-b-safepath',
      name: 'Main Commercial Avenue (SafePath Alternative)',
      distance: '3.8 km',
      estimatedDuration: '17 mins',
      routeType: 'SAFEPATH',
      contextualEstimate: 'Elevated Contextual Coverage',
      signals: [
        'Continuous street lighting',
        'Active commercial corridor & footfall',
        'Designated transit checkpoints',
        'High cellular Escort signal density'
      ],
      waypoints: [
        [12.9716, 77.5946],
        [12.9640, 77.6010],
        [12.9520, 77.6120],
        [12.9352, 77.6245]
      ]
    },
    notes: 'Heading home after evening seminar',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 'j-past-1',
    userId: 'demo-user-1',
    startLocation: {
      name: 'College Campus',
      latitude: 12.9716,
      longitude: 77.5946
    },
    destination: {
      name: 'City Library',
      latitude: 12.9784,
      longitude: 77.6046
    },
    expectedArrival: new Date('2026-09-15T17:45:00Z').toISOString(),
    startedAt: new Date('2026-09-15T17:15:00Z').toISOString(),
    endedAt: new Date('2026-09-15T17:43:00Z').toISOString(),
    status: 'COMPLETED',
    currentState: 'NORMAL',
    selectedContacts: ['tc-1', 'tc-2'],
    selectedRoute: null,
    notes: 'Study session with classmates',
    createdAt: new Date('2026-09-15T17:10:00Z').toISOString()
  }
];

/**
 * Validate input payload when creating a new journey
 */
const validateJourneyData = (data) => {
  const errors = [];

  const startName = typeof data.startLocation === 'string' ? data.startLocation : data.startLocation?.name;
  if (!startName || !startName.trim()) {
    errors.push('Starting location (From) is required');
  }

  const destName = typeof data.destination === 'string' ? data.destination : data.destination?.name;
  if (!destName || !destName.trim()) {
    errors.push('Destination (To) is required');
  }

  if (!data.expectedArrival) {
    errors.push('Expected arrival time is required');
  } else {
    const arrivalDate = new Date(data.expectedArrival);
    if (isNaN(arrivalDate.getTime())) {
      errors.push('Expected arrival must be a valid date/time');
    }
  }

  if (!Array.isArray(data.selectedContacts) || data.selectedContacts.length === 0) {
    errors.push('At least one active Safety Circle contact must be selected');
  }

  return errors;
};

// Repository Operations
const getJourneys = async (userId = null) => {
  if (userId) {
    const userJourneys = await journeys.find({ userId });
    if (userJourneys.length > 0) {
      return userJourneys.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }
  return [...inMemoryJourneys].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const getJourneyById = async (id, userId = null) => {
  const dbJourney = await journeys.findById(id);
  if (dbJourney) {
    return dbJourney;
  }
  return inMemoryJourneys.find(j => j.id === id) || null;
};

const getActiveJourney = async (userId = null) => {
  if (userId) {
    const active = await journeys.findOne(j => j.userId === userId && j.status === 'ACTIVE');
    if (active) return active;
  }
  return inMemoryJourneys.find(j => j.status === 'ACTIVE') || null;
};

const createJourney = async (data, userId = null) => {
  const validationErrors = validateJourneyData(data);
  if (validationErrors.length > 0) {
    const error = new Error(validationErrors.join(', '));
    error.statusCode = 400;
    throw error;
  }

  const startName = typeof data.startLocation === 'string' ? data.startLocation.trim() : data.startLocation.name.trim();
  const destName = typeof data.destination === 'string' ? data.destination.trim() : data.destination.name.trim();

  // Complete any existing active journey for this user
  if (userId) {
    const existingActive = await journeys.findOne(j => j.userId === userId && j.status === 'ACTIVE');
    if (existingActive) {
      await journeys.update(existingActive.id, {
        status: 'COMPLETED',
        endedAt: new Date().toISOString()
      });
    }
  } else {
    const memActive = inMemoryJourneys.find(j => j.status === 'ACTIVE');
    if (memActive) {
      memActive.status = 'COMPLETED';
      memActive.endedAt = new Date().toISOString();
    }
  }

  // Geocoding helper
  const resolveDemoCoordinates = (name, isStart = true) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('college') || lower.includes('campus')) return { lat: 12.9716, lng: 77.5946 };
    if (lower.includes('library')) return { lat: 12.9784, lng: 77.6046 };
    if (lower.includes('home')) return { lat: 12.9352, lng: 77.6245 };
    if (lower.includes('metro') || lower.includes('station')) return { lat: 12.9756, lng: 77.5728 };
    if (lower.includes('hostel')) return { lat: 12.9650, lng: 77.6010 };
    return isStart ? { lat: 12.9716, lng: 77.5946 } : { lat: 12.9352, lng: 77.6245 };
  };

  const defaultStartCoords = resolveDemoCoordinates(startName, true);
  const defaultDestCoords = resolveDemoCoordinates(destName, false);

  const startLat = data.startLocation?.latitude !== undefined && data.startLocation?.latitude !== null
    ? data.startLocation.latitude
    : defaultStartCoords.lat;
  const startLng = data.startLocation?.longitude !== undefined && data.startLocation?.longitude !== null
    ? data.startLocation.longitude
    : defaultStartCoords.lng;

  const destLat = data.destination?.latitude !== undefined && data.destination?.latitude !== null
    ? data.destination.latitude
    : defaultDestCoords.lat;
  const destLng = data.destination?.longitude !== undefined && data.destination?.longitude !== null
    ? data.destination.longitude
    : defaultDestCoords.lng;

  const newJourney = {
    id: `j-${Date.now()}`,
    userId: userId || data.userId || 'demo-user-1',
    startLocation: {
      name: startName,
      latitude: startLat,
      longitude: startLng
    },
    destination: {
      name: destName,
      latitude: destLat,
      longitude: destLng
    },
    expectedArrival: new Date(data.expectedArrival).toISOString(),
    startedAt: new Date().toISOString(),
    endedAt: null,
    status: 'ACTIVE',
    currentState: 'NORMAL',
    currentCoordinates: {
      latitude: startLat,
      longitude: startLng,
      accuracy: 10,
      timestamp: Date.now()
    },
    selectedContacts: data.selectedContacts || [],
    selectedRoute: data.selectedRoute || null,
    notes: (data.notes || '').trim(),
    createdAt: new Date().toISOString()
  };

  await journeys.insert(newJourney);
  inMemoryJourneys.unshift(newJourney);

  // Broadcast journey start event to contacts via WebSockets
  broadcastJourneyUpdate(newJourney, 'JOURNEY_STARTED');

  return newJourney;
};

const updateJourneyStatus = async (id, status) => {
  const upperStatus = String(status || '').toUpperCase();
  if (!JOURNEY_STATUSES.includes(upperStatus)) {
    const error = new Error(`Invalid status: ${status}. Must be one of: ${JOURNEY_STATUSES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const journey = await getJourneyById(id);
  if (!journey) {
    const error = new Error('Journey not found');
    error.statusCode = 404;
    throw error;
  }

  const updates = {
    status: upperStatus,
    updatedAt: new Date().toISOString()
  };

  if (upperStatus === 'COMPLETED' || upperStatus === 'CANCELLED') {
    updates.endedAt = new Date().toISOString();
  } else if (upperStatus === 'ACTIVE' && !journey.startedAt) {
    updates.startedAt = new Date().toISOString();
  }

  await journeys.update(id, updates);
  Object.assign(journey, updates);

  // In-memory sync
  const mem = inMemoryJourneys.find(j => j.id === id);
  if (mem) Object.assign(mem, updates);

  // Broadcast status change
  broadcastJourneyUpdate(journey, upperStatus === 'COMPLETED' ? 'JOURNEY_COMPLETED' : 'JOURNEY_STATUS_CHANGED');

  return journey;
};

const updateJourneyState = async (id, state) => {
  const upperState = String(state || '').toUpperCase();
  if (!SAFETY_STATES.includes(upperState)) {
    const error = new Error(`Invalid safety state: ${state}. Must be one of: ${SAFETY_STATES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const journey = await getJourneyById(id);
  if (!journey) {
    const error = new Error('Journey not found');
    error.statusCode = 404;
    throw error;
  }

  const updates = {
    currentState: upperState,
    updatedAt: new Date().toISOString()
  };

  await journeys.update(id, updates);
  Object.assign(journey, updates);

  // In-memory sync
  const mem = inMemoryJourneys.find(j => j.id === id);
  if (mem) Object.assign(mem, updates);

  // Broadcast state change to contacts with per-contact permission filtering!
  broadcastJourneyUpdate(journey, 'SAFETY_STATE_CHANGED');

  return journey;
};

const updateJourneyLocation = async (id, coords) => {
  const journey = await getJourneyById(id);
  if (!journey) {
    const error = new Error('Journey not found');
    error.statusCode = 404;
    throw error;
  }

  const coordinates = {
    latitude: coords.latitude || coords.lat,
    longitude: coords.longitude || coords.lng,
    accuracy: coords.accuracy || 10,
    speed: coords.speed || 0,
    heading: coords.heading || null,
    timestamp: coords.timestamp || Date.now()
  };

  const updates = {
    currentCoordinates: coordinates,
    lastCoordinatesUpdate: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await journeys.update(id, updates);
  Object.assign(journey, updates);

  const mem = inMemoryJourneys.find(j => j.id === id);
  if (mem) Object.assign(mem, updates);

  // Broadcast location update with permission filtering
  broadcastJourneyUpdate(journey, 'LOCATION_UPDATE');

  return journey;
};

const updateJourneyRoute = async (id, routeData) => {
  const journey = await getJourneyById(id);
  if (!journey) {
    const error = new Error('Journey not found');
    error.statusCode = 404;
    throw error;
  }

  if (!routeData || !routeData.name) {
    const error = new Error('Route selection data is required');
    error.statusCode = 400;
    throw error;
  }

  const routeObj = {
    routeId: routeData.routeId || `route-${Date.now()}`,
    name: routeData.name,
    distance: routeData.distance || '3.5 km',
    estimatedDuration: routeData.estimatedDuration || '15 mins',
    routeType: routeData.routeType || 'SAFEPATH',
    contextualEstimate: routeData.contextualEstimate || 'Elevated Contextual Coverage',
    signals: Array.isArray(routeData.signals) ? routeData.signals : [],
    waypoints: Array.isArray(routeData.waypoints) ? routeData.waypoints : []
  };

  await journeys.update(id, { selectedRoute: routeObj, updatedAt: new Date().toISOString() });
  journey.selectedRoute = routeObj;

  const mem = inMemoryJourneys.find(j => j.id === id);
  if (mem) mem.selectedRoute = routeObj;

  return journey;
};

const deleteJourney = async (id) => {
  const journey = await getJourneyById(id);
  if (!journey) {
    const error = new Error('Journey not found');
    error.statusCode = 404;
    throw error;
  }

  if (journey.status === 'ACTIVE') {
    const error = new Error('Active journeys cannot be deleted. Please end or cancel the journey first.');
    error.statusCode = 400;
    throw error;
  }

  await journeys.remove(id);
  inMemoryJourneys = inMemoryJourneys.filter(j => j.id !== id);
  return true;
};

/**
 * Dispatches filtered updates to contacts selected for this journey
 */
async function broadcastJourneyUpdate(journey, eventType) {
  try {
    if (!journey.selectedContacts || journey.selectedContacts.length === 0) return;

    for (const contactId of journey.selectedContacts) {
      // Find contact record
      let contact = await contacts.findById(contactId);
      if (!contact) {
        contact = inMemoryJourneys.find(j => j.id === journey.id)
          ? require('./contactService').getContactById(contactId)
          : null;
      }
      if (!contact) continue;

      // Find user if contact is registered
      const targetUser = contact.email ? await users.findOne({ email: contact.email }) : null;

      // Compute strictly filtered view according to contact's permissions
      const filteredView = await getContactViewService().getContactViewForJourney(journey.id, contactId);

      const payload = {
        journeyId: journey.id,
        wardUserId: journey.userId,
        eventType,
        safetyState: journey.currentState,
        status: journey.status,
        contactView: filteredView,
        timestamp: new Date().toISOString()
      };

      if (targetUser) {
        socketService.sendToUser(targetUser.id, eventType, payload);
      }
    }

    // Also notify journey owner's sockets
    if (journey.userId) {
      socketService.sendToUser(journey.userId, eventType, {
        journeyId: journey.id,
        eventType,
        safetyState: journey.currentState,
        status: journey.status,
        timestamp: new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn('[JourneyService] broadcast error:', err.message);
  }
}

module.exports = {
  getJourneys,
  getJourneyById,
  getActiveJourney,
  createJourney,
  updateJourneyStatus,
  updateJourneyState,
  updateJourneyLocation,
  updateJourneyRoute,
  deleteJourney,
  validateJourneyData,
  broadcastJourneyUpdate
};
