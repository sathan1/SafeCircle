/**
 * AnomalyDetector Interface (Base Class)
 *
 * Defines the contract for journey anomaly analysis.
 * This clean abstraction enables swapping or augmenting the current
 * rule-based implementation with future ML / statistical models
 * without altering downstream consumers.
 */
class AnomalyDetector {
  constructor(name = 'BaseAnomalyDetector') {
    this.name = name;
  }

  /**
   * Analyzes journey telemetry and events to produce explainable anomaly signals.
   *
   * @param {Object} journey - Active Journey object
   * @param {Array<Object>} events - Chronological list of journey events
   * @param {Object} options - Optional context parameters
   * @returns {Array<Object>} List of explainable anomaly signals
   */
  analyzeJourney(journey, events = [], options = {}) {
    throw new Error('Method "analyzeJourney" must be implemented by concrete detector subclasses.');
  }
}

module.exports = AnomalyDetector;
