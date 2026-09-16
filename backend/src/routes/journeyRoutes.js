const express = require('express');
const journeyController = require('../controllers/journeyController');
const safetyStateController = require('../controllers/safetyStateController');
const checkInController = require('../controllers/checkInController');
const contactViewController = require('../controllers/contactViewController');
const anomalyController = require('../controllers/anomalyController');
const deviceController = require('../controllers/deviceController');

const router = express.Router();

router.route('/')
  .get(journeyController.getJourneys)
  .post(journeyController.createJourney);

router.route('/:id/status')
  .patch(journeyController.updateJourneyStatus);

router.route('/:id/state')
  .patch(journeyController.updateJourneyState);

router.route('/:id/route')
  .patch(journeyController.updateJourneyRoute);

// Phase 7: Safety State Escalation Engine endpoints
router.route('/:id/events')
  .get(safetyStateController.getEvents)
  .post(safetyStateController.addEvent);

router.route('/:id/safety-state')
  .get(safetyStateController.getSafetyState);

router.route('/:id/safety-history')
  .get(safetyStateController.getSafetyHistory);

router.route('/:id/safety-reset')
  .post(safetyStateController.resetSafetySimulation);

// Phase 8: Check-In System & Escalation Engine endpoints
router.route('/:id/checkins')
  .get(checkInController.getCheckIns)
  .post(checkInController.createCheckIn);

router.route('/:id/checkins/active')
  .get(checkInController.getActiveCheckIn);

router.route('/:id/checkins/check-missed')
  .post(checkInController.checkMissedCheckIns);

router.route('/:id/checkins/reset')
  .post(checkInController.resetCheckIns);

router.route('/:id/escalations')
  .get(checkInController.getEscalations);

router.route('/:id/escalations/simulate')
  .post(checkInController.simulateEscalation);

// Phase 9: Contact Dashboard & Permission-Filtered View
router.route('/:id/contact-view/:contactId')
  .get(contactViewController.getContactView);

// Phase 10: Anomaly Intelligence Service & Explainable Signals
router.route('/:id/anomaly-analysis')
  .get(anomalyController.getAnomalyAnalysis);

router.route('/:id/anomaly-signals')
  .post(anomalyController.simulateAnomalySignal);

router.route('/:id/anomaly-clear')
  .post(anomalyController.clearAnomalySignals);

// Phase 11: Wearable Fallback Architecture & Device Connectivity
router.route('/:id/device-status')
  .get(deviceController.getDeviceStatus);

router.route('/:id/device-fallback/phone-unavailable')
  .post(deviceController.simulatePhoneUnavailable);

router.route('/:id/device-fallback/phone-connected')
  .post(deviceController.simulatePhoneConnected);

router.route('/:id/device-fallback/wearable-status')
  .post(deviceController.simulateWearableStatus);

router.route('/:id/device-fallback/reset')
  .post(deviceController.resetDeviceState);

router.route('/:id')
  .get(journeyController.getJourneyById)
  .delete(journeyController.deleteJourney);

module.exports = router;
