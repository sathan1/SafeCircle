const deviceFallbackService = require('../services/deviceFallbackService');

/**
 * @desc    Get current device connectivity status and fallback info
 * @route   GET /api/journeys/:id/device-status
 */
const getDeviceStatus = async (req, res) => {
  try {
    const { id: journeyId } = req.params;
    const status = await deviceFallbackService.getDeviceStatus(journeyId);

    res.status(200).json({
      success: true,
      data: status
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to get device status'
    });
  }
};

/**
 * @desc    Simulate primary phone becoming unavailable (triggers wearable fallback)
 * @route   POST /api/journeys/:id/device-fallback/phone-unavailable
 */
const simulatePhoneUnavailable = async (req, res) => {
  try {
    const { id: journeyId } = req.params;
    const updated = await deviceFallbackService.setPhoneUnavailable(journeyId);

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Simulated phone unavailable. Wearable fallback engaged.'
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Failed to simulate phone unavailable'
    });
  }
};

/**
 * @desc    Simulate primary phone reconnected
 * @route   POST /api/journeys/:id/device-fallback/phone-connected
 */
const simulatePhoneConnected = async (req, res) => {
  try {
    const { id: journeyId } = req.params;
    const updated = await deviceFallbackService.setPhoneConnected(journeyId);

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Simulated primary phone reconnected.'
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Failed to simulate phone connected'
    });
  }
};

/**
 * @desc    Update wearable status (CONNECTED or DISCONNECTED)
 * @route   POST /api/journeys/:id/device-fallback/wearable-status
 */
const simulateWearableStatus = async (req, res) => {
  try {
    const { id: journeyId } = req.params;
    const { status } = req.body;
    const updated = await deviceFallbackService.setWearableStatus(journeyId, status);

    res.status(200).json({
      success: true,
      data: updated,
      message: `Wearable status updated to ${status}`
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Failed to update wearable status'
    });
  }
};

/**
 * @desc    Reset device states to baseline
 * @route   POST /api/journeys/:id/device-fallback/reset
 */
const resetDeviceState = async (req, res) => {
  try {
    const { id: journeyId } = req.params;
    const reset = await deviceFallbackService.resetDeviceState(journeyId);

    res.status(200).json({
      success: true,
      data: reset,
      message: 'Device connectivity reset to standard baseline.'
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Failed to reset device state'
    });
  }
};

module.exports = {
  getDeviceStatus,
  simulatePhoneUnavailable,
  simulatePhoneConnected,
  simulateWearableStatus,
  resetDeviceState
};
