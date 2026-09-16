/**
 * Phase 7 Automated Test Suite
 * Tests all 8 requirements specified in Section 18 of the Phase 7 specification.
 */
const { 
  evaluateEvents, 
  scoreToSafetyState, 
  processNewEvent, 
  getJourneyEvents, 
  getSafetyState, 
  getSafetyHistory, 
  resetSafetySimulation,
  EVENT_TYPES 
} = require('./src/services/safetyStateEngine');
const { canShareInformation } = require('./src/services/permissionService');
const journeyService = require('./src/services/journeyService');

async function runTests() {
  console.log('====================================================');
  console.log('   SafeCircle Phase 7: Safety State Engine Tests   ');
  console.log('====================================================\n');

  let passedCount = 0;
  const assert = (condition, testName) => {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`[FAIL] ${testName}`);
      process.exitCode = 1;
    }
  };

  // Setup a clean test journey
  const testJourney = await journeyService.createJourney({
    startLocation: { name: 'Campus Gate', latitude: 12.97, longitude: 77.59 },
    destination: { name: 'Residence', latitude: 12.93, longitude: 77.62 },
    expectedArrival: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    selectedContacts: ['tc-1', 'tc-2']
  });
  const journeyId = testJourney.id;

  // 1. TEST: NORMAL with no anomaly events
  console.log('--- Test 1: NORMAL baseline with no anomaly events ---');
  const state1 = await getSafetyState(journeyId);
  assert(state1.state === 'NORMAL', 'Initial state is NORMAL');
  assert(state1.signalScore === 0, 'Initial Safety Signal Score is 0');
  assert(state1.signals.length === 0, 'No active anomaly signals present');

  // 2. TEST: Route deviation causing a score increase
  console.log('\n--- Test 2: Route deviation (+25) score increase ---');
  const resDev = await processNewEvent(journeyId, {
    type: 'ROUTE_DEVIATION',
    description: 'Deviated 120m from planned corridor',
    source: 'SENSOR_SIMULATOR'
  });
  assert(resDev.signalScore === 25, 'Score increased to 25 after ROUTE_DEVIATION');
  assert(resDev.currentSafetyState === 'NORMAL', 'State remains NORMAL (0-29 threshold)');
  assert(resDev.stateChanged === false, 'State change flag is false');

  // 3. TEST: Multiple events causing CAUTION/ELEVATED
  console.log('\n--- Test 3: Multiple events causing CAUTION (30-49) then ELEVATED (50-74) ---');
  const resStop = await processNewEvent(journeyId, {
    type: 'PROLONGED_STOP',
    description: 'Stationary for 9 minutes',
    source: 'SENSOR_SIMULATOR'
  });
  assert(resStop.signalScore === 45, 'Score is 45 after PROLONGED_STOP (+20)');
  assert(resStop.currentSafetyState === 'CAUTION', 'State transitioned to CAUTION (30-49 threshold)');
  assert(resStop.stateChanged === true, 'State change flag is true');

  const resCheckin = await processNewEvent(journeyId, {
    type: 'MISSED_CHECKIN',
    description: 'Prompt timed out without response',
    source: 'SYSTEM'
  });
  assert(resCheckin.signalScore === 70, 'Score is 70 after MISSED_CHECKIN (+25)');
  assert(resCheckin.currentSafetyState === 'ELEVATED', 'State transitioned to ELEVATED (50-74 threshold)');
  assert(resCheckin.stateChanged === true, 'State change flag is true');

  // 4. TEST: High enough score reaching CRISIS (75+) or EMERGENCY_ACTIVATED
  console.log('\n--- Test 4: High score or Emergency reaching CRISIS ---');
  const resOffline = await processNewEvent(journeyId, {
    type: 'DEVICE_OFFLINE',
    description: 'Heartbeat lost for 5 minutes',
    source: 'SYSTEM'
  });
  // 70 + 10 = 80
  assert(resOffline.signalScore === 80, 'Score reached 80 (+10 from DEVICE_OFFLINE)');
  assert(resOffline.currentSafetyState === 'CRISIS', 'State transitioned to CRISIS (75+ threshold)');

  // 5. TEST: USER_CONFIRMED_SAFE reducing/resetting the state back toward NORMAL
  console.log('\n--- Test 5: USER_CONFIRMED_SAFE reducing/resetting state ---');
  const resSafe = await processNewEvent(journeyId, {
    type: 'USER_CONFIRMED_SAFE',
    description: 'User tapped confirmation button',
    source: 'USER'
  });
  assert(resSafe.signalScore === 0, 'Active anomaly score cleared to 0 after safe confirmation');
  assert(resSafe.currentSafetyState === 'NORMAL', 'State returned to NORMAL');
  assert(resSafe.stateChanged === true, 'State change flag is true for de-escalation');

  // 6. TEST: State transition history being created
  console.log('\n--- Test 6: State transition history audit trail ---');
  const history = await getSafetyHistory(journeyId);
  assert(history.length >= 4, `State transition history recorded ${history.length} transitions`);
  const transitionPairs = history.map(h => `${h.previousState}->${h.newState}`);
  console.log('   Recorded transition path:', transitionPairs.reverse().join(' => '));
  assert(history.some(h => h.previousState === 'NORMAL' && h.newState === 'CAUTION'), 'Contains NORMAL -> CAUTION transition');
  assert(history.some(h => h.previousState === 'CAUTION' && h.newState === 'ELEVATED'), 'Contains CAUTION -> ELEVATED transition');
  assert(history.some(h => h.previousState === 'ELEVATED' && h.newState === 'CRISIS'), 'Contains ELEVATED -> CRISIS transition');
  assert(history.some(h => h.previousState === 'CRISIS' && h.newState === 'NORMAL'), 'Contains CRISIS -> NORMAL de-escalation');

  // 7. TEST: Invalid event types being rejected
  console.log('\n--- Test 7: Invalid event rejection ---');
  let rejected = false;
  try {
    await processNewEvent(journeyId, { type: 'INVALID_EVENT_TYPE_123', description: 'Invalid' });
  } catch (err) {
    rejected = true;
    assert(err.statusCode === 400, 'Invalid event threw HTTP 400 Bad Request');
  }
  assert(rejected, 'Invalid event type was correctly rejected');

  // 8. TEST: Privacy Permission Engine integration with updated safety state
  console.log('\n--- Test 8: Privacy Permission Engine integration ---');
  const mockContact = {
    id: 'tc-test-mom',
    name: 'Mom',
    isActive: true,
    permissions: {
      NORMAL: { JOURNEY_STATUS: true, APPROXIMATE_LOCATION: false, LIVE_LOCATION: false, EMERGENCY_STATUS: false, JOURNEY_DETAILS: false },
      CAUTION: { JOURNEY_STATUS: true, APPROXIMATE_LOCATION: true, LIVE_LOCATION: false, EMERGENCY_STATUS: false, JOURNEY_DETAILS: false },
      ELEVATED: { JOURNEY_STATUS: true, APPROXIMATE_LOCATION: true, LIVE_LOCATION: true, EMERGENCY_STATUS: true, JOURNEY_DETAILS: false },
      CRISIS: { JOURNEY_STATUS: true, APPROXIMATE_LOCATION: true, LIVE_LOCATION: true, EMERGENCY_STATUS: true, JOURNEY_DETAILS: true }
    }
  };

  // Under NORMAL: can share status, cannot share approximate location or live GPS
  assert(canShareInformation(mockContact, 'NORMAL', 'JOURNEY_STATUS') === true, 'NORMAL: Status is authorized');
  assert(canShareInformation(mockContact, 'NORMAL', 'APPROXIMATE_LOCATION') === false, 'NORMAL: Approx location is restricted');
  assert(canShareInformation(mockContact, 'NORMAL', 'LIVE_LOCATION') === false, 'NORMAL: Live GPS is restricted');

  // Under ELEVATED: can share approximate location and live location, cannot share full journey details
  assert(canShareInformation(mockContact, 'ELEVATED', 'APPROXIMATE_LOCATION') === true, 'ELEVATED: Approx location authorized');
  assert(canShareInformation(mockContact, 'ELEVATED', 'LIVE_LOCATION') === true, 'ELEVATED: Live GPS authorized');
  assert(canShareInformation(mockContact, 'ELEVATED', 'JOURNEY_DETAILS') === false, 'ELEVATED: Full details still restricted');

  // Under CRISIS: full disclosure authorized per user policy
  assert(canShareInformation(mockContact, 'CRISIS', 'JOURNEY_DETAILS') === true, 'CRISIS: Full details authorized');

  // Inactive contact security check: NEVER authorized
  const inactiveContact = { ...mockContact, isActive: false };
  assert(canShareInformation(inactiveContact, 'CRISIS', 'JOURNEY_DETAILS') === false, 'Security: Inactive contact strictly denied access even in CRISIS');

  console.log('\n====================================================');
  console.log(`   PHASE 7 TEST RESULTS: ${passedCount} CHECKS PASSED!   `);
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
