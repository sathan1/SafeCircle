/**
 * SafeCircle Phase 11 Automated Test Suite: Wearable Fallback Architecture Simulation
 *
 * Requirements:
 * 1. Phone connected baseline.
 * 2. Phone unavailable transition.
 * 3. Wearable connected & fallback activated.
 * 4. Fallback state correctly records last known safety state and sync time.
 * 5. Phone restored to connected.
 * 6. Wearable disconnected state.
 * 7. Device offline event reaches Safety State Engine (not automatic crisis).
 * 8. Realism check: Verification of zero false claims of live tracking or OS bypass.
 * 9. Existing journey functionality remains intact.
 * 10. Existing Phase 1–10 functionality verified.
 */

const assert = require('assert');
const deviceFallbackService = require('./src/services/deviceFallbackService');
const safetyStateEngine = require('./src/services/safetyStateEngine');
const journeyService = require('./src/services/journeyService');
const contactViewService = require('./src/services/contactViewService');

let passedTests = 0;
let totalTests = 0;

function it(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] ${description}`);
    passedTests++;
  } catch (error) {
    console.error(`[FAIL] ${description}`);
    console.error(`       Error: ${error.message}`);
    throw error;
  }
}

async function runPhase11Tests() {
  console.log('\n====================================================');
  console.log('   SafeCircle Phase 11: Wearable Fallback Tests    ');
  console.log('====================================================\n');

  const journeyId = 'j-active-1';

  // Ensure clean baseline
  await deviceFallbackService.resetDeviceState(journeyId);
  await safetyStateEngine.resetSafetySimulation(journeyId);
  await journeyService.updateJourneyState(journeyId, 'NORMAL');

  // ----------------------------------------------------
  // Test 1: Phone connected baseline
  // ----------------------------------------------------
  console.log('--- Test 1: Phone connected baseline ---');
  const baseline = await deviceFallbackService.getDeviceStatus(journeyId);

  it('Initial baseline has phone CONNECTED and active', () => {
    assert.strictEqual(baseline.phone.status, 'CONNECTED');
    assert.strictEqual(baseline.phone.isPrimary, true);
    assert.strictEqual(baseline.activeDevice, 'PHONE');
    assert.strictEqual(baseline.fallbackActive, false);
    assert(baseline.phone.batteryLevel > 0);
  });

  // ----------------------------------------------------
  // Test 2 & 3: Phone unavailable & Wearable connected fallback
  // ----------------------------------------------------
  console.log('\n--- Test 2 & 3: Phone unavailable & Wearable connected fallback ---');
  const fallbackState = await deviceFallbackService.setPhoneUnavailable(journeyId);

  it('Phone status transitions to UNAVAILABLE with 0 battery', () => {
    assert.strictEqual(fallbackState.phone.status, 'UNAVAILABLE');
    assert.strictEqual(fallbackState.phone.batteryLevel, 0);
    assert.strictEqual(fallbackState.phone.connectionType, 'NONE');
  });

  it('Wearable takes over as active fallback device', () => {
    assert.strictEqual(fallbackState.wearable.status, 'CONNECTED');
    assert.strictEqual(fallbackState.wearable.isFallbackActive, true);
    assert.strictEqual(fallbackState.activeDevice, 'WEARABLE');
    assert.strictEqual(fallbackState.fallbackActive, true);
    assert.strictEqual(fallbackState.wearable.connectionType, 'STANDALONE_ESCORTSYNC_FALLBACK');
  });

  // ----------------------------------------------------
  // Test 4: Fallback state preserves last known state and sync time
  // ----------------------------------------------------
  console.log('\n--- Test 4: Fallback state preserves last known state & sync time ---');
  it('Records last known safety state and synchronization timestamp', () => {
    assert.strictEqual(fallbackState.lastKnownSafetyState, 'NORMAL');
    assert(fallbackState.lastSynchronizedAt, 'Missing synchronization timestamp');
    assert(fallbackState.phone.lastSeen, 'Missing lastSeen timestamp');
  });

  // ----------------------------------------------------
  // Test 5: Phone restored to CONNECTED
  // ----------------------------------------------------
  console.log('\n--- Test 5: Phone restored to CONNECTED ---');
  const restoredState = await deviceFallbackService.setPhoneConnected(journeyId);

  it('Phone returns to CONNECTED and active primary', () => {
    assert.strictEqual(restoredState.phone.status, 'CONNECTED');
    assert.strictEqual(restoredState.activeDevice, 'PHONE');
    assert.strictEqual(restoredState.fallbackActive, false);
    assert.strictEqual(restoredState.wearable.isFallbackActive, false);
    assert.strictEqual(restoredState.wearable.connectionType, 'BLE_COMPANION_LINK');
  });

  // ----------------------------------------------------
  // Test 6: Wearable disconnected state
  // ----------------------------------------------------
  console.log('\n--- Test 6: Wearable disconnected state ---');
  const disconnectedWearable = await deviceFallbackService.setWearableStatus(journeyId, 'DISCONNECTED');

  it('Wearable transitions to DISCONNECTED', () => {
    assert.strictEqual(disconnectedWearable.wearable.status, 'DISCONNECTED');
    assert.strictEqual(disconnectedWearable.wearable.connectionType, 'NONE');
  });

  // Re-connect wearable for further tests
  await deviceFallbackService.setWearableStatus(journeyId, 'CONNECTED');

  // ----------------------------------------------------
  // Test 7: Device offline event reaches Safety State Engine (not automatic crisis)
  // ----------------------------------------------------
  console.log('\n--- Test 7: DEVICE_OFFLINE reaches Safety State Engine (No False Crisis) ---');
  // Reset simulation to isolate DEVICE_OFFLINE evaluation
  await safetyStateEngine.resetSafetySimulation(journeyId);
  // Trigger phone unavailable
  await deviceFallbackService.setPhoneUnavailable(journeyId);
  const safetyState = await safetyStateEngine.getSafetyState(journeyId);

  it('DEVICE_OFFLINE emitted to Safety State Engine', () => {
    const hasDeviceOffline = safetyState.signals.some(s => s.type === 'DEVICE_OFFLINE');
    assert(hasDeviceOffline, 'DEVICE_OFFLINE signal should be present in Safety State Engine');
  });

  it('Score increased by 10 points (+10 for DEVICE_OFFLINE)', () => {
    assert.strictEqual(safetyState.signalScore, 10);
  });

  it('State remains NORMAL (does NOT jump to CRISIS)', () => {
    // Threshold for NORMAL is 0-29. +10 keeps it safely in NORMAL.
    assert.strictEqual(safetyState.state, 'NORMAL');
    assert.notStrictEqual(safetyState.state, 'CRISIS', 'Phone disconnect must NOT directly trigger CRISIS');
  });

  // ----------------------------------------------------
  // Test 8: Realism check: Verification of zero false claims
  // ----------------------------------------------------
  console.log('\n--- Test 8: Realism check - Zero false claims ---');
  const currentStatus = await deviceFallbackService.getDeviceStatus(journeyId);
  it('Simulation notice explicitly confirms prototype hardware simulation', () => {
    assert(currentStatus.simulationNotice.includes('Simulation'), 'Must be flagged as simulation');
    assert(!currentStatus.simulationNotice.includes('secret tracking'), 'Must not claim secret tracking');
  });

  // ----------------------------------------------------
  // Test 9: Existing journey and privacy permissions intact
  // ----------------------------------------------------
  console.log('\n--- Test 9: Existing journey and privacy permissions intact ---');
  const journey = await journeyService.getJourneyById(journeyId);
  it('Journey record remains valid and active', () => {
    assert.strictEqual(journey.id, journeyId);
    assert.strictEqual(journey.status, 'ACTIVE');
  });

  const momView = await contactViewService.getContactViewForJourney(journeyId, 'tc-1');
  it('Privacy Permission Engine enforces policy without regression', () => {
    assert.strictEqual(momView.visibilityMatrix.JOURNEY_STATUS.allowed, true);
    assert.strictEqual(momView.visibilityMatrix.LIVE_LOCATION.allowed, false);
    assert.strictEqual(momView.disclosed.LIVE_LOCATION.data, undefined);
  });

  // ----------------------------------------------------
  // Test 10: Reset device state restores baseline
  // ----------------------------------------------------
  console.log('\n--- Test 10: Reset device state restores baseline ---');
  const resetState = await deviceFallbackService.resetDeviceState(journeyId);
  await safetyStateEngine.resetSafetySimulation(journeyId);

  it('Reset restores phone CONNECTED, wearable CONNECTED, fallbackActive false', () => {
    assert.strictEqual(resetState.phone.status, 'CONNECTED');
    assert.strictEqual(resetState.wearable.status, 'CONNECTED');
    assert.strictEqual(resetState.fallbackActive, false);
    assert.strictEqual(resetState.activeDevice, 'PHONE');
  });

  console.log('\n====================================================');
  console.log(`   PHASE 11 TEST RESULTS: ${passedTests}/${totalTests} CHECKS PASSED!   `);
  console.log('====================================================\n');
}

runPhase11Tests().catch(err => {
  console.error('\n[FATAL] Phase 11 test suite failed:');
  console.error(err);
  process.exit(1);
});
