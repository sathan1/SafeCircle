const contactViewService = require('../services/contactViewService');

/**
 * @desc    Get permission-filtered journey view for a specific trusted contact
 * @route   GET /api/journeys/:id/contact-view/:contactId
 * @access  Public / Prototype
 *
 * CRITICAL SECURITY PRINCIPLE:
 * Backend is the source of truth.
 * Only permitted information is returned.
 * Restricted categories never leak sensitive coordinates, routes, or metadata.
 */
const getContactView = async (req, res) => {
  try {
    const { id: journeyId, contactId } = req.params;

    if (!journeyId) {
      return res.status(400).json({
        success: false,
        message: 'Journey ID parameter is required'
      });
    }

    if (!contactId) {
      return res.status(400).json({
        success: false,
        message: 'Contact ID parameter is required'
      });
    }

    const view = await contactViewService.getContactViewForJourney(journeyId, contactId);

    res.status(200).json({
      success: true,
      data: view,
      message: 'Contact view evaluated successfully'
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Error generating contact view'
    });
  }
};

module.exports = {
  getContactView
};
