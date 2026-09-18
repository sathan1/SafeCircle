import { getApiBaseUrl } from './apiConfig';

const request = async (endpoint, options = {}) => {
  const url = `${getApiBaseUrl()}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(json.message || `HTTP error ${response.status}: ${response.statusText}`);
    }

    return json;
  } catch (err) {
    console.error(`[Safety State API Error] ${options.method || 'GET'} ${endpoint}:`, err.message);
    throw err;
  }
};

export const safetyStateService = {
  // Get safety state evaluation and active signals
  getSafetyState: async (journeyId) => {
    const res = await request(`/api/journeys/${journeyId}/safety-state`);
    return res.data;
  },

  // Get journey event history (newest first)
  getEvents: async (journeyId) => {
    const res = await request(`/api/journeys/${journeyId}/events`);
    return res.data || [];
  },

  // Post a new journey event (triggers Safety State Engine)
  addEvent: async (journeyId, eventData) => {
    const res = await request(`/api/journeys/${journeyId}/events`, {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
    return res.data;
  },

  // Get state transition history
  getSafetyHistory: async (journeyId) => {
    const res = await request(`/api/journeys/${journeyId}/safety-history`);
    return res.data || [];
  },

  // Reset safety simulation back to NORMAL (Score 0)
  resetSafetySimulation: async (journeyId) => {
    const res = await request(`/api/journeys/${journeyId}/safety-reset`, {
      method: 'POST'
    });
    return res.data;
  }
};

export default safetyStateService;
