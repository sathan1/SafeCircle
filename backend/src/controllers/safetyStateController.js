const safetyStateEngine = require('../services/safetyStateEngine');

// @desc    Add event to journey and trigger Safety State Engine evaluation
// @route   POST /api/journeys/:id/events
const addEvent = async (req, res) => {
  try {
    const journeyId = req.params.id;
    const result = await safetyStateEngine.processNewEvent(journeyId, req.body);
    res.status(201).json({
      success: true,
      data: result,
      message: `Event processed. Current state: ${result.currentSafetyState}`
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Failed to process journey event'
    });
  }
};

// @desc    Get all events for a journey (newest first)
// @route   GET /api/journeys/:id/events
const getEvents = async (req, res) => {
  try {
    const journeyId = req.params.id;
    const events = await safetyStateEngine.getJourneyEvents(journeyId);
    res.status(200).json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch journey events'
    });
  }
};

// @desc    Get current safety state & score evaluation
// @route   GET /api/journeys/:id/safety-state
const getSafetyState = async (req, res) => {
  try {
    const journeyId = req.params.id;
    const stateEvaluation = await safetyStateEngine.getSafetyState(journeyId);
    res.status(200).json({
      success: true,
      data: stateEvaluation
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch safety state'
    });
  }
};

// @desc    Get safety state transition history
// @route   GET /api/journeys/:id/safety-history
const getSafetyHistory = async (req, res) => {
  try {
    const journeyId = req.params.id;
    const history = await safetyStateEngine.getSafetyHistory(journeyId);
    res.status(200).json({
      success: true,
      data: history,
      count: history.length
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch safety history'
    });
  }
};

// @desc    Reset safety simulation back to NORMAL
// @route   POST /api/journeys/:id/safety-reset
const resetSafetySimulation = async (req, res) => {
  try {
    const journeyId = req.params.id;
    const result = await safetyStateEngine.resetSafetySimulation(journeyId);
    res.status(200).json({
      success: true,
      data: result,
      message: 'Safety simulation reset successfully'
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Failed to reset safety simulation'
    });
  }
};

module.exports = {
  addEvent,
  getEvents,
  getSafetyState,
  getSafetyHistory,
  resetSafetySimulation
};
