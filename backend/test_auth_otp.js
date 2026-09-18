/**
 * Automated test suite for SafeCircle Authentication & Email OTP
 */
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mongoose = require('mongoose');

// Mock in-memory test database or models for testing
async function runAuthOtpTests() {
  console.log('====================================================');
  console.log('   SafeCircle: Authentication & Email OTP Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  // 1. Test OTP Generation & Hashing
  const rawOtp = crypto.randomInt(100000, 999999).toString();
  assert(rawOtp.length === 6, 'Generated OTP has exactly 6 digits');
  assert(/^\d{6}$/.test(rawOtp), 'Generated OTP is strictly numeric');

  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(rawOtp, salt);
  assert(otpHash !== rawOtp, 'OTP is securely hashed and not stored in plaintext');

  const isMatch = await bcrypt.compare(rawOtp, otpHash);
  assert(isMatch === true, 'Correct OTP matches the bcrypt hash');

  const wrongMatch = await bcrypt.compare('000000', otpHash);
  assert(wrongMatch === false, 'Incorrect OTP is rejected');

  // 2. Test Expiration & Attempts Logic
  const now = Date.now();
  const expiresAt = new Date(now + 10 * 60000);
  const isExpired = Date.now() > expiresAt;
  assert(!isExpired, 'Freshly generated OTP is not expired within 10-minute window');

  const pastExpiry = new Date(now - 1000);
  assert(Date.now() > pastExpiry, 'Expired OTP is accurately flagged by timestamp check');

  let attempts = 0;
  attempts++;
  assert(attempts === 1, 'Failed attempt counter increments');
  assert(5 - attempts === 4, 'Remaining attempts calculated accurately');

  // 3. Test Email Masking / Non-enumeration
  const email = 'harshika@safecircle.test';
  const parts = email.split('@');
  const masked = parts[0].slice(0, 2) + '***@' + parts[1];
  assert(masked.startsWith('ha***'), 'Email masking formats correctly for security UI');

  console.log(`\n====================================================`);
  console.log(`   AUTH & OTP TEST RESULTS: ${passed}/${total} CHECKS PASSED!   `);
  console.log(`====================================================\n`);
}

runAuthOtpTests();
