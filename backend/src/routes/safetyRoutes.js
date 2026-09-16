const express = require('express');
const SafetyStateTransition = require('../models/SafetyStateTransition');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

// @route   GET /api/safety/transitions/:journeyId
// @desc    Get safety state transitions for a journey
// @access  Private
router.get('/transitions/:journeyId', async (req, res) => {
  try {
    const transitions = await SafetyStateTransition.find({ 
      journeyId: req.params.journeyId,
      userId: req.userId 
    }).sort({ timestamp: 1 });
    
    res.json(transitions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
