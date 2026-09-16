const express = require('express');
const PrivacyPolicy = require('../models/PrivacyPolicy');
const TrustedContact = require('../models/TrustedContact');
const permissionService = require('../services/permissionService');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

// @route   GET /api/privacy
// @desc    Get all privacy policies for the logged in user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const policies = await PrivacyPolicy.find({ userId: req.userId });
    res.json(policies);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/privacy/:contactId
// @desc    Get privacy policy for a specific contact
// @access  Private
router.get('/:contactId', async (req, res) => {
  try {
    const policy = await PrivacyPolicy.findOne({ 
      userId: req.userId, 
      contactId: req.params.contactId 
    });
    
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    
    res.json(policy);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/privacy/:contactId
// @desc    Update privacy policy for a specific contact
// @access  Private
router.put('/:contactId', async (req, res) => {
  try {
    const { permissions } = req.body;
    
    // Verify contact belongs to user
    const contact = await TrustedContact.findOne({ _id: req.params.contactId, userId: req.userId });
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found or unauthorized' });
    }

    let policy = await PrivacyPolicy.findOne({ 
      userId: req.userId, 
      contactId: req.params.contactId 
    });

    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    policy.permissions = permissions;
    await policy.save();
    
    res.json(policy);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/privacy/evaluate
// @desc    Test/Simulation endpoint to see what a contact can see
// @access  Private
router.post('/evaluate', async (req, res) => {
  try {
    const { contactId, safetyState } = req.body;
    
    if (!contactId || !safetyState) {
      return res.status(400).json({ message: 'Contact ID and Safety State are required' });
    }

    // Mock data that the system *might* want to send
    const mockRequestedData = {
      journeyStatus: { status: 'On track', eta: '8:45 PM' },
      safetyAlert: { active: true, message: 'User may need help' },
      approximateLocation: { area: 'Downtown Campus' },
      liveLocation: { lat: 40.7128, lng: -74.0060 },
      emergencyStatus: { triggered: true, time: new Date() },
      evidenceStatus: { recording: true }
    };

    const evaluation = await permissionService.getAllowedInformation(
      req.userId, 
      contactId, 
      safetyState, 
      mockRequestedData
    );

    res.json({
      evaluation,
      explanation: `At ${safetyState} state, this contact is only authorized to see the fields in 'allowedInformation'. Unauthorized fields were actively stripped by the backend engine.`
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message || 'Server Error' });
  }
});

module.exports = router;
