const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Service to interact with Phase 10 Anomaly Intelligence endpoints
 */
export const anomalyService = {
  /**
   * Fetches explainable anomaly signals and analysis for a journey
   *
   * @param {string} journeyId - Active Journey ID
   * @returns {Promise<Object>} Anomaly analysis payload
   */
  async getAnomalyAnalysis(journeyId) {
    const response = await fetch(`${API_BASE_URL}/api/journeys/${journeyId}/anomaly-analysis`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch anomaly analysis');
    }
    return data.data;
  },

  /**
   * Simulates an explainable anomaly signal and feeds it to the Safety State Engine
   *
   * @param {string} journeyId - Journey ID
   * @param {Object} signalPayload - { type, description, metadata }
   * @returns {Promise<Object>} State evaluation and updated analysis
   */
  async simulateAnomaly(journeyId, signalPayload) {
    const response = await fetch(`${API_BASE_URL}/api/journeys/${journeyId}/anomaly-signals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signalPayload)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to simulate anomaly signal');
    }
    return data.data;
  },

  /**
   * Clears active anomaly signals and resets safety state to NORMAL baseline
   *
   * @param {string} journeyId - Journey ID
   * @returns {Promise<Object>} Reset outcome
   */
  async clearSignals(journeyId) {
    const response = await fetch(`${API_BASE_URL}/api/journeys/${journeyId}/anomaly-clear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to clear anomaly signals');
    }
    return data.data;
  }
};
