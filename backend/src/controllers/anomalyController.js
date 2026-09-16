const anomalyIntelligenceService = require('../services/anomalyIntelligenceService');

/**
 * @desc    Get explainable anomaly analysis for a journey
 * @route   GET /api/journeys/:id/anomaly-analysis
 * @access  Public / Prototype
 */
const getAnomalyAnalysis = async (req, res) => {
  try {
    const { id: journeyId } = req.params;
    const analysis = await anomalyIntelligenceService.getAnomalyAnalysis(journeyId);

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error running anomaly analysis'
    });
  }
};

/**
 * @desc    Simulate/feed an explainable anomaly signal to the Safety State Engine
 * @route   POST /api/journeys/:id/anomaly-signals
 * @access  Public / Prototype
 */
const simulateAnomalySignal = async (req, res) => {
  try {
    const { id: journeyId } = req.params;
    const result = await anomalyIntelligenceService.simulateAnomalySignal(journeyId, req.body || {});

    res.status(200).json({
      success: true,
      data: result,
      message: `Anomaly signal "${result.emittedSignal}" generated and processed by Safety State Engine`
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Failed to simulate anomaly signal'
    });
  }
};

/**
 * @desc    Clear active anomaly signals and recalibrate state to NORMAL
 * @route   POST /api/journeys/:id/anomaly-clear
 * @access  Public / Prototype
 */
const clearAnomalySignals = async (req, res) => {
  try {
    const { id: journeyId } = req.params;
    const result = await anomalyIntelligenceService.clearSignals(journeyId);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Active anomaly signals cleared'
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Failed to clear anomaly signals'
    });
  }
};

module.exports = {
  getAnomalyAnalysis,
  simulateAnomalySignal,
  clearAnomalySignals
};
