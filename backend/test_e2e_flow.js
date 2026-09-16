/**
 * SafeCircle Complete End-to-End System Flow Test (Phase 13)
 *
 * Verifies the complete lifecycle:
 * 1. Create Safety Circle contact
 * 2. Configure privacy permissions
 * 3. Create journey
 * 4. Select SafePath route
 * 5. Start journey
 * 6. Create check-in
 * 7. Generate journey/anomaly event
 * 8. Safety State Engine evaluates
 * 9. Safety state changes
 * 10. Check escalation
 * 11. Open Contact Dashboard
 * 12. Verify permission-controlled information
 * 13. Change state
 * 14. Verify contact information changes according to policy
 * 15. Confirm user is safe
 * 16. Verify de-escalation
 * 17. Complete journey
 */

const assert = require('assert');
const contactService = require('./src/services/contactService');
const journeyService = require('./src/services/journeyService');
const safetyStateEngine = require('./src/services/safetyStateEngine');
const checkInService = require('./src/services/checkInService');
const contactViewService = require('./src/services/contactViewService');
const escalationEngine = require('./src/services/escalationEngine');

let passedChecks = 0;
function pass(desc) {
  console.log(`[PASS] ${desc}`);
  passedChecks++;
}

async function runE2EFlow() {
  console.log('====================================================');
  console.log('   SafeCircle Phase 13: Complete End-to-End Test    ');
  console.log('====================================================\n');

  // Step 1: Create Safety Circle contact
  console.log('--- Step 1: Create Safety Circle contact ---');
  const contactData = {
    name: 'Aarav (Brother)',
    relationship: 'Sibling',
    phone: '+91 99887 76655',
    email: 'aarav.demo@example.com',
    priority: 1,
    isActive: true,
    notificationPreference: 'SMS'
  };
  const newContact = await contactService.createContact(contactData);
  assert.ok(newContact && newContact.id, 'New contact must be created with ID');
  assert.strictEqual(newContact.name, 'Aarav (Brother)');
  pass(`Created contact: ${newContact.name} (${newContact.id})`);

  // Step 2: Configure privacy permissions
  console.log('\n--- Step 2: Configure privacy permissions ---');
  const customPermissions = {
    NORMAL: {
      JOURNEY_STATUS: true,
      APPROXIMATE_LOCATION: false,
      LIVE_LOCATION: false,
      EMERGENCY_STATUS: false,
      JOURNEY_DETAILS: false
    },
    CAUTION: {
      JOURNEY_STATUS: true,
      APPROXIMATE_LOCATION: false,
      LIVE_LOCATION: false,
      EMERGENCY_STATUS: true,
      JOURNEY_DETAILS: false
    },
    ELEVATED: {
      JOURNEY_STATUS: true,
      APPROXIMATE_LOCATION: true,
      LIVE_LOCATION: false,
      EMERGENCY_STATUS: true,
      JOURNEY_DETAILS: false
    },
    CRISIS: {
      JOURNEY_STATUS: true,
      APPROXIMATE_LOCATION: true,
      LIVE_LOCATION: true,
      EMERGENCY_STATUS: true,
      JOURNEY_DETAILS: true
    }
  };
  const permUpdate = await contactService.updateContactPermissions(newContact.id, customPermissions);
  assert.strictEqual(permUpdate.permissions.NORMAL.JOURNEY_STATUS, true);
  assert.strictEqual(permUpdate.permissions.NORMAL.LIVE_LOCATION, false);
  assert.strictEqual(permUpdate.permissions.CRISIS.LIVE_LOCATION, true);
  pass('Configured custom 4-tier progressive disclosure policy for contact');

  // Step 3: Create journey
  console.log('\n--- Step 3: Create journey ---');
  const journeyPayload = {
    startLocation: { name: 'Campus Science Block', latitude: 12.9716, longitude: 77.5946 },
    destination: { name: 'Metro Station West', latitude: 12.9520, longitude: 77.6120 },
    expectedArrival: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    selectedContacts: [newContact.id],
    notes: 'Heading home via transit corridor'
  };
  const createdJourney = await journeyService.createJourney(journeyPayload);
  assert.ok(createdJourney && createdJourney.id, 'Journey created with valid ID');
  pass(`Created journey: ${createdJourney.id} (${createdJourney.startLocation.name} → ${createdJourney.destination.name})`);

  // Step 4: Select SafePath
  console.log('\n--- Step 4: Select SafePath route ---');
  const safePathRoute = {
    routeId: 'safepath-commercial-lit',
    name: 'Lit Boulevard SafePath (High Visibility)',
    distance: '3.2 km',
    estimatedDuration: '14 mins',
    routeType: 'SAFEPATH',
    contextualEstimate: 'Continuous street illumination & emergency escort beacons',
    signals: ['Continuous LED lighting', 'Active commercial storefronts', 'High phone signal density'],
    waypoints: [[12.9716, 77.5946], [12.9640, 77.6010], [12.9520, 77.6120]]
  };
  const routeUpdated = await journeyService.updateJourneyRoute(createdJourney.id, safePathRoute);
  assert.strictEqual(routeUpdated.selectedRoute.routeType, 'SAFEPATH');
  assert.strictEqual(routeUpdated.selectedRoute.name, safePathRoute.name);
  pass(`Selected SafePath route: ${routeUpdated.selectedRoute.name}`);

  // Step 5: Start journey
  console.log('\n--- Step 5: Start journey ---');
  const startedJourney = await journeyService.updateJourneyStatus(createdJourney.id, 'ACTIVE');
  assert.strictEqual(startedJourney.status, 'ACTIVE');
  assert.strictEqual(startedJourney.currentState, 'NORMAL');
  pass('Journey started successfully (Status: ACTIVE, State: NORMAL)');

  // Step 6: Create check-in
  console.log('\n--- Step 6: Create check-in ---');
  const checkIn = await checkInService.createCheckIn(startedJourney.id, { minutesUntilDue: 5 });
  assert.ok(checkIn && checkIn.id);
  assert.strictEqual(checkIn.status, 'PENDING');
  assert.strictEqual(checkIn.journeyId, startedJourney.id);
  pass(`Created safety check-in prompt: ${checkIn.id} (Status: PENDING)`);

  // Step 7: Generate journey / anomaly event
  console.log('\n--- Step 7: Generate journey / anomaly event ---');
  const anomalyEvent = await safetyStateEngine.processNewEvent(startedJourney.id, {
    type: 'ROUTE_DEVIATION',
    severity: 'MEDIUM',
    scoreContribution: 35,
    description: 'Vehicle diverged 400m from SafePath illuminated boulevard',
    source: 'ANOMALY_ENGINE'
  });
  assert.strictEqual(anomalyEvent.event.type, 'ROUTE_DEVIATION');
  pass(`Generated explainable anomaly event: ROUTE_DEVIATION (+35 points)`);

  // Step 8 & 9: Safety State Engine evaluates & State changes
  console.log('\n--- Step 8 & 9: Safety State Engine evaluates & State changes ---');
  assert.strictEqual(anomalyEvent.currentSafetyState, 'CAUTION');
  assert.strictEqual(anomalyEvent.signalScore, 35);
  assert.strictEqual(anomalyEvent.stateChanged, true);
  pass(`Safety State Engine transitioned state: NORMAL → CAUTION (Score: 35)`);

  // Step 10: Check escalation
  console.log('\n--- Step 10: Check escalation ---');
  const escalationResult = await escalationEngine.triggerEscalation(
    startedJourney.id, 
    checkIn.id, 
    'ROUTE_DEVIATION_ALERT', 
    { level: 'LEVEL_1' }
  );
  assert.ok(escalationResult && escalationResult.id);
  assert.strictEqual(escalationResult.level, 'LEVEL_1');
  pass(`Escalation record generated: Level 1 dispatched for ${escalationResult.targetContacts.length} contact(s)`);

  // Step 11 & 12: Open Contact Dashboard & Verify permission-controlled information
  console.log('\n--- Step 11 & 12: Open Contact Dashboard & Verify permissions in CAUTION ---');
  const contactViewCaution = await contactViewService.getContactViewForJourney(startedJourney.id, newContact.id);
  assert.strictEqual(contactViewCaution.journey.safetyState, 'CAUTION');
  assert.strictEqual(contactViewCaution.visibilityMatrix.JOURNEY_STATUS.allowed, true);
  assert.strictEqual(contactViewCaution.visibilityMatrix.EMERGENCY_STATUS.allowed, true);
  assert.strictEqual(contactViewCaution.visibilityMatrix.LIVE_LOCATION.allowed, false);
  assert.strictEqual(contactViewCaution.disclosed.LIVE_LOCATION.status, 'RESTRICTED', 'Live GPS coordinates must be restricted');
  assert.strictEqual(contactViewCaution.disclosed.JOURNEY_STATUS.status, 'ALLOWED', 'Status should be allowed');
  pass('Contact view in CAUTION correctly allows status & emergency notice while strictly stripping live coordinates');

  // Step 13 & 14: Change state to CRISIS & verify contact information expands according to policy
  console.log('\n--- Step 13 & 14: Change state to CRISIS & verify dynamic policy expansion ---');
  const crisisEvent = await safetyStateEngine.processNewEvent(startedJourney.id, {
    type: 'EMERGENCY_ACTIVATED',
    severity: 'CRITICAL',
    scoreContribution: 50,
    description: 'Emergency trigger initiated by user in corridor',
    source: 'USER_ACTION'
  });
  assert.strictEqual(crisisEvent.currentSafetyState, 'CRISIS');

  const contactViewCrisis = await contactViewService.getContactViewForJourney(startedJourney.id, newContact.id);
  assert.strictEqual(contactViewCrisis.journey.safetyState, 'CRISIS');
  assert.strictEqual(contactViewCrisis.visibilityMatrix.LIVE_LOCATION.allowed, true, 'Live location now authorized in CRISIS');
  assert.strictEqual(contactViewCrisis.disclosed.LIVE_LOCATION.status, 'ALLOWED', 'Live coordinates disclosed under CRISIS policy');
  pass('Dynamic disclosure verified: Live coordinates unlocked in CRISIS exactly per user policy');

  // Step 15 & 16: Confirm user is safe & verify de-escalation
  console.log('\n--- Step 15 & 16: Confirm user safe & verify de-escalation ---');
  const safeEvent = await safetyStateEngine.processNewEvent(startedJourney.id, {
    type: 'USER_CONFIRMED_SAFE',
    severity: 'INFO',
    scoreContribution: 0,
    description: 'User confirmed safety at transit stop checkpoint',
    source: 'USER'
  });
  assert.strictEqual(safeEvent.currentSafetyState, 'NORMAL');
  assert.strictEqual(safeEvent.signalScore, 0);

  const contactViewDeescalated = await contactViewService.getContactViewForJourney(startedJourney.id, newContact.id);
  assert.strictEqual(contactViewDeescalated.journey.safetyState, 'NORMAL');
  assert.strictEqual(contactViewDeescalated.visibilityMatrix.LIVE_LOCATION.allowed, false, 'Live GPS revoked upon return to NORMAL');
  assert.strictEqual(contactViewDeescalated.disclosed.LIVE_LOCATION.status, 'RESTRICTED');
  pass('Safety de-escalated to NORMAL: Score reset to 0, sensitive disclosures immediately revoked');

  // Step 17: Complete journey
  console.log('\n--- Step 17: Complete journey ---');
  const completedJourney = await journeyService.updateJourneyStatus(startedJourney.id, 'COMPLETED');
  assert.strictEqual(completedJourney.status, 'COMPLETED');
  assert.ok(completedJourney.endedAt !== null);
  pass(`Journey completed successfully (Status: COMPLETED, endedAt: ${completedJourney.endedAt})`);

  console.log('\n====================================================');
  console.log(`   END-TO-END FLOW: ALL ${passedChecks}/${passedChecks} CHECKS PASSED!   `);
  console.log('====================================================\n');
}

runE2EFlow().catch(err => {
  console.error('\n[FAIL] End-to-end flow failed:', err);
  process.exit(1);
});
