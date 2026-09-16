const AnomalyDetector = require('./AnomalyDetector');

/**
 * RuleBasedAnomalyDetector
 *
 * Implements transparent, explainable anomaly detection rules.
 * Strictly avoids black-box claims or danger probability estimates.
 * Produces structured anomaly signals consumed by the Safety State Engine.
 */
class RuleBasedAnomalyDetector extends AnomalyDetector {
  constructor() {
    super('RuleBasedAnomalyDetector');
    this.detectorType = 'RULE_BASED_PROTOTYPE';
    this.label = 'Prototype rule-based anomaly intelligence';
  }

  /**
   * Evaluates active events and journey context to output structured anomaly signals.
   *
   * @param {Object} journey - Active Journey object
   * @param {Array<Object>} events - Journey events (ordered chronologically)
   * @param {Object} options - Context parameters (e.g. checkIns, escalations)
   * @returns {Array<Object>} List of explainable anomaly signals
   */
  analyzeJourney(journey, events = [], options = {}) {
    const signals = [];

    // Filter out safe confirmations (safe confirmation clears active signals)
    const sorted = [...events].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    let lastSafeIndex = -1;
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (sorted[i].type === 'USER_CONFIRMED_SAFE') {
        lastSafeIndex = i;
        break;
      }
    }

    const activeEvents = lastSafeIndex >= 0 ? sorted.slice(lastSafeIndex + 1) : sorted;

    // Evaluate each anomaly type
    for (const evt of activeEvents) {
      switch (evt.type) {
        case 'ROUTE_DEVIATION': {
          const deviationMeters = evt.metadata?.deviationMeters || 350;
          const confidence = deviationMeters > 400 ? 'High' : 'Medium';

          signals.push({
            id: `sig-dev-${evt.id || Date.now()}`,
            type: 'ROUTE_DEVIATION',
            title: 'Route Deviation',
            description: evt.description || 'Journey route differs from the selected SafePath corridor.',
            confidence, // Anomaly confidence: Low | Medium | High
            confidenceMetric: 'Anomaly confidence',
            confidenceRationale: `Deviation threshold calculated at ~${deviationMeters}m off corridor.`,
            source: evt.source === 'DEMO' ? 'Demo route analysis' : 'SafePath Corridor Deviation Evaluator',
            suggestedScoreContribution: 25,
            timestamp: evt.timestamp || new Date().toISOString(),
            eventId: evt.id
          });
          break;
        }

        case 'PROLONGED_STOP': {
          const stopDurationMinutes = evt.metadata?.stopDurationMinutes || 12;
          const confidence = stopDurationMinutes > 15 ? 'High' : 'Medium';

          signals.push({
            id: `sig-stop-${evt.id || Date.now()}`,
            type: 'PROLONGED_STOP',
            title: 'Prolonged Stop',
            description: evt.description || 'Stationary pause exceeding standard transit checkpoint window.',
            confidence,
            confidenceMetric: 'Anomaly confidence',
            confidenceRationale: `Zero-velocity dwell time exceeding ${stopDurationMinutes} minutes.`,
            source: 'Dwell Time & Motion Analysis',
            suggestedScoreContribution: 20,
            timestamp: evt.timestamp || new Date().toISOString(),
            eventId: evt.id
          });
          break;
        }

        case 'MISSED_CHECKIN': {
          const overdueSeconds = evt.metadata?.overdueSeconds || 60;
          const confidence = 'High';

          signals.push({
            id: `sig-chk-${evt.id || Date.now()}`,
            type: 'MISSED_CHECKIN',
            title: 'Missed Check-In',
            description: evt.description || 'Scheduled safety check-in prompt elapsed without user confirmation.',
            confidence,
            confidenceMetric: 'Anomaly confidence',
            confidenceRationale: `Check-in response window expired by ~${overdueSeconds} seconds.`,
            source: 'Check-In Cadence Monitor',
            suggestedScoreContribution: 25,
            timestamp: evt.timestamp || new Date().toISOString(),
            eventId: evt.id
          });
          break;
        }

        case 'UNUSUAL_JOURNEY_DELAY': {
          const delayMinutes = evt.metadata?.delayMinutes || 18;
          const confidence = delayMinutes > 30 ? 'High' : 'Medium';

          signals.push({
            id: `sig-delay-${evt.id || Date.now()}`,
            type: 'UNUSUAL_JOURNEY_DELAY',
            title: 'Unexpected Delay',
            description: evt.description || 'Journey progress is notably slower than estimated arrival time.',
            confidence,
            confidenceMetric: 'Anomaly confidence',
            confidenceRationale: `Pace difference between expected and observed transit exceeds ${delayMinutes} mins.`,
            source: 'ETA Progress Estimator',
            suggestedScoreContribution: 15,
            timestamp: evt.timestamp || new Date().toISOString(),
            eventId: evt.id
          });
          break;
        }

        case 'DEVICE_OFFLINE': {
          // Device offline is inherently a low-level signal unless combined with other anomalies
          const hasOtherAnomalies = activeEvents.some(e => ['ROUTE_DEVIATION', 'PROLONGED_STOP', 'MISSED_CHECKIN'].includes(e.type));
          const confidence = hasOtherAnomalies ? 'Medium' : 'Low';

          signals.push({
            id: `sig-off-${evt.id || Date.now()}`,
            type: 'DEVICE_OFFLINE',
            title: 'Device Offline',
            description: evt.description || 'Cellular escort telemetry or heartbeat temporarily interrupted.',
            confidence,
            confidenceMetric: 'Anomaly confidence',
            confidenceRationale: hasOtherAnomalies 
              ? 'Telemetry dropped concurrently with active route or motion anomaly.'
              : 'Low-level signal (isolated network drop).',
            source: 'Telemetry Heartbeat Monitor',
            suggestedScoreContribution: 10,
            timestamp: evt.timestamp || new Date().toISOString(),
            eventId: evt.id
          });
          break;
        }

        default:
          break;
      }
    }

    return signals;
  }
}

module.exports = RuleBasedAnomalyDetector;
