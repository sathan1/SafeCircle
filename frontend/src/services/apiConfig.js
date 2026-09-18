/**
 * SafeCircle Centralized API & Real-Time Gateway Configuration
 *
 * Allows dynamic runtime override from the mobile UI so evaluators can easily
 * test the app on physical phones against their laptop backend (e.g. http://192.168.1.50:5000)
 * without needing to recompile the APK.
 */

import { Capacitor } from '@capacitor/core';

// Current host laptop LAN IP detected on local Wi-Fi
const DEFAULT_LAN_URL = 'http://10.85.25.60:5000';
const DEFAULT_LOCAL_URL = 'http://localhost:5000';

export function getApiBaseUrl() {
  const custom = localStorage.getItem('safecircle_api_url');
  if (custom && custom.trim()) {
    return custom.trim().replace(/\/+$/, '');
  }

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // If running in browser and accessed via LAN IP (e.g. http://192.168.x.x:5173),
  // automatically point API requests to the same host on port 5000
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1' && !host.startsWith('10.0.2.')) {
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
