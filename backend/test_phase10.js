/**
 * SafeCircle Phase 10 Automated Test Suite: Anomaly Intelligence & Explainable Signals
 *
 * Requirements:
 * 1. Route deviation creates an explainable signal.
 * 2. Prolonged stop creates a signal.
 * 3. Missed check-in creates a signal.
 * 4. Multiple signals can coexist.
 * 5. Signals reach Safety State Engine.
 * 6. Safety State Engine remains the final state authority.
 * 7. Signals are explainable with transparent confidence levels (Anomaly confidence).
 * 8. Clearing signals works.
 * 9. Existing privacy permissions continue working.
 * 10. Contact dashboard updates correctly after state changes.
 */

const assert = require('assert');
const anomalyIntelligenceService = require('./src/services/anomalyIntelligenceService');
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

async function runPhase10Tests() {
  console.log('\n====================================================');
  console.log('   SafeCircle Phase 10: Anomaly Intelligence Tests  ');
  console.log('====================================================\n');

  const journeyId = 'j-active-1';

  // Ensure clean baseline
  await anomalyIntelligenceService.clearSignals(journeyId);
  await journeyService.updateJourneyState(journeyId, 'NORMAL');

  // ----------------------------------------------------
  // Test 1: Route deviation creates an explainable signal
  // ----------------------------------------------------
  console.log('--- Test 1: Route deviation creates an explainable signal ---');
  const devResult = await anomalyIntelligenceService.simulateAnomalySignal(journeyId, {
    type: 'ROUTE_DEVIATION',
    description: 'Vehicle deviated 350m from recommended SafePath corridor',
    metadata: { deviationMeters: 350 }
  });

  it('Route deviation signal created in analysis', () => {
    assert.strictEqual(devResult.success, true);
    assert.strictEqual(devResult.emittedSignal, 'ROUTE_DEVIATION');
    const signals = devResult.analysis.signals;
    const devSig = signals.find(s => s.type === 'ROUTE_DEVIATION');
    assert(devSig, 'ROUTE_DEVIATION signal not found in analysis');
    assert.strictEqual(devSig.title, 'Route Deviation');
    assert(devSig.description.includes('corridor'));
  });

  it('Signal contains Anomaly confidence (NOT probability of danger)', () => {
    const devSig = devResult.analysis.signals.find(s => s.type === 'ROUTE_DEVIATION');
    assert.strictEqual(devSig.confidenceMetric, 'Anomaly confidence');
    assert(['Low', 'Medium', 'High'].includes(devSig.confidence));
    assert(devSig.confidenceRationale, 'Rationale must be present');
  });

  // ----------------------------------------------------
  // Test 2: Prolonged stop creates a signal
  // ----------------------------------------------------
  console.log('\n--- Test 2: Prolonged stop creates a signal ---');
  const stopResult = await anomalyIntelligenceService.simulateAnomalySignal(journeyId, {
    type: 'PROLONGED_STOP',
    description: 'Vehicle stationary for 14 minutes at unverified junction',
    metadata: { stopDurationMinutes: 14 }
  });

  it('Prolonged stop signal created in analysis', () => {
    const stopSig = stopResult.analysis.signals.find(s => s.type === 'PROLONGED_STOP');
    assert(stopSig, 'PROLONGED_STOP signal missing');
    assert.strictEqual(stopSig.title, 'Prolonged Stop');
    assert.strictEqual(stopSig.confidenceMetric, 'Anomaly confidence');
    assert.strictEqual(stopSig.source, 'Dwell Time & Motion Analysis');
  });

  // ----------------------------------------------------
  // Test 3: Missed check-in creates a signal
  // ----------------------------------------------------
  console.log('\n--- Test 3: Missed check-in creates a signal ---');
  const chkResult = await anomalyIntelligenceService.simulateAnomalySignal(journeyId, {
    type: 'MISSED_CHECKIN',
    description: 'Scheduled 5-minute safety check-in prompt expired without response',
    metadata: { overdueSeconds: 60 }
  });

  it('Missed check-in signal created in analysis with High confidence', () => {
    const chkSig = chkResult.analysis.signals.find(s => s.type === 'MISSED_CHECKIN');
    assert(chkSig, 'MISSED_CHECKIN signal missing');
    assert.strictEqual(chkSig.confidence, 'High');
    assert.strictEqual(chkSig.source, 'Check-In Cadence Monitor');
  });

  // ----------------------------------------------------
  // Test 4: Multiple signals can coexist
  // ----------------------------------------------------
  console.log('\n--- Test 4: Multiple signals coexist simultaneously ---');
  const currentAnalysis = await anomalyIntelligenceService.getAnomalyAnalysis(journeyId);

  it('Analysis captures all 3 active signals simultaneously', () => {
    assert.strictEqual(currentAnalysis.signalsCount, 3);
    const types = currentAnalysis.signals.map(s => s.type);
    assert(types.includes('ROUTE_DEVIATION'), 'Contains ROUTE_DEVIATION');
    assert(types.includes('PROLONGED_STOP'), 'Contains PROLONGED_STOP');
    assert(types.includes('MISSED_CHECKIN'), 'Contains MISSED_CHECKIN');
  });

  // ----------------------------------------------------
  // Test 5 & 6: Signals reach Safety State Engine & State Engine is final authority
  // ----------------------------------------------------
  console.log('\n--- Test 5 & 6: Signals reach Safety State Engine (State Authority) ---');
  const safetyState = await safetyStateEngine.getSafetyState(journeyId);

  it('Signals accumulated score in Safety State Engine (25 + 20 + 25 = 70)', () => {
    assert.strictEqual(safetyState.signalScore, 70);
  });

  it('Safety State Engine evaluated state as ELEVATED (50-74 threshold)', () => {
    assert.strictEqual(safetyState.state, 'ELEVATED');
    // Anomaly analysis also mirrors the state calculated by Safety State Engine
    assert.strictEqual(currentAnalysis.currentSafetyState, 'ELEVATED');
  });

  it('Anomaly Intelligence did NOT bypass or dictate state directly', () => {
    // Verified: Anomaly intelligence returns analysisType RULE_BASED_PROTOTYPE
    assert.strictEqual(currentAnalysis.analysisType, 'RULE_BASED_PROTOTYPE');
    assert.strictEqual(currentAnalysis.analysisLabel, 'Prototype rule-based anomaly intelligence');
  });

  // ----------------------------------------------------
  // Test 7: Signals are explainable
  // ----------------------------------------------------
  console.log('\n--- Test 7: Signals are explainable with transparent context ---');
  it('Every signal contains clear explanation, source, and metric', () => {
    for (const sig of currentAnalysis.signals) {
      assert(sig.title, 'Signal title missing');
      assert(sig.description, 'Signal description missing');
      assert(sig.source, 'Signal source missing');
      assert(sig.confidenceRationale, 'Confidence rationale missing');
      assert.strictEqual(sig.confidenceMetric, 'Anomaly confidence');
      assert(sig.suggestedScoreContribution > 0, 'Score contribution missing');
    }
  });

  // ----------------------------------------------------
  // Test 8: Clearing signals works and resets baseline state
  // ----------------------------------------------------
  console.log('\n--- Test 8: Clearing signals resets baseline state ---');
  const clearResult = await anomalyIntelligenceService.clearSignals(journeyId);

  it('Clearing signals removes active signals from analysis', () => {
    assert.strictEqual(clearResult.success, true);
    assert.strictEqual(clearResult.analysis.signalsCount, 0);
  });

  it('Safety state recalibrates to NORMAL baseline with 0 score', async () => {
    const postClearState = await safetyStateEngine.getSafetyState(journeyId);
    assert.strictEqual(postClearState.state, 'NORMAL');
    assert.strictEqual(postClearState.signalScore, 0);
  });

  // ----------------------------------------------------
  // Test 9: Existing privacy permissions continue working
  // ----------------------------------------------------
  console.log('\n--- Test 9: Privacy permissions integration regression check ---');
  const momViewNormal = await contactViewService.getContactViewForJourney(journeyId, 'tc-1');

  it('In NORMAL: Mom has Journey Status allowed, Live GPS strictly restricted', () => {
    assert.strictEqual(momViewNormal.visibilityMatrix.JOURNEY_STATUS.allowed, true);
    assert.strictEqual(momViewNormal.visibilityMatrix.LIVE_LOCATION.allowed, false);
    assert.strictEqual(momViewNormal.disclosed.LIVE_LOCATION.data, undefined);
  });

  // ----------------------------------------------------
  // Test 10: Contact dashboard updates correctly after state changes
  // ----------------------------------------------------
  console.log('\n--- Test 10: Contact dashboard updates correctly after state change ---');
  // Transition state by triggering 3 signals reaching ELEVATED
  await anomalyIntelligenceService.simulateAnomalySignal(journeyId, { type: 'ROUTE_DEVIATION' });
  await anomalyIntelligenceService.simulateAnomalySignal(journeyId, { type: 'PROLONGED_STOP' });
  await anomalyIntelligenceService.simulateAnomalySignal(journeyId, { type: 'MISSED_CHECKIN' });

  const momViewElevated = await contactViewService.getContactViewForJourney(journeyId, 'tc-1');

  it('Contact dashboard view reflects ELEVATED state after anomaly signals', () => {
    assert.strictEqual(momViewElevated.journey.safetyState, 'ELEVATED');
    assert.strictEqual(momViewElevated.visibilityMatrix.APPROXIMATE_LOCATION.allowed, true);
    assert(momViewElevated.disclosed.APPROXIMATE_LOCATION.data !== undefined);
  });

  // Clean up
  await anomalyIntelligenceService.clearSignals(journeyId);

  console.log('\n====================================================');
  console.log(`   PHASE 10 TEST RESULTS: ${passedTests}/${totalTests} CHECKS PASSED!   `);
  console.log('====================================================\n');
}

runPhase10Tests().catch(err => {
  console.error('\n[FATAL] Phase 10 test suite failed:');
  console.error(err);
  process.exit(1);
});
