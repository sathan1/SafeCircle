import { getApiBaseUrl } from './apiConfig';

const request = async (endpoint, options = {}) => {
  const url = `${getApiBaseUrl()}${endpoint}`;
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
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
    console.error(`[Journey API Error] ${options.method || 'GET'} ${endpoint}:`, err.message);
    throw err;
  }
};

export const journeyService = {
  // Fetch all journeys
  getJourneys: async () => {
    const res = await request('/api/journeys');
    return res.data || [];
  },

  // Get single journey by ID
  getJourneyById: async (id) => {
    const res = await request(`/api/journeys/${id}`);
    return res.data;
  },

  // Create new active journey
  createJourney: async (journeyData) => {
    const res = await request('/api/journeys', {
      method: 'POST',
      body: JSON.stringify(journeyData)
    });
    return res.data;
  },

  // Update journey live location
  updateLocation: async (id, coords) => {
    const res = await request(`/api/journeys/${id}/location`, {
      method: 'POST',
      body: JSON.stringify(coords)
    });
    return res.data;
  },

  // Update journey status (COMPLETED, CANCELLED)
  updateJourneyStatus: async (id, status) => {
    const res = await request(`/api/journeys/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    return res.data;
  },

  // Update journey safety state
  updateJourneyState: async (id, state) => {
    const res = await request(`/api/journeys/${id}/state`, {
      method: 'PATCH',
      body: JSON.stringify({ state })
    });
    return res.data;
  },

  // Update selected SafePath route
  updateJourneyRoute: async (id, routeData) => {
    const res = await request(`/api/journeys/${id}/route`, {
      method: 'PATCH',
      body: JSON.stringify(routeData)
    });
    return res.data;
  },

  // Delete non-active journey
  deleteJourney: async (id) => {
    return await request(`/api/journeys/${id}`, {
      method: 'DELETE'
    });
  }
};

export default journeyService;
