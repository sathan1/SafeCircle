const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Service to interact with Phase 9 Contact Dashboard backend endpoints
 */
export const contactDashboardService = {
  /**
   * Fetches permission-governed contact view for a specific journey and contact
   * Backend returns ONLY permitted information, strictly stripping restricted data.
   *
   * @param {string} journeyId - Active journey ID
   * @param {string} contactId - Trusted contact ID
   * @returns {Promise<Object>} Evaluated contact view payload
   */
  async getContactView(journeyId, contactId) {
    const response = await fetch(`${API_BASE_URL}/api/journeys/${journeyId}/contact-view/${contactId}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch contact view');
    }
    return data.data;
  },

  /**
   * Updates journey safety state directly for instant interactive simulation
   *
   * @param {string} journeyId - Journey ID
   * @param {string} state - 'NORMAL' | 'CAUTION' | 'ELEVATED' | 'CRISIS'
   * @returns {Promise<Object>} Updated journey record
   */
  async updateSafetyState(journeyId, state) {
    const response = await fetch(`${API_BASE_URL}/api/journeys/${journeyId}/state`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update safety state');
    }
    return data.data;
  }
};
