const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
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
    console.error(`[CheckIn API Error] ${options.method || 'GET'} ${endpoint}:`, err.message);
    throw err;
  }
};

export const checkInService = {
  // Create a new check-in for a journey
  createCheckIn: async (journeyId, data = {}) => {
    const res = await request(`/api/journeys/${journeyId}/checkins`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  },

  // Get all check-ins for a journey
  getCheckIns: async (journeyId) => {
    const res = await request(`/api/journeys/${journeyId}/checkins`);
    return res.data || [];
  },

  // Get active pending check-in (auto-detects overdue)
  getActiveCheckIn: async (journeyId) => {
    const res = await request(`/api/journeys/${journeyId}/checkins/active`);
    return res.data;
  },

  // Respond to a check-in (SAFE or NEED_HELP)
  respondToCheckIn: async (checkInId, response) => {
    const res = await request(`/api/checkins/${checkInId}/respond`, {
      method: 'PATCH',
      body: JSON.stringify({ response })
    });
    return res.data;
  },

  // Evaluate / trigger missed check-ins
  checkMissedCheckIns: async (journeyId) => {
    const res = await request(`/api/journeys/${journeyId}/checkins/check-missed`, {
      method: 'POST'
    });
    return res.data;
  },

  // Reset check-ins for demo
  resetCheckIns: async (journeyId) => {
    const res = await request(`/api/journeys/${journeyId}/checkins/reset`, {
      method: 'POST'
    });
    return res.data;
  },

  // Get escalations for a journey
  getEscalations: async (journeyId) => {
    const res = await request(`/api/journeys/${journeyId}/escalations`);
    return res.data || [];
  },

  // Simulate an escalation
  simulateEscalation: async (journeyId, data = {}) => {
    const res = await request(`/api/journeys/${journeyId}/escalations/simulate`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  },

  // Resolve an escalation
  resolveEscalation: async (escalationId, reason = 'Resolved by user') => {
    const res = await request(`/api/escalations/${escalationId}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ reason })
    });
    return res.data;
  }
};

export default checkInService;
