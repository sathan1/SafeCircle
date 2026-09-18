const assert = require('assert');
const { users, contacts, invitations, journeys } = require('./src/services/db');
const contactService = require('./src/services/contactService');
const journeyService = require('./src/services/journeyService');
const contactViewService = require('./src/services/contactViewService');
const safetyStateEngine = require('./src/services/safetyStateEngine');

async function runMultiDeviceSyncTest() {
  console.log('====================================================');
  console.log('   SafeCircle: 3-Account Multi-Device Sync Test     ');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function check(condition, message) {
    total++;
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  // --- Step 1: Create Three Real Accounts ---
  console.log('--- Step 1: Register Person, Mom, and Dad ---');
  await users.removeMany(u => ['person@safecircle.test', 'mom@safecircle.test', 'dad@safecircle.test'].includes(u.email));

  const personUser = await users.insert({
    name: 'Person User',
    email: 'person@safecircle.test',
    passwordHash: 'hashed_password_person'
  });
  check(personUser.id && personUser.email === 'person@safecircle.test', 'Person account created');

  const momUser = await users.insert({
    name: 'Mom',
    email: 'mom@safecircle.test',
    passwordHash: 'hashed_password_mom'
  });
  check(momUser.id && momUser.email === 'mom@safecircle.test', 'Mom account created');

  const dadUser = await users.insert({
    name: 'Dad',
    email: 'dad@safecircle.test',
    passwordHash: 'hashed_password_dad'
  });
  check(dadUser.id && dadUser.email === 'dad@safecircle.test', 'Dad account created');

  // --- Step 2: Person Invites Mom and Dad ---
  console.log('\n--- Step 2: Person sends trusted contact invitations ---');
  const momInvite = await contactService.inviteContact({
    name: 'Mom',
    email: 'mom@safecircle.test',
    relationship: 'Parent',
    phone: '+1 555-0101',
    priority: 1,
    permissions: {
      NORMAL: { JOURNEY_STATUS: true, APPROXIMATE_LOCATION: false, LIVE_LOCATION: false, EMERGENCY_STATUS: false, JOURNEY_DETAILS: false },
      CAUTION: { JOURNEY_STATUS: true, APPROXIMATE_LOCATION: false, LIVE_LOCATION: false, EMERGENCY_STATUS: true, JOURNEY_DETAILS: false },
      ELEVATED: { JOURNEY_STATUS: true, APPROXIMATE_LOCATION: true, LIVE_LOCATION: false, EMERGENCY_STATUS: true, JOURNEY_DETAILS: true },
      CRISIS: { JOURNEY_STATUS: true, APPROXIMATE_LOCATION: true, LIVE_LOCATION: true, EMERGENCY_STATUS: true, JOURNEY_DETAILS: true }
    }
  }, personUser);
  check(momInvite.invitation && momInvite.invitation.status === 'PENDING', 'Invitation sent to Mom');

  const dadInvite = await contactService.inviteContact({
    name: 'Dad',
    email: 'dad@safecircle.test',
    relationship: 'Parent',
    phone: '+1 555-0102',
    priority: 2,
    permissions: {
      NORMAL: { JOURNEY_STATUS: true, APPROXIMATE_LOCATION: false, LIVE_LOCATION: false, EMERGENCY_STATUS: false, JOURNEY_DETAILS: false },
      CAUTION: { JOURNEY_STATUS: true, APPROXIMATE_LOCATION: false, LIVE_LOCATION: false, EMERGENCY_STATUS: false, JOURNEY_DETAILS: false },
      ELEVATED: { JOURNEY_STATUS: true, APPROXIMATE_LOCATION: false, LIVE_LOCATION: false, EMERGENCY_STATUS: true, JOURNEY_DETAILS: false },
      CRISIS: { JOURNEY_STATUS: true, APPROXIMATE_LOCATION: true, LIVE_LOCATION: true, EMERGENCY_STATUS: true, JOURNEY_DETAILS: true }
    }
  }, personUser);
  check(dadInvite.invitation && dadInvite.invitation.status === 'PENDING', 'Invitation sent to Dad');

  // --- Step 3: Mom and Dad Check & Accept Invitations ---
  console.log('\n--- Step 3: Mom and Dad receive and accept invitations ---');
  const momPending = await contactService.getPendingInvitations('mom@safecircle.test');
  check(momPending.length === 1 && momPending[0].fromUserName === 'Person User', 'Mom retrieves pending invitation from Person');

  await contactService.respondToInvitation(momPending[0].id, 'ACCEPTED', momUser);
  const momWards = await contactService.getWardsForUser('mom@safecircle.test');
  check(momWards.length === 1 && momWards[0].wardName === 'Person User', 'Mom now protects Person (Ward accepted)');

  const dadPending = await contactService.getPendingInvitations('dad@safecircle.test');
  check(dadPending.length === 1 && dadPending[0].fromUserName === 'Person User', 'Dad retrieves pending invitation from Person');

  await contactService.respondToInvitation(dadPending[0].id, 'ACCEPTED', dadUser);
  const dadWards = await contactService.getWardsForUser('dad@safecircle.test');
  check(dadWards.length === 1 && dadWards[0].wardName === 'Person User', 'Dad now protects Person (Ward accepted)');

  // --- Step 4: Person Starts a Safe Journey ---
  console.log('\n--- Step 4: Person starts Safe Journey with Mom and Dad in Circle ---');
  const journey = await journeyService.createJourney({
    startLocation: { name: 'Library', latitude: 12.9784, longitude: 77.6046 },
    destination: { name: 'Home', latitude: 12.9352, longitude: 77.6245 },
    expectedArrival: new Date(Date.now() + 30 * 60000).toISOString(),
    selectedContacts: [momInvite.contact.id, dadInvite.contact.id],
    notes: 'Heading home by foot'
  }, personUser.id);
  check(journey.status === 'ACTIVE' && journey.currentState === 'NORMAL', 'Journey started in NORMAL state');

  // --- Step 5: Test Differential Disclosures in NORMAL ---
  console.log('\n--- Step 5: Verify disclosures in NORMAL state ---');
  const momViewNormal = await contactViewService.getContactViewForJourney(journey.id, momInvite.contact.id);
  check(momViewNormal.visibilityMatrix.JOURNEY_STATUS.allowed === true, 'Mom allowed JOURNEY_STATUS in NORMAL');
  check(momViewNormal.visibilityMatrix.APPROXIMATE_LOCATION.allowed === false, 'Mom restricted from APPROXIMATE_LOCATION in NORMAL');
  check(momViewNormal.visibilityMatrix.LIVE_LOCATION.allowed === false, 'Mom restricted from LIVE_LOCATION in NORMAL');
  check(!momViewNormal.disclosed.LIVE_LOCATION.data, 'Live GPS coordinates stripped from Mom in NORMAL');

  const dadViewNormal = await contactViewService.getContactViewForJourney(journey.id, dadInvite.contact.id);
  check(dadViewNormal.visibilityMatrix.JOURNEY_STATUS.allowed === true, 'Dad allowed JOURNEY_STATUS in NORMAL');
  check(!dadViewNormal.disclosed.LIVE_LOCATION.data, 'Live GPS coordinates stripped from Dad in NORMAL');

  // --- Step 6: Trigger CAUTION (Route Deviation) ---
  console.log('\n--- Step 6: Anomaly triggers CAUTION state ---');
  await safetyStateEngine.processNewEvent(journey.id, {
    type: 'ROUTE_DEVIATION',
    points: 35,
    description: 'Deviated 350m from recommended corridor'
  });
  await journeyService.updateJourneyState(journey.id, 'CAUTION');

  const momViewCaution = await contactViewService.getContactViewForJourney(journey.id, momInvite.contact.id);
  const dadViewCaution = await contactViewService.getContactViewForJourney(journey.id, dadInvite.contact.id);
  check(momViewCaution.visibilityMatrix.EMERGENCY_STATUS.allowed === true, 'Mom gains EMERGENCY_STATUS in CAUTION per policy');
  check(dadViewCaution.visibilityMatrix.EMERGENCY_STATUS.allowed === false, 'Dad restricted from EMERGENCY_STATUS in CAUTION per policy');

  // --- Step 7: Escalate to ELEVATED (No response to check-in) ---
  console.log('\n--- Step 7: Escalation to ELEVATED state (Differential Policy Proof) ---');
  await safetyStateEngine.processNewEvent(journey.id, {
    type: 'MISSED_CHECKIN',
    points: 25,
    description: 'Check-in timed out without confirmation'
  });
  await journeyService.updateJourneyState(journey.id, 'ELEVATED');

  const momViewElevated = await contactViewService.getContactViewForJourney(journey.id, momInvite.contact.id);
  const dadViewElevated = await contactViewService.getContactViewForJourney(journey.id, dadInvite.contact.id);
  check(momViewElevated.visibilityMatrix.APPROXIMATE_LOCATION.allowed === true, 'Mom unlocks APPROXIMATE_LOCATION in ELEVATED');
  check(dadViewElevated.visibilityMatrix.APPROXIMATE_LOCATION.allowed === false, 'Dad strictly denied APPROXIMATE_LOCATION in ELEVATED');
  check(momViewElevated.visibilityMatrix.LIVE_LOCATION.allowed === false, 'Mom still denied LIVE_LOCATION in ELEVATED');
  check(dadViewElevated.visibilityMatrix.LIVE_LOCATION.allowed === false, 'Dad still denied LIVE_LOCATION in ELEVATED');

  // --- Step 8: Escalate to CRISIS (SOS Beacon Triggered) ---
  console.log('\n--- Step 8: Emergency Beacon escalates to CRISIS state ---');
  await safetyStateEngine.processNewEvent(journey.id, {
    type: 'NEED_HELP',
    points: 50,
    description: 'User triggered emergency beacon'
  });
  await journeyService.updateJourneyState(journey.id, 'CRISIS');

  const momViewCrisis = await contactViewService.getContactViewForJourney(journey.id, momInvite.contact.id);
  const dadViewCrisis = await contactViewService.getContactViewForJourney(journey.id, dadInvite.contact.id);
  check(momViewCrisis.visibilityMatrix.LIVE_LOCATION.allowed === true, 'Mom unlocks LIVE_LOCATION in CRISIS');
  check(dadViewCrisis.visibilityMatrix.LIVE_LOCATION.allowed === true, 'Dad unlocks LIVE_LOCATION in CRISIS');
  check(momViewCrisis.disclosed.LIVE_LOCATION !== undefined, 'Live GPS telemetry present for Mom in CRISIS');
  check(dadViewCrisis.disclosed.LIVE_LOCATION !== undefined, 'Live GPS telemetry present for Dad in CRISIS');

  // --- Step 9: False Alarm Cleared (User Confirmed Safe) ---
  console.log('\n--- Step 9: User confirms safe -> De-escalate to NORMAL ---');
  await safetyStateEngine.processNewEvent(journey.id, {
    type: 'USER_CONFIRMED_SAFE',
    points: 0,
    description: 'User entered safe PIN and marked false alarm resolved'
  });
  await journeyService.updateJourneyState(journey.id, 'NORMAL');

  const momViewReset = await contactViewService.getContactViewForJourney(journey.id, momInvite.contact.id);
  const dadViewReset = await contactViewService.getContactViewForJourney(journey.id, dadInvite.contact.id);
  check(momViewReset.visibilityMatrix.LIVE_LOCATION.allowed === false, 'Mom live GPS immediately revoked on reset');
  check(dadViewReset.visibilityMatrix.LIVE_LOCATION.allowed === false, 'Dad live GPS immediately revoked on reset');
  check(!momViewReset.disclosed.LIVE_LOCATION.data, 'No GPS leaks after safe resolution');
  check(!dadViewReset.disclosed.LIVE_LOCATION.data, 'No GPS leaks for Dad after safe resolution');

  console.log('\n====================================================');
  console.log(`   3-ACCOUNT SYNC RESULTS: ${passed}/${total} CHECKS PASSED! `);
  console.log('====================================================\n');
}

runMultiDeviceSyncTest().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
