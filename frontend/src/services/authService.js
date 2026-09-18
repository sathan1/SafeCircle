import { getApiBaseUrl } from './apiConfig';

const getAuthUrl = () => `${getApiBaseUrl()}/api/auth`;

const authService = {
  async sendOtp(email, purpose = 'REGISTER') {
    const response = await fetch(`${getAuthUrl()}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, purpose })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send verification code');
    }
    return data;
  },

  async verifyOtp(email, otp, purpose = 'REGISTER') {
    const response = await fetch(`${getAuthUrl()}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, purpose })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify code');
    }
    return data;
  },

  async register(name, email, password, verificationToken) {
    const response = await fetch(`${getAuthUrl()}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, verificationToken })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    return data;
  },

  async login(email, password, otp) {
    const response = await fetch(`${getAuthUrl()}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, otp })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    return data;
  },

  async forgotPassword(email) {
    const response = await fetch(`${getAuthUrl()}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to initiate password reset');
    }
    return data;
  },

  async resetPassword(email, newPassword, verificationToken) {
    const response = await fetch(`${getAuthUrl()}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword, verificationToken })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to reset password');
    }
    return data;
  },

  async logout() {
    try {
      await fetch(`${getAuthUrl()}/logout`, { method: 'POST' });
    } catch (e) {
      // Ignore network errors during local logout
    }
  },

  async getMe(token) {
    const response = await fetch(`${getAuthUrl()}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (!response.ok) {
      const err = new Error(data.message || 'Failed to fetch user');
      err.status = response.status;
      throw err;
    }
    return data;
  }
};

export default authService;
