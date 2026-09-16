const journeyService = require('../services/journeyService');

// @desc    Get user's journeys
// @route   GET /api/journeys
const getJourneys = async (req, res) => {
  try {
    const journeys = await journeyService.getJourneys();
    res.status(200).json({
      success: true,
      data: journeys,
      count: journeys.length
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Server error fetching journeys'
    });
  }
};

// @desc    Get single journey by ID
// @route   GET /api/journeys/:id
const getJourneyById = async (req, res) => {
  try {
    const journey = await journeyService.getJourneyById(req.params.id);
    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found'
      });
    }
    res.status(200).json({
      success: true,
      data: journey
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Server error fetching journey'
    });
  }
};

// @desc    Create and start a new journey
// @route   POST /api/journeys
const createJourney = async (req, res) => {
  try {
    const newJourney = await journeyService.createJourney(req.body);
    res.status(201).json({
      success: true,
      data: newJourney,
      message: 'Journey started successfully'
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Failed to start journey'
    });
  }
};

// @desc    Update journey status (ACTIVE, COMPLETED, CANCELLED)
// @route   PATCH /api/journeys/:id/status
const updateJourneyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status field is required'
      });
    }
    const updated = await journeyService.updateJourneyStatus(req.params.id, status);
    res.status(200).json({
      success: true,
      data: updated,
      message: `Journey status updated to ${updated.status}`
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Failed to update journey status'
    });
  }
};

// @desc    Update journey safety state (demo / dev support)
// @route   PATCH /api/journeys/:id/state
const updateJourneyState = async (req, res) => {
  try {
    const { state } = req.body;
    if (!state) {
      return res.status(400).json({
        success: false,
        message: 'State field is required'
      });
    }
    const updated = await journeyService.updateJourneyState(req.params.id, state);
    res.status(200).json({
      success: true,
      data: updated,
      message: `Journey safety state updated to ${updated.currentState}`
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Failed to update safety state'
    });
  }
};

// @desc    Update journey selected SafePath route
// @route   PATCH /api/journeys/:id/route
const updateJourneyRoute = async (req, res) => {
  try {
    const updated = await journeyService.updateJourneyRoute(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: updated,
      message: `SafePath route '${updated.selectedRoute?.name}' selected successfully`
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Failed to update selected route'
    });
  }
};

// @desc    Delete non-active journey
// @route   DELETE /api/journeys/:id
const deleteJourney = async (req, res) => {
  try {
    await journeyService.deleteJourney(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Journey removed successfully'
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Failed to delete journey'
    });
  }
};

module.exports = {
  getJourneys,
  getJourneyById,
  createJourney,
  updateJourneyStatus,
  updateJourneyState,
  updateJourneyRoute,
  deleteJourney
};
