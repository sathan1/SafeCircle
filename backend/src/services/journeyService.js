const { JOURNEY_STATUSES, SAFETY_STATES } = require('../models/Journey');

// In-memory demo repository pre-seeded with historical records
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
const getJourneys = async () => {
  return [...inMemoryJourneys].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const getJourneyById = async (id) => {
  return inMemoryJourneys.find(j => j.id === id) || null;
};

const getActiveJourney = async () => {
  return inMemoryJourneys.find(j => j.status === 'ACTIVE') || null;
};

const createJourney = async (data) => {
  const validationErrors = validateJourneyData(data);
  if (validationErrors.length > 0) {
    const error = new Error(validationErrors.join(', '));
    error.statusCode = 400;
    throw error;
  }

  // If another journey is active, optionally complete or note it
  const existingActive = inMemoryJourneys.find(j => j.status === 'ACTIVE');
  if (existingActive) {
    existingActive.status = 'COMPLETED';
    existingActive.endedAt = new Date().toISOString();
  }

  const startName = typeof data.startLocation === 'string' ? data.startLocation.trim() : data.startLocation.name.trim();
  const destName = typeof data.destination === 'string' ? data.destination.trim() : data.destination.name.trim();

  // Prototype geocoding helper to provide realistic map coordinates for demo routes
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
    userId: data.userId || 'demo-user-1',
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
    selectedContacts: data.selectedContacts || [],
    selectedRoute: data.selectedRoute || null,
    notes: (data.notes || '').trim(),
    createdAt: new Date().toISOString()
  };

  inMemoryJourneys.unshift(newJourney);
  return newJourney;
};

const updateJourneyStatus = async (id, status) => {
  const upperStatus = String(status || '').toUpperCase();
  if (!JOURNEY_STATUSES.includes(upperStatus)) {
    const error = new Error(`Invalid status: ${status}. Must be one of: ${JOURNEY_STATUSES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const journey = inMemoryJourneys.find(j => j.id === id);
  if (!journey) {
    const error = new Error('Journey not found');
    error.statusCode = 404;
    throw error;
  }

  journey.status = upperStatus;
  if (upperStatus === 'COMPLETED' || upperStatus === 'CANCELLED') {
    journey.endedAt = new Date().toISOString();
  } else if (upperStatus === 'ACTIVE' && !journey.startedAt) {
    journey.startedAt = new Date().toISOString();
  }

  journey.updatedAt = new Date().toISOString();
  return journey;
};

const updateJourneyState = async (id, state) => {
  const upperState = String(state || '').toUpperCase();
  if (!SAFETY_STATES.includes(upperState)) {
    const error = new Error(`Invalid safety state: ${state}. Must be one of: ${SAFETY_STATES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const journey = inMemoryJourneys.find(j => j.id === id);
  if (!journey) {
    const error = new Error('Journey not found');
    error.statusCode = 404;
    throw error;
  }

  journey.currentState = upperState;
  journey.updatedAt = new Date().toISOString();
  return journey;
};

const updateJourneyRoute = async (id, routeData) => {
  const journey = inMemoryJourneys.find(j => j.id === id);
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

  journey.selectedRoute = {
    routeId: routeData.routeId || `route-${Date.now()}`,
    name: routeData.name,
    distance: routeData.distance || '3.5 km',
    estimatedDuration: routeData.estimatedDuration || '15 mins',
    routeType: routeData.routeType || 'SAFEPATH',
    contextualEstimate: routeData.contextualEstimate || 'Elevated Contextual Coverage',
    signals: Array.isArray(routeData.signals) ? routeData.signals : [],
    waypoints: Array.isArray(routeData.waypoints) ? routeData.waypoints : []
  };

  journey.updatedAt = new Date().toISOString();
  return journey;
};

const deleteJourney = async (id) => {
  const journey = inMemoryJourneys.find(j => j.id === id);
  if (!journey) {
    const error = new Error('Journey not found');
    error.statusCode = 404;
    throw error;
  }

  // Critical rule: Do not allow an active journey to disappear without explicitly ending/cancelling it
  if (journey.status === 'ACTIVE') {
    const error = new Error('Active journeys cannot be deleted. Please end or cancel the journey first.');
    error.statusCode = 400;
    throw error;
  }

  inMemoryJourneys = inMemoryJourneys.filter(j => j.id !== id);
  return true;
};

module.exports = {
  getJourneys,
  getJourneyById,
  getActiveJourney,
  createJourney,
  updateJourneyStatus,
  updateJourneyState,
  updateJourneyRoute,
  deleteJourney,
  validateJourneyData
};
