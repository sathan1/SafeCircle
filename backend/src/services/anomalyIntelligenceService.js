const journeyService = require('./journeyService');
const safetyStateEngine = require('./safetyStateEngine');
const RuleBasedAnomalyDetector = require('./anomaly/RuleBasedAnomalyDetector');

/**
 * AnomalyIntelligenceService
 *
 * Coordinates anomaly detection and passes explainable signals to the
 * Safety State Engine.
 *
 * CRITICAL ARCHITECTURAL PRINCIPLE:
 * Anomaly Intelligence identifies signals — it does NOT decide the final state.
 * The Safety State Engine remains the sole authority for safety state transitions.
 */
class AnomalyIntelligenceService {
  constructor(detector = new RuleBasedAnomalyDetector()) {
    this.detector = detector;
  }

  /**
   * Set or swap the detector implementation (e.g. for ML integration in future phases)
   */
  setDetector(newDetector) {
    if (!newDetector || typeof newDetector.analyzeJourney !== 'function') {
      throw new Error('Detector must implement the analyzeJourney interface.');
    }
    this.detector = newDetector;
  }

  /**
   * Retrieves current explainable anomaly signals for a journey
   *
   * @param {string} journeyId - Active Journey ID
   * @returns {Promise<Object>} Anomaly analysis payload
   */
  async getAnomalyAnalysis(journeyId) {
    const journey = await journeyService.getJourneyById(journeyId);
    if (!journey) {
      const error = new Error('Journey not found');
      error.statusCode = 404;
      throw error;
    }

    const events = (await safetyStateEngine.getJourneyEvents(journeyId)) || [];
    const signals = this.detector.analyzeJourney(journey, events);

    return {
      journeyId: journey.id,
      signals,
      signalsCount: signals.length,
      analysisType: this.detector.detectorType || 'RULE_BASED_PROTOTYPE',
      analysisLabel: this.detector.label || 'Prototype rule-based anomaly intelligence',
      currentSafetyState: journey.currentState,
      evaluatedAt: new Date().toISOString()
    };
  }

  /**
   * Simulates an anomaly signal by passing it directly to the Safety State Engine.
   * Ensures the Safety State Engine evaluates the score and determines the safety state.
   *
   * @param {string} journeyId - Journey ID
   * @param {Object} signalData - { type, description, metadata }
   * @returns {Promise<Object>} Analysis result and safety state update
   */
  async simulateAnomalySignal(journeyId, signalData) {
    const journey = await journeyService.getJourneyById(journeyId);
    if (!journey) {
      const error = new Error('Journey not found');
      error.statusCode = 404;
      throw error;
    }

    const type = String(signalData.type || '').toUpperCase();
    const eventPayload = {
      type,
      description: signalData.description || `Anomaly signal ${type} generated`,
      source: 'ANOMALY_ENGINE',
      metadata: signalData.metadata || {}
    };

    // Feed to Safety State Engine (the state authority)
    const stateResult = await safetyStateEngine.processNewEvent(journeyId, eventPayload);

    // Retrieve fresh anomaly signals
    const analysis = await this.getAnomalyAnalysis(journeyId);

    return {
      success: true,
      journeyId,
      emittedSignal: type,
      safetyStateResult: stateResult,
      analysis
    };
  }

  /**
   * Clears all active signals and resets Safety State Engine to baseline NORMAL.
   *
   * @param {string} journeyId - Journey ID
   * @returns {Promise<Object>} Reset outcome
   */
  async clearSignals(journeyId) {
    const resetResult = await safetyStateEngine.resetSafetySimulation(journeyId);
    const analysis = await this.getAnomalyAnalysis(journeyId);

    return {
      success: true,
      journeyId,
      message: 'Active anomaly signals cleared. Safety state returned to NORMAL baseline.',
      resetResult,
      analysis
    };
  }
}

// Export singleton instance
const anomalyIntelligenceService = new AnomalyIntelligenceService();

module.exports = anomalyIntelligenceService;
