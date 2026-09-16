/**
 * Phase 8 Automated Test Suite
 * Tests all 12 requirements specified in Section 17 of the Phase 8 specification.
 */
const checkInService = require('./src/services/checkInService');
const escalationEngine = require('./src/services/escalationEngine');
const safetyStateEngine = require('./src/services/safetyStateEngine');
const journeyService = require('./src/services/journeyService');
const { canShareInformation } = require('./src/services/permissionService');

async function runPhase8Tests() {
  console.log('====================================================');
  console.log('   SafeCircle Phase 8: Check-In & Escalation Tests   ');
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

  // Create clean active journey for test
  const journey = await journeyService.createJourney({
    startLocation: { name: 'Campus Library', latitude: 12.97, longitude: 77.59 },
    destination: { name: 'Apartment', latitude: 12.93, longitude: 77.62 },
    expectedArrival: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    selectedContacts: ['tc-1', 'tc-2']
  });
  const journeyId = journey.id;

  // 1. TEST: Creating a check-in
  console.log('--- Test 1: Creating a check-in ---');
  const chk1 = await checkInService.createCheckIn(journeyId, { minutesUntilDue: 5 });
  assert(chk1 && chk1.id, 'Check-in created with valid ID');
  assert(chk1.status === 'PENDING', 'Check-in status is PENDING');
  assert(chk1.journeyId === journeyId, 'Check-in linked to correct journeyId');

  const activeChk = await checkInService.getActiveCheckIn(journeyId);
  assert(activeChk && activeChk.id === chk1.id, 'getActiveCheckIn returns newly created pending check-in');

  // 2. TEST: Completing a check-in with SAFE
  console.log('\n--- Test 2: Completing check-in with SAFE ---');
  const safeRes = await checkInService.respondToCheckIn(chk1.id, 'SAFE');
  assert(safeRes.checkIn.status === 'COMPLETED', 'Check-in status is COMPLETED');
  assert(safeRes.checkIn.response === 'SAFE', 'Check-in response recorded as SAFE');
  assert(safeRes.checkIn.respondedAt !== null, 'respondedAt timestamp is recorded');
  assert(safeRes.engineResult.currentSafetyState === 'NORMAL', 'Safety state remains/returns to NORMAL');

  // Verify that active check-in is now null
  const noActive = await checkInService.getActiveCheckIn(journeyId);
  assert(noActive === null, 'No pending check-in active after completion');

  // 3. TEST: Duplicate response handling
  console.log('\n--- Test 3: Duplicate response handling ---');
  let duplicateRejected = false;
  try {
    await checkInService.respondToCheckIn(chk1.id, 'SAFE');
  } catch (err) {
    duplicateRejected = true;
    assert(err.statusCode === 400, 'Duplicate response rejected with HTTP 400');
  }
  assert(duplicateRejected, 'Cannot respond to already completed check-in');

  // 4. TEST: Creating check-in and completing with NEED_HELP
  console.log('\n--- Test 4: Completing check-in with NEED_HELP ---');
  const chk2 = await checkInService.createCheckIn(journeyId, { minutesUntilDue: 3 });
  const helpRes = await checkInService.respondToCheckIn(chk2.id, 'NEED_HELP');
  assert(helpRes.checkIn.status === 'COMPLETED', 'Check-in status is COMPLETED');
  assert(helpRes.checkIn.response === 'NEED_HELP', 'Response recorded as NEED_HELP');
  assert(helpRes.engineResult.signalScore >= 50, 'Score increased by +50 for NEED_HELP');
  assert(helpRes.escalation !== null, 'Escalation triggered for NEED_HELP');
  assert(helpRes.escalation.level === 'LEVEL_3', 'NEED_HELP initiated LEVEL_3 emergency escalation');

  // 5. TEST: Detecting a missed check-in & creating MISSED_CHECKIN event
  console.log('\n--- Test 5: Detecting missed check-in & Safety State Engine integration ---');
  // Reset safety simulation first
  await safetyStateEngine.resetSafetySimulation(journeyId);
  await escalationEngine.resolveActiveEscalations(journeyId, 'Clean test setup');

  // Create an already-overdue check-in (due 1 minute ago)
  const pastDue = new Date(Date.now() - 60 * 1000).toISOString();
  const chkOverdue = await checkInService.createCheckIn(journeyId, { dueAt: pastDue });
  assert(chkOverdue.status === 'PENDING', 'Overdue check-in created with past due timestamp');

  // Detection triggers automatically via checkMissedCheckIns or getActiveCheckIn
  const missedResults = await checkInService.checkMissedCheckIns(journeyId);
  assert(missedResults.length === 1, 'Detected 1 missed check-in');
  assert(missedResults[0].checkIn.status === 'MISSED', 'Check-in status updated to MISSED');
  assert(missedResults[0].engineResult.signalScore === 25, 'Safety State Engine evaluated MISSED_CHECKIN (+25)');
  assert(missedResults[0].escalation !== null, 'Escalation record generated for missed check-in');
  assert(missedResults[0].escalation.level === 'LEVEL_1', 'Missed check-in initiated Level 1 escalation');

  // 6. TEST: Second missed check-in elevates state to CAUTION (25 + 25 = 50 -> ELEVATED)
  console.log('\n--- Test 6: Escalation & state escalation on multiple missed check-ins ---');
  const chkOverdue2 = await checkInService.createCheckIn(journeyId, { dueAt: pastDue });
  const missedResults2 = await checkInService.checkMissedCheckIns(journeyId);
  assert(missedResults2.length === 1, 'Second overdue check-in detected');
  assert(missedResults2[0].engineResult.signalScore === 50, 'Safety Signal Score reached 50');
  assert(missedResults2[0].engineResult.currentSafetyState === 'ELEVATED', 'State escalated to ELEVATED');

  // 7. TEST: Escalation record created & target contacts evaluated by Privacy Permission Engine
  console.log('\n--- Test 7: Privacy Permission Engine controlling shared information in escalation ---');
  const escalations = await escalationEngine.getEscalations(journeyId);
  assert(escalations.length >= 2, `Retrieved ${escalations.length} escalation records for journey`);
  const latestEsc = escalations[0];
  assert(latestEsc.status === 'NOTIFIED_SIMULATION', 'Escalation marked as NOTIFIED_SIMULATION');
  assert(Array.isArray(latestEsc.targetContacts) && latestEsc.targetContacts.length > 0, 'Target contacts array populated');

  // Verify contact packet respects privacy permissions under current state (ELEVATED)
  const momContact = latestEsc.targetContacts.find(c => c.name === 'Mom');
  if (momContact) {
    console.log('   Mom allowed disclosures in ELEVATED:', momContact.allowedDisclosures);
    assert(momContact.allowedDisclosures.JOURNEY_STATUS === true, 'Mom authorized for status');
    assert(momContact.allowedDisclosures.APPROXIMATE_LOCATION === true, 'Mom authorized for approx location in ELEVATED');
    assert(momContact.allowedDisclosures.LIVE_LOCATION === false, 'Mom restricted from live GPS in ELEVATED per privacy policy');
  }

  // 8. TEST: Escalation being resolved
  console.log('\n--- Test 8: Resolving active escalations ---');
  const resolvedList = await escalationEngine.resolveActiveEscalations(journeyId, 'User entered PIN');
  assert(resolvedList.length > 0, `Resolved ${resolvedList.length} active escalations`);
  const activeEscAfter = (await escalationEngine.getEscalations(journeyId)).filter(e => e.status !== 'RESOLVED');
  assert(activeEscAfter.length === 0, 'No unresolved escalations remain');

  // 9. TEST: No active journey handling
  console.log('\n--- Test 9: Non-existent journey handling ---');
  let nonExistentRejected = false;
  try {
    await checkInService.createCheckIn('invalid-journey-id-999');
  } catch (err) {
    nonExistentRejected = true;
    assert(err.statusCode === 404, 'Non-existent journey returned HTTP 404');
  }
  assert(nonExistentRejected, 'Handled non-existent journey properly');

  // 10. TEST: Invalid check-in ID handling
  console.log('\n--- Test 10: Invalid check-in ID handling ---');
  let invalidChkRejected = false;
  try {
    await checkInService.respondToCheckIn('non-existent-chk', 'SAFE');
  } catch (err) {
    invalidChkRejected = true;
    assert(err.statusCode === 404, 'Invalid check-in ID returned HTTP 404');
  }
  assert(invalidChkRejected, 'Handled non-existent check-in ID properly');

  // 11. TEST: Invalid response value handling
  console.log('\n--- Test 11: Invalid check-in response value rejection ---');
  const chkValid = await checkInService.createCheckIn(journeyId, { minutesUntilDue: 5 });
  let invalidRespRejected = false;
  try {
    await checkInService.respondToCheckIn(chkValid.id, 'UNKNOWN_RESPONSE');
  } catch (err) {
    invalidRespRejected = true;
    assert(err.statusCode === 400, 'Invalid response value returned HTTP 400');
  }
  assert(invalidRespRejected, 'Rejected invalid response value properly');

  // 12. TEST: Check-In history retrieval
  console.log('\n--- Test 12: Check-in history retrieval ---');
  const history = await checkInService.getCheckIns(journeyId);
  assert(history.length >= 4, `Check-in history contains ${history.length} records`);

  console.log('\n====================================================');
  console.log(`   PHASE 8 TEST RESULTS: ${passedCount} CHECKS PASSED!   `);
  console.log('====================================================');
}

runPhase8Tests().catch(err => {
  console.error('Phase 8 test execution error:', err);
  process.exit(1);
});
