const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://safecircle-backend-38w8.onrender.com';

export const SAFETY_STATES = ['NORMAL', 'CAUTION', 'ELEVATED', 'CRISIS'];

export const INFORMATION_TYPES = [
  'JOURNEY_STATUS',
  'APPROXIMATE_LOCATION',
  'LIVE_LOCATION',
  'EMERGENCY_STATUS',
  'JOURNEY_DETAILS'
];

export const INFORMATION_LABELS = {
  JOURNEY_STATUS: 'Journey Status',
  APPROXIMATE_LOCATION: 'Approximate Location',
  LIVE_LOCATION: 'Live Location',
  EMERGENCY_STATUS: 'Emergency Status',
  JOURNEY_DETAILS: 'Journey Details'
};

export const INFORMATION_DESCRIPTIONS = {
  JOURNEY_STATUS: 'Started, on track, delayed, or completed milestone signals',
  APPROXIMATE_LOCATION: 'General geographic area radius (500m) without precise coordinates',
  LIVE_LOCATION: 'Continuous high-accuracy real-time GPS coordinates and route map',
  EMERGENCY_STATUS: 'Safety check triggers, caution warnings, and escalated crisis state',
  JOURNEY_DETAILS: 'Departure origin, destination name, estimated arrival time (ETA)'
};

export const DEFAULT_PERMISSIONS = {
  NORMAL: {
    JOURNEY_STATUS: true,
    APPROXIMATE_LOCATION: false,
    LIVE_LOCATION: false,
    EMERGENCY_STATUS: false,
    JOURNEY_DETAILS: false
  },
  CAUTION: {
    JOURNEY_STATUS: true,
    APPROXIMATE_LOCATION: false,
    LIVE_LOCATION: false,
    EMERGENCY_STATUS: true,
    JOURNEY_DETAILS: false
  },
  ELEVATED: {
    JOURNEY_STATUS: true,
    APPROXIMATE_LOCATION: true,
    LIVE_LOCATION: false,
    EMERGENCY_STATUS: true,
    JOURNEY_DETAILS: true
  },
  CRISIS: {
    JOURNEY_STATUS: true,
    APPROXIMATE_LOCATION: true,
    LIVE_LOCATION: true,
    EMERGENCY_STATUS: true,
    JOURNEY_DETAILS: true
  }
};

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
    console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, err.message);
    throw err;
  }
};

export const contactService = {
  // Fetch all trusted contacts
  getContacts: async () => {
    const res = await request('/api/contacts');
    return res.data || [];
  },

  // Get single contact by ID
  getContactById: async (id) => {
    const res = await request(`/api/contacts/${id}`);
    return res.data;
  },

  // Create new contact
  createContact: async (contactData) => {
    const res = await request('/api/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData)
    });
    return res.data;
  },

  // Update existing contact
  updateContact: async (id, contactData) => {
    const res = await request(`/api/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contactData)
    });
    return res.data;
  },

  // Toggle active/inactive status
  toggleContactStatus: async (id, isActive) => {
    const res = await request(`/api/contacts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive })
    });
    return res.data;
  },

  // Delete contact
  deleteContact: async (id) => {
    return await request(`/api/contacts/${id}`, {
      method: 'DELETE'
    });
  },

  // Get permissions for specific contact
  getContactPermissions: async (contactId) => {
    const res = await request(`/api/contacts/${contactId}/permissions`);
    return res.data;
  },

  // Update permissions for specific contact
  updateContactPermissions: async (contactId, permissions) => {
    const res = await request(`/api/contacts/${contactId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissions })
    });
    return res.data;
  },

  // Restore recommended default policy for contact
  restoreDefaultPermissions: async (contactId) => {
    const res = await request(`/api/contacts/${contactId}/permissions/restore-default`, {
      method: 'POST'
    });
    return res.data;
  },

  // Query backend authorization check
  checkAuthorization: async (contactId, safetyState, informationType) => {
    const res = await request(`/api/contacts/${contactId}/authorize`, {
      method: 'POST',
      body: JSON.stringify({ safetyState, informationType })
    });
    return res.data;
  }
};

export default contactService;
