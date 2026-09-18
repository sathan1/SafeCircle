import { getApiBaseUrl } from './apiConfig';

const getApiUrl = () => `${getApiBaseUrl()}/api/privacy`;

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const privacyService = {
  async getPolicies() {
    const response = await fetch(getApiUrl(), {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch privacy policies');
    return response.json();
  },

  async getPolicyForContact(contactId) {
    const response = await fetch(`${getApiUrl()}/${contactId}`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch privacy policy');
    return response.json();
  },

  async updatePolicy(contactId, permissions) {
    const response = await fetch(`${getApiUrl()}/${contactId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ permissions })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update policy');
    return data;
  },

  async evaluatePolicy(contactId, safetyState) {
    const response = await fetch(`${getApiUrl()}/evaluate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ contactId, safetyState })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to evaluate policy');
    return data;
  }
};

export default privacyService;
