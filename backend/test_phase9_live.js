/**
 * Live HTTP server verification for Phase 9 Contact Dashboard endpoints
 */
const assert = require('assert');

async function testLiveServer() {
  const BASE_URL = 'http://localhost:5000';
  console.log('--- 1. Testing GET /api/journeys/j-active-1/contact-view/tc-1 (Mom in NORMAL) ---');
  let res = await fetch(`${BASE_URL}/api/journeys/j-active-1/contact-view/tc-1`);
  let json = await res.json();
  assert.strictEqual(res.status, 200, 'HTTP 200 expected');
  assert.strictEqual(json.success, true);
  assert.strictEqual(json.data.contact.name, 'Mom');
  assert.strictEqual(json.data.visibilityMatrix.JOURNEY_STATUS.allowed, true);
  assert.strictEqual(json.data.visibilityMatrix.LIVE_LOCATION.allowed, false);
  assert.strictEqual(json.data.disclosed.LIVE_LOCATION.data, undefined, 'CRITICAL: No GPS leaked');
  console.log('Mom in NORMAL: Status allowed, GPS protected (stripped)');

  console.log('--- 2. Testing Invalid Contact (404) ---');
  res = await fetch(`${BASE_URL}/api/journeys/j-active-1/contact-view/tc-invalid-9999`);
  json = await res.json();
  assert.strictEqual(res.status, 404, 'HTTP 404 expected for missing contact');
  console.log('Invalid contact returned HTTP 404 cleanly');

  console.log('--- 3. Testing Inactive Contact (tc-4 Rohan) ---');
  res = await fetch(`${BASE_URL}/api/journeys/j-active-1/contact-view/tc-4`);
  json = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(json.data.contact.isActive, false);
  assert.strictEqual(json.data.visibilityMatrix.JOURNEY_STATUS.allowed, false);
  assert.strictEqual(json.data.visibilityMatrix.LIVE_LOCATION.allowed, false);
  console.log('Inactive contact strictly denied all disclosures');

  console.log('--- 4. Updating state to ELEVATED and testing differential access ---');
  await fetch(`${BASE_URL}/api/journeys/j-active-1/state`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state: 'ELEVATED' })
  });

  const [resMom, resPriya] = await Promise.all([
    fetch(`${BASE_URL}/api/journeys/j-active-1/contact-view/tc-1`).then(r => r.json()),
    fetch(`${BASE_URL}/api/journeys/j-active-1/contact-view/tc-2`).then(r => r.json())
  ]);

  assert.strictEqual(resMom.data.visibilityMatrix.APPROXIMATE_LOCATION.allowed, true);
  assert.strictEqual(resPriya.data.visibilityMatrix.APPROXIMATE_LOCATION.allowed, false);
  console.log('Differential access verified in ELEVATED: Mom allowed approx location, Priya restricted');

  // Reset state to NORMAL
  await fetch(`${BASE_URL}/api/journeys/j-active-1/state`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state: 'NORMAL' })
  });

  console.log('\nALL PHASE 9 LIVE SERVER CHECKS PASSED SUCCESSFULLY!\n');
}

testLiveServer().catch(err => {
  console.error('[FATAL] Live server test failed:', err);
  process.exit(1);
});
