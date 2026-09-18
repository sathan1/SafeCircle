/**
 * SafeCircle Centralized API & Real-Time Gateway Configuration
 *
 * Allows dynamic runtime override from the mobile UI so evaluators can easily
 * test the app on physical phones against their laptop backend (e.g. http://192.168.1.50:5000)
 * without needing to recompile the APK.
 */

import { Capacitor } from '@capacitor/core';

// Current host laptop LAN IP detected on local Wi-Fi
const DEFAULT_LAN_URL = 'http://172.168.67.254:5000';
const DEFAULT_LOCAL_URL = 'http://localhost:5000';

export function getApiBaseUrl() {
  const custom = localStorage.getItem('safecircle_api_url');
  if (custom && custom.trim()) {
    const trimmed = custom.trim().replace(/\/+$/, '');
    // Auto-clean dead Render or stale IPs
    if (trimmed.includes('onrender.com') || trimmed.includes('192.168.31.181') || trimmed.includes('10.85.25.60')) {
      localStorage.removeItem('safecircle_api_url');
    } else {
      return trimmed;
    }
  }

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // If accessed in browser on localhost, always talk directly to local backend port 5000
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return DEFAULT_LOCAL_URL;
    }
    // Accessed via LAN IP in browser (e.g. http://172.168.67.254:5173)
    if (!host.startsWith('10.0.2.')) {
      return `http://${host}:5000`;
    }
  }

  // If running as native Android APK on a physical phone, default to host laptop LAN IP
  if (Capacitor.isNativePlatform()) {
    return DEFAULT_LAN_URL;
  }

  return DEFAULT_LOCAL_URL;
}

export function setApiBaseUrl(url) {
  if (!url || !url.trim()) {
    localStorage.removeItem('safecircle_api_url');
    return getApiBaseUrl();
  }
  const clean = url.trim().replace(/\/+$/, '');
  localStorage.setItem('safecircle_api_url', clean);
  return clean;
}

export function resetApiBaseUrl() {
  localStorage.removeItem('safecircle_api_url');
  return getApiBaseUrl();
}

export function getWsBaseUrl() {
  const httpUrl = getApiBaseUrl();
  if (httpUrl.startsWith('https://')) {
    return httpUrl.replace('https://', 'wss://') + '/ws';
  }
  return httpUrl.replace('http://', 'ws://') + '/ws';
}

export default {
  getApiBaseUrl,
  setApiBaseUrl,
  resetApiBaseUrl,
  getWsBaseUrl
};
