const checkInService = require('../services/checkInService');
const escalationEngine = require('../services/escalationEngine');

// @desc    Create a new check-in for an active journey
// @route   POST /api/journeys/:id/checkins
const createCheckIn = async (req, res) => {
  try {
    const journeyId = req.params.id;
    const checkIn = await checkInService.createCheckIn(journeyId, req.body);
    res.status(201).json({
      success: true,
      data: checkIn,
      message: 'Check-in requested successfully'
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Failed to create check-in'
    });
  }
};

// @desc    Get check-in history for a journey
// @route   GET /api/journeys/:id/checkins
const getCheckIns = async (req, res) => {
  try {
    const journeyId = req.params.id;
    const history = await checkInService.getCheckIns(journeyId);
    res.status(200).json({
      success: true,
      data: history,
      count: history.length
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch check-ins'
    });
  }
};

// @desc    Get active pending check-in for a journey
// @route   GET /api/journeys/:id/checkins/active
const getActiveCheckIn = async (req, res) => {
  try {
    const journeyId = req.params.id;
    const active = await checkInService.getActiveCheckIn(journeyId);
    res.status(200).json({
      success: true,
      data: active
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch active check-in'
    });
  }
};

// @desc    Respond to a check-in (SAFE or NEED_HELP)
// @route   PATCH /api/checkins/:id/respond
const respondToCheckIn = async (req, res) => {
  try {
    const checkInId = req.params.id;
    const { response } = req.body;
    if (!response) {
      return res.status(400).json({
        success: false,
        message: 'Response field is required (SAFE or NEED_HELP)'
      });
    }

    const result = await checkInService.respondToCheckIn(checkInId, response);
    res.status(200).json({
      success: true,
      data: result,
      message: `Check-in recorded with response: ${response}`
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Failed to respond to check-in'
    });
  }
};

// @desc    Check and transition overdue check-ins to MISSED
// @route   POST /api/journeys/:id/checkins/check-missed
const checkMissedCheckIns = async (req, res) => {
  try {
    const journeyId = req.params.id;
    const results = await checkInService.checkMissedCheckIns(journeyId);
    res.status(200).json({
      success: true,
      data: results,
      missedCount: results.length,
      message: results.length > 0 ? `Detected ${results.length} missed check-in(s)` : 'No overdue check-ins found'
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to evaluate missed check-ins'
    });
  }
};

// @desc    Reset check-ins for a journey
// @route   POST /api/journeys/:id/checkins/reset
const resetCheckIns = async (req, res) => {
  try {
    const journeyId = req.params.id;
    const result = await checkInService.resetCheckIns(journeyId);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Failed to reset check-ins'
    });
  }
};

// @desc    Get escalation history for a journey
// @route   GET /api/journeys/:id/escalations
const getEscalations = async (req, res) => {
  try {
    const journeyId = req.params.id;
    const escalations = await escalationEngine.getEscalations(journeyId);
    res.status(200).json({
      success: true,
      data: escalations,
      count: escalations.length
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch escalations'
    });
  }
};

// @desc    Simulate escalation
// @route   POST /api/journeys/:id/escalations/simulate
const simulateEscalation = async (req, res) => {
  try {
    const journeyId = req.params.id;
    const { level, trigger } = req.body;
    const record = await escalationEngine.triggerEscalation(
      journeyId,
      null,
      trigger || 'Manual escalation simulation',
      { level }
    );
    res.status(201).json({
      success: true,
      data: record,
      message: `Escalation ${record.level} triggered (SIMULATION)`
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Failed to simulate escalation'
    });
  }
};

// @desc    Resolve a specific escalation
// @route   PATCH /api/escalations/:id/resolve
const resolveEscalation = async (req, res) => {
  try {
    const escalationId = req.params.id;
    const { reason } = req.body;
    const resolved = await escalationEngine.resolveEscalationById(
      escalationId,
      reason || 'Resolved by user'
    );
    res.status(200).json({
      success: true,
      data: resolved,
      message: 'Escalation resolved'
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Failed to resolve escalation'
    });
  }
};

module.exports = {
  createCheckIn,
  getCheckIns,
  getActiveCheckIn,
  respondToCheckIn,
  checkMissedCheckIns,
  resetCheckIns,
  getEscalations,
  simulateEscalation,
  resolveEscalation
};
