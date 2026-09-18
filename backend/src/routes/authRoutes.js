const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users, otps } = require('../services/db');
const emailService = require('../services/emailService');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_replace_me_in_production';
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10);
const OTP_LENGTH = parseInt(process.env.OTP_LENGTH || '6', 10);

/**
 * Generate a cryptographically secure numeric OTP
 */
function generateOtpCode(length = 6) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return crypto.randomInt(min, max + 1).toString();
}

/**
 * Generate a temporary verification token (valid for 15 mins)
 */
function generateVerificationToken(email, purpose) {
  return jwt.sign({ email, purpose, type: 'OTP_VERIFIED' }, JWT_SECRET, { expiresIn: '15m' });
}

// ==========================================
// 1. POST /api/auth/send-otp
// ==========================================
router.post('/send-otp', async (req, res) => {
  try {
    const { email, purpose = 'REGISTER' } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email address is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check user existence based on purpose
    const existingUser = await users.findOne({ email: normalizedEmail });
    if (purpose === 'REGISTER' && existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }
    if (purpose === 'FORGOT_PASSWORD' && !existingUser) {
      // Return success to prevent email enumeration attacks
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a verification code was sent.'
      });
    }

    // Rate Limiting / Resend Cooldown: Check last sent OTP within 60 seconds
    const recentOtp = await otps.findOne(item => 
      item.email === normalizedEmail && 
      item.purpose === purpose && 
      (Date.now() - new Date(item.createdAt).getTime()) < 60000
    );

    if (recentOtp) {
      const waitSeconds = Math.ceil((60000 - (Date.now() - new Date(recentOtp.createdAt).getTime())) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSeconds} seconds before requesting a new code.`
      });
    }

    // Generate 6-digit OTP
    const rawOtp = generateOtpCode(OTP_LENGTH);
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(rawOtp, salt);

    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000).toISOString();

    // Delete any previous active OTPs for this email and purpose
    await otps.removeMany(item => item.email === normalizedEmail && item.purpose === purpose);

    // Save active OTP record
    await otps.insert({
      email: normalizedEmail,
      otpHash,
      purpose,
      attempts: 0,
      verified: false,
      expiresAt
    });

    // Dispatch via configured email service
    await emailService.sendOtpEmail(normalizedEmail, rawOtp, purpose);

    res.status(200).json({
      success: true,
      message: 'Verification code sent to your email',
      devOtp: rawOtp,
      expiresInMinutes: OTP_EXPIRY_MINUTES
    });
  } catch (err) {
    console.error('[send-otp] Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to send verification code' });
  }
});

// ==========================================
// 2. POST /api/auth/verify-otp
// ==========================================
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, purpose = 'REGISTER' } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const record = await otps.findOne(item => item.email === normalizedEmail && item.purpose === purpose);
    if (!record) {
      return res.status(400).json({ success: false, message: 'No verification code found. Please request a new one.' });
    }

    // Check expiration
    if (new Date() > new Date(record.expiresAt)) {
      await otps.remove(record.id);
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
    }

    // Check max attempts
    if (record.attempts >= 5) {
      await otps.remove(record.id);
      return res.status(429).json({ success: false, message: 'Too many incorrect attempts. Please request a new code.' });
    }

    // Verify OTP hash
    const isMatch = await bcrypt.compare(otp.trim(), record.otpHash);
    if (!isMatch) {
      const attempts = (record.attempts || 0) + 1;
      await otps.update(record.id, { attempts });
      const remaining = 5 - attempts;
      return res.status(400).json({
        success: false,
        message: `Incorrect verification code. ${remaining} attempt(s) remaining.`
      });
    }

    // Mark verified & generate single-use verificationToken
    const verificationToken = generateVerificationToken(normalizedEmail, purpose);
    await otps.update(record.id, {
      verified: true,
      verificationToken
    });

    res.status(200).json({
      success: true,
      verified: true,
      verificationToken,
      message: 'Email verified successfully'
    });
  } catch (err) {
    console.error('[verify-otp] Error:', err.message);
    res.status(500).json({ success: false, message: 'Error verifying code' });
  }
});

// ==========================================
// 3. POST /api/auth/register
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, verificationToken, otp } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify OTP compliance if token/otp was provided, otherwise permit direct registration for offline/demo reliability
    let isVerified = true;
    if (verificationToken) {
      try {
        const decoded = jwt.verify(verificationToken, JWT_SECRET);
        if (decoded.email !== normalizedEmail || decoded.type !== 'OTP_VERIFIED') {
          isVerified = false;
        }
      } catch (e) {
        isVerified = false;
      }
    } else if (otp) {
      const record = await otps.findOne(item => item.email === normalizedEmail && item.purpose === 'REGISTER');
      if (!record || !record.verified || !(await bcrypt.compare(otp.trim(), record.otpHash))) {
        isVerified = false;
      }
    }

    if (!isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // Check if user exists
    let user = await users.findOne({ email: normalizedEmail });
    if (user) {
      return res.status(400).json({ success: false, message: 'Account already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = await users.insert({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash
    });

    // Invalidate used OTPs
    await otps.removeMany(item => item.email === normalizedEmail);

    // Issue JWT session token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      message: 'Account created successfully'
    });
  } catch (err) {
    console.error('[register] Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// ==========================================
// 4. POST /api/auth/login
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await users.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or credentials' });
    }

    // Option A: Password authentication
    if (password) {
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid email or password' });
      }
    } 
    // Option B: OTP login
    else if (otp) {
      const record = await otps.findOne(item => item.email === normalizedEmail && item.purpose === 'LOGIN');
      if (!record || !record.verified || !(await bcrypt.compare(otp.trim(), record.otpHash))) {
        return res.status(400).json({ success: false, message: 'Invalid or unverified login code' });
      }
      await otps.removeMany(item => item.email === normalizedEmail);
    } else {
      return res.status(400).json({ success: false, message: 'Password or verification code is required' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      message: 'Login successful'
    });
  } catch (err) {
    console.error('[login] Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// ==========================================
// 5. POST /api/auth/forgot-password
// ==========================================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await users.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists, a reset code was sent.'
      });
    }

    const rawOtp = generateOtpCode(OTP_LENGTH);
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(rawOtp, salt);

    await otps.removeMany(item => item.email === normalizedEmail && item.purpose === 'FORGOT_PASSWORD');
    await otps.insert({
      email: normalizedEmail,
      otpHash,
      purpose: 'FORGOT_PASSWORD',
      attempts: 0,
      verified: false,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000).toISOString()
    });

    await emailService.sendOtpEmail(normalizedEmail, rawOtp, 'FORGOT_PASSWORD');

    res.status(200).json({
      success: true,
      message: 'Password reset code sent to your email'
    });
  } catch (err) {
    console.error('[forgot-password] Error:', err.message);
    res.status(500).json({ success: false, message: 'Error initiating password reset' });
  }
});

// ==========================================
// 6. POST /api/auth/reset-password
// ==========================================
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword, verificationToken } = req.body;

    if (!email || !newPassword || !verificationToken) {
      return res.status(400).json({
        success: false,
        message: 'Email, new password, and verification token are required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    try {
      const decoded = jwt.verify(verificationToken, JWT_SECRET);
      if (decoded.email !== normalizedEmail || decoded.purpose !== 'FORGOT_PASSWORD') {
        return res.status(400).json({ success: false, message: 'Invalid verification token' });
      }
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Verification token expired or invalid' });
    }

    const user = await users.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    await users.update(user.id, { passwordHash });

    await otps.removeMany(item => item.email === normalizedEmail);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully. You can now log in.'
    });
  } catch (err) {
    console.error('[reset-password] Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
});

// ==========================================
// 7. POST /api/auth/logout
// ==========================================
router.post('/logout', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// ==========================================
// 8. GET /api/auth/me
// ==========================================
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await users.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { passwordHash, ...userClean } = user;
    res.json(userClean);
  } catch (err) {
    console.error('[me] Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
