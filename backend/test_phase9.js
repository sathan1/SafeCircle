/**
 * SafeCircle Phase 9 Automated Test Suite: Contact Dashboard & Privacy View
 * Tests:
 * 1. Valid contact view evaluation
 * 2. Invalid contact handling (404)
 * 3. Contact not belonging to Safety Circle / Invalid journey handling (404)
 * 4. Security Principle: Restricted information NEVER returned by API (zero data leakage)
 * 5. Allowed information returned correctly
 * 6. Dynamic permissions update when safety state shifts (NORMAL -> CAUTION -> CRISIS)
 * 7. Multi-contact differential permissions under identical state (Mom vs Priya vs Ananya)
 * 8. Inactive contacts strictly restricted across all categories
 */

const assert = require('assert');
const contactViewService = require('./src/services/contactViewService');
const journeyService = require('./src/services/journeyService');
const contactService = require('./src/services/contactService');
const safetyStateEngine = require('./src/services/safetyStateEngine');

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

async function runPhase9Tests() {
  console.log('\n====================================================');
  console.log('   SafeCircle Phase 9: Contact Dashboard Tests     ');
  console.log('====================================================\n');

  const journeyId = 'j-active-1';
  const momId = 'tc-1';
  const priyaId = 'tc-2';
  const ananyaId = 'tc-3';
  const inactiveId = 'tc-4';

  // Ensure clean baseline
  await safetyStateEngine.resetSafetySimulation(journeyId);
  await journeyService.updateJourneyState(journeyId, 'NORMAL');

  // ----------------------------------------------------
  // Test 1: Valid contact view evaluation
  // ----------------------------------------------------
  console.log('--- Test 1: Valid contact view evaluation ---');
  const momView = await contactViewService.getContactViewForJourney(journeyId, momId);

  it('Returns contact object with id, name, relationship, and active status', () => {
    assert(momView.contact, 'Contact object missing');
    assert.strictEqual(momView.contact.id, momId);
    assert.strictEqual(momView.contact.name, 'Mom');
    assert.strictEqual(momView.contact.relationship, 'Parent');
    assert.strictEqual(momView.contact.isActive, true);
  });

  it('Returns journey metadata and current safety state', () => {
    assert(momView.journey, 'Journey object missing');
    assert.strictEqual(momView.journey.id, journeyId);
    assert.strictEqual(momView.journey.safetyState, 'NORMAL');
  });

  it('Generates complete 5-category visibilityMatrix', () => {
    const matrix = momView.visibilityMatrix;
    assert(matrix.JOURNEY_STATUS, 'JOURNEY_STATUS missing from matrix');
    assert(matrix.APPROXIMATE_LOCATION, 'APPROXIMATE_LOCATION missing from matrix');
    assert(matrix.LIVE_LOCATION, 'LIVE_LOCATION missing from matrix');
    assert(matrix.EMERGENCY_STATUS, 'EMERGENCY_STATUS missing from matrix');
    assert(matrix.JOURNEY_DETAILS, 'JOURNEY_DETAILS missing from matrix');
  });

  // ----------------------------------------------------
  // Test 2: Invalid contact handling (404)
  // ----------------------------------------------------
  console.log('\n--- Test 2: Invalid contact handling (404) ---');
  let invalidContactErr = null;
  try {
    await contactViewService.getContactViewForJourney(journeyId, 'tc-invalid-9999');
  } catch (err) {
    invalidContactErr = err;
  }

  it('Throws 404 when contact ID is invalid', () => {
    assert(invalidContactErr, 'Expected error for non-existent contact');
    assert.strictEqual(invalidContactErr.statusCode, 404);
  });

  // ----------------------------------------------------
  // Test 3: Contact not belonging to Safety Circle / Invalid journey handling (404)
  // ----------------------------------------------------
  console.log('\n--- Test 3: Contact not in Safety Circle & invalid journey ---');
  let invalidJourneyErr = null;
  try {
    await contactViewService.getContactViewForJourney('j-nonexistent-xyz', momId);
  } catch (err) {
    invalidJourneyErr = err;
  }

  it('Throws 404 when journey does not exist', () => {
    assert(invalidJourneyErr, 'Expected error for non-existent journey');
    assert.strictEqual(invalidJourneyErr.statusCode, 404);
  });

  it('Error message specifies missing contact in Safety Circle', () => {
    assert(invalidContactErr.message.includes('Safety Circle'));
  });

  // ----------------------------------------------------
  // Test 4: Security Principle: Restricted information NEVER returned by API
  // ----------------------------------------------------
  console.log('\n--- Test 4: Security Principle: Restricted info NEVER returned ---');
  it('In NORMAL state: LIVE_LOCATION is restricted for Mom', () => {
    assert.strictEqual(momView.visibilityMatrix.LIVE_LOCATION.allowed, false);
    assert.strictEqual(momView.visibilityMatrix.LIVE_LOCATION.status, 'RESTRICTED');
  });

  it('In NORMAL state: Live GPS coordinates are strictly stripped from response', () => {
    const liveLoc = momView.disclosed.LIVE_LOCATION;
    assert.strictEqual(liveLoc.allowed, false);
    assert.strictEqual(liveLoc.status, 'RESTRICTED');
    assert.strictEqual(liveLoc.message, 'Restricted by your privacy policy.');
    assert.strictEqual(liveLoc.data, undefined, 'CRITICAL: data field must not exist');
    assert.strictEqual(liveLoc.latitude, undefined, 'CRITICAL: latitude must not leak');
    assert.strictEqual(liveLoc.longitude, undefined, 'CRITICAL: longitude must not leak');
  });

  it('In NORMAL state: Journey Details are strictly stripped from response', () => {
    const details = momView.disclosed.JOURNEY_DETAILS;
    assert.strictEqual(details.allowed, false);
    assert.strictEqual(details.message, 'Restricted by your privacy policy.');
    assert.strictEqual(details.data, undefined, 'CRITICAL: route details must not leak');
  });

  it('In NORMAL state: Approximate Location is strictly stripped from response', () => {
    const approx = momView.disclosed.APPROXIMATE_LOCATION;
    assert.strictEqual(approx.allowed, false);
    assert.strictEqual(approx.data, undefined, 'CRITICAL: approx area must not leak');
  });

  // ----------------------------------------------------
  // Test 5: Allowed information returned correctly
  // ----------------------------------------------------
  console.log('\n--- Test 5: Allowed information returned correctly ---');
  it('In NORMAL state: JOURNEY_STATUS is allowed for Mom', () => {
    assert.strictEqual(momView.visibilityMatrix.JOURNEY_STATUS.allowed, true);
    assert.strictEqual(momView.visibilityMatrix.JOURNEY_STATUS.status, 'ALLOWED');
  });

  it('Allowed JOURNEY_STATUS contains valid journey status data', () => {
    const statusInfo = momView.disclosed.JOURNEY_STATUS;
    assert.strictEqual(statusInfo.allowed, true);
    assert(statusInfo.data, 'Missing status data');
    assert.strictEqual(statusInfo.data.status, 'ACTIVE');
    assert.strictEqual(statusInfo.data.safetyState, 'NORMAL');
  });

  // ----------------------------------------------------
  // Test 6: Permissions change when safety state changes
  // ----------------------------------------------------
  console.log('\n--- Test 6: Dynamic permissions update with state shifts ---');
  // Transition to CAUTION: Mom gains EMERGENCY_STATUS
  await journeyService.updateJourneyState(journeyId, 'CAUTION');
  const momCautionView = await contactViewService.getContactViewForJourney(journeyId, momId);

  it('CAUTION: Mom gains access to EMERGENCY_STATUS per policy', () => {
    assert.strictEqual(momCautionView.visibilityMatrix.EMERGENCY_STATUS.allowed, true);
    assert(momCautionView.disclosed.EMERGENCY_STATUS.data !== undefined);
  });

  // Transition to ELEVATED: Mom gains APPROXIMATE_LOCATION
  await journeyService.updateJourneyState(journeyId, 'ELEVATED');
  const momElevatedView = await contactViewService.getContactViewForJourney(journeyId, momId);

  it('ELEVATED: Mom gains access to APPROXIMATE_LOCATION', () => {
    assert.strictEqual(momElevatedView.visibilityMatrix.APPROXIMATE_LOCATION.allowed, true);
    const approxData = momElevatedView.disclosed.APPROXIMATE_LOCATION.data;
    assert(approxData, 'Approximate data should be disclosed');
    assert(approxData.approximateArea.includes('vicinity'), 'Approximate area described');
    // Ensure exact coordinates are STILL NOT leaked in approx location!
    assert.strictEqual(approxData.latitude, undefined, 'Approximate location must conceal exact GPS latitude');
    assert.strictEqual(approxData.longitude, undefined, 'Approximate location must conceal exact GPS longitude');
  });

  it('ELEVATED: Mom still restricted from LIVE_LOCATION', () => {
    assert.strictEqual(momElevatedView.visibilityMatrix.LIVE_LOCATION.allowed, false);
    assert.strictEqual(momElevatedView.disclosed.LIVE_LOCATION.data, undefined);
  });

  // Transition to CRISIS: Mom gains LIVE_LOCATION
  await journeyService.updateJourneyState(journeyId, 'CRISIS');
  const momCrisisView = await contactViewService.getContactViewForJourney(journeyId, momId);

  it('CRISIS: Mom gains access to LIVE_LOCATION per crisis policy', () => {
    assert.strictEqual(momCrisisView.visibilityMatrix.LIVE_LOCATION.allowed, true);
    const liveData = momCrisisView.disclosed.LIVE_LOCATION.data;
    assert(liveData, 'Live location data should be disclosed in CRISIS');
    assert(typeof liveData.latitude === 'number', 'Latitude provided');
    assert(typeof liveData.longitude === 'number', 'Longitude provided');
    assert(liveData.simulationNotice.includes('Simulation'), 'Includes prototype simulation flag');
  });

  it('CRISIS: Mom gains access to JOURNEY_DETAILS', () => {
    assert.strictEqual(momCrisisView.visibilityMatrix.JOURNEY_DETAILS.allowed, true);
    const detailsData = momCrisisView.disclosed.JOURNEY_DETAILS.data;
    assert(detailsData, 'Details data should be disclosed');
    assert.strictEqual(detailsData.destination, 'Home');
  });

  // ----------------------------------------------------
  // Test 7: Multi-contact differential permissions under identical state
  // ----------------------------------------------------
  console.log('\n--- Test 7: Different contacts have different permissions ---');
  // Set state to ELEVATED for both
  await journeyService.updateJourneyState(journeyId, 'ELEVATED');
  const viewMomInElevated = await contactViewService.getContactViewForJourney(journeyId, momId);
  const viewPriyaInElevated = await contactViewService.getContactViewForJourney(journeyId, priyaId);

  it('In ELEVATED: Mom has APPROXIMATE_LOCATION allowed, Priya has it restricted', () => {
    assert.strictEqual(viewMomInElevated.visibilityMatrix.APPROXIMATE_LOCATION.allowed, true);
    assert.strictEqual(viewPriyaInElevated.visibilityMatrix.APPROXIMATE_LOCATION.allowed, false);
    assert(viewMomInElevated.disclosed.APPROXIMATE_LOCATION.data !== undefined);
    assert.strictEqual(viewPriyaInElevated.disclosed.APPROXIMATE_LOCATION.data, undefined);
  });

  // Compare in NORMAL: Ananya has JOURNEY_STATUS restricted, Mom & Priya have it allowed
  await journeyService.updateJourneyState(journeyId, 'NORMAL');
  const viewMomInNormal = await contactViewService.getContactViewForJourney(journeyId, momId);
  const viewAnanyaInNormal = await contactViewService.getContactViewForJourney(journeyId, ananyaId);

  it('In NORMAL: Mom has JOURNEY_STATUS allowed, Ananya has it restricted', () => {
    assert.strictEqual(viewMomInNormal.visibilityMatrix.JOURNEY_STATUS.allowed, true);
    assert.strictEqual(viewAnanyaInNormal.visibilityMatrix.JOURNEY_STATUS.allowed, false);
    assert(viewMomInNormal.disclosed.JOURNEY_STATUS.data !== undefined);
    assert.strictEqual(viewAnanyaInNormal.disclosed.JOURNEY_STATUS.data, undefined);
  });

  it('Differential policy demonstrates: Same safety event, distinct permissions', () => {
    assert.notStrictEqual(
      viewMomInNormal.visibilityMatrix.JOURNEY_STATUS.allowed,
      viewAnanyaInNormal.visibilityMatrix.JOURNEY_STATUS.allowed
    );
  });

  // ----------------------------------------------------
  // Test 8: Inactive contacts strictly handled
  // ----------------------------------------------------
  console.log('\n--- Test 8: Inactive contacts handled correctly ---');
  // In CRISIS state, test inactive contact tc-4 (Rohan)
  await journeyService.updateJourneyState(journeyId, 'CRISIS');
  const inactiveView = await contactViewService.getContactViewForJourney(journeyId, inactiveId);

  it('Inactive contact has isActive: false recorded', () => {
    assert.strictEqual(inactiveView.contact.isActive, false);
  });

  it('Inactive contact is restricted from ALL 5 information categories even in CRISIS', () => {
    const matrix = inactiveView.visibilityMatrix;
    for (const infoType of Object.keys(matrix)) {
      assert.strictEqual(matrix[infoType].allowed, false, `${infoType} must be restricted`);
      assert(
        matrix[infoType].explanation.includes('inactive in your Safety Circle'),
        `Explanation should state contact is inactive for ${infoType}`
      );
    }
  });

  it('Inactive contact receives ZERO disclosed sensitive data', () => {
    const disclosed = inactiveView.disclosed;
    for (const key of Object.keys(disclosed)) {
      assert.strictEqual(disclosed[key].allowed, false);
      assert.strictEqual(disclosed[key].data, undefined, `No data leaked for ${key}`);
    }
  });

  // Clean up to NORMAL
  await safetyStateEngine.resetSafetySimulation(journeyId);
  await journeyService.updateJourneyState(journeyId, 'NORMAL');

  console.log('\n====================================================');
  console.log(`   PHASE 9 TEST RESULTS: ${passedTests}/${totalTests} CHECKS PASSED!   `);
  console.log('====================================================\n');
}

runPhase9Tests().catch(err => {
  console.error('\n[FATAL] Phase 9 test suite failed:');
  console.error(err);
  process.exit(1);
});
