import { getApiBaseUrl } from './apiConfig';

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

  // Invite trusted contact (creates contact and pending invitation)
  inviteContact: async (invitationData) => {
    const res = await request('/api/contacts/invite', {
      method: 'POST',
      body: JSON.stringify(invitationData)
    });
    return res.data;
  },

  // Get pending invitations for logged-in user
  getPendingInvitations: async () => {
    const res = await request('/api/contacts/invitations/pending');
    return res.data || [];
  },

  // Respond to invitation (ACCEPTED or REJECTED)
  respondToInvitation: async (invitationId, status) => {
    const res = await request(`/api/contacts/invitations/${invitationId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ status })
    });
    return res.data;
  },

  // Get wards (people who have invited logged-in user to their safety circle)
  getWards: async () => {
    const res = await request('/api/contacts/wards');
    return res.data || [];
  },

  // Get live journey view of a ward
  getWardJourneyView: async (journeyId, contactId) => {
    const res = await request(`/api/contacts/wards/${journeyId}/view?contactId=${encodeURIComponent(contactId)}`);
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
