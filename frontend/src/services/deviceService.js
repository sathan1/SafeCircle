const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Service to interact with Phase 11 Device Fallback & Connectivity endpoints
 */
export const deviceService = {
  /**
   * Fetches current phone and wearable status for a journey
   */
  async getDeviceStatus(journeyId) {
    const response = await fetch(`${API_BASE_URL}/api/journeys/${journeyId}/device-status`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch device status');
    }
    return data.data;
  },

  /**
   * Simulates phone becoming unavailable (triggers wearable fallback)
   */
  async simulatePhoneUnavailable(journeyId) {
    const response = await fetch(`${API_BASE_URL}/api/journeys/${journeyId}/device-fallback/phone-unavailable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to simulate phone unavailable');
    }
    return data.data;
  },

  /**
   * Simulates phone reconnecting
   */
  async simulatePhoneConnected(journeyId) {
    const response = await fetch(`${API_BASE_URL}/api/journeys/${journeyId}/device-fallback/phone-connected`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to simulate phone connected');
    }
    return data.data;
  },

  /**
   * Updates wearable status (CONNECTED or DISCONNECTED)
   */
  async simulateWearableStatus(journeyId, status) {
    const response = await fetch(`${API_BASE_URL}/api/journeys/${journeyId}/device-fallback/wearable-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update wearable status');
    }
    return data.data;
  },

  /**
   * Resets device states to standard baseline
   */
  async resetDeviceState(journeyId) {
    const response = await fetch(`${API_BASE_URL}/api/journeys/${journeyId}/device-fallback/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to reset device state');
    }
    return data.data;
  }
};
