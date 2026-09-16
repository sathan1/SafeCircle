/**
 * Live HTTP server verification for Phase 10 Anomaly Intelligence endpoints
 */
const assert = require('assert');

async function testLiveServer() {
  const BASE_URL = 'http://localhost:5000';
  const journeyId = 'j-active-1';

  console.log('--- 1. Clear baseline signals ---');
  let res = await fetch(`${BASE_URL}/api/journeys/${journeyId}/anomaly-clear`, { method: 'POST' });
  let json = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(json.success, true);
  console.log('Baseline cleared');

  console.log('--- 2. Query empty anomaly analysis ---');
  res = await fetch(`${BASE_URL}/api/journeys/${journeyId}/anomaly-analysis`);
  json = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(json.data.analysisType, 'RULE_BASED_PROTOTYPE');
  assert.strictEqual(json.data.signalsCount, 0);
  console.log('Initial analysis: 0 signals, RULE_BASED_PROTOTYPE');

  console.log('--- 3. Simulate Route Deviation anomaly signal ---');
  res = await fetch(`${BASE_URL}/api/journeys/${journeyId}/anomaly-signals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'ROUTE_DEVIATION',
      description: 'Vehicle diverted 420m away from SafePath corridor',
      metadata: { deviationMeters: 420 }
    })
  });
  json = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(json.data.emittedSignal, 'ROUTE_DEVIATION');
  assert(json.data.analysis.signalsCount >= 1);
  const devSig = json.data.analysis.signals.find(s => s.type === 'ROUTE_DEVIATION');
  assert.strictEqual(devSig.confidenceMetric, 'Anomaly confidence');
  assert.strictEqual(devSig.confidence, 'High');
  console.log('Route deviation signal verified with High anomaly confidence');

  console.log('--- 4. Simulate Prolonged Stop anomaly signal ---');
  res = await fetch(`${BASE_URL}/api/journeys/${journeyId}/anomaly-signals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'PROLONGED_STOP',
      description: 'Vehicle stationary for 14 minutes',
      metadata: { stopDurationMinutes: 14 }
    })
  });
  json = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(json.data.analysis.signalsCount, 2);
  console.log('Multiple signals coexisting verified: count = 2');

  console.log('--- 5. Verify Safety State Engine accumulated score & updated state ---');
  res = await fetch(`${BASE_URL}/api/journeys/${journeyId}/safety-state`);
  json = await res.json();
  assert.strictEqual(json.data.signalScore, 45); // 25 + 20
  assert.strictEqual(json.data.state, 'CAUTION');
  console.log('Safety State Engine state authority verified: Score = 45, State = CAUTION');

  console.log('--- 6. Clear signals and verify reset ---');
  res = await fetch(`${BASE_URL}/api/journeys/${journeyId}/anomaly-clear`, { method: 'POST' });
  json = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(json.data.analysis.signalsCount, 0);

  res = await fetch(`${BASE_URL}/api/journeys/${journeyId}/safety-state`);
  json = await res.json();
  assert.strictEqual(json.data.state, 'NORMAL');
  assert.strictEqual(json.data.signalScore, 0);
  console.log('Signals cleared and reset to NORMAL baseline verified');

  console.log('\nALL PHASE 10 LIVE SERVER CHECKS PASSED SUCCESSFULLY!\n');
}

testLiveServer().catch(err => {
  console.error('[FATAL] Live server test failed:', err);
  process.exit(1);
});
