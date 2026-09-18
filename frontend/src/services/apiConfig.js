/**
 * SafeCircle Centralized API & Real-Time Gateway Configuration
 *
 * Allows dynamic runtime override from the mobile UI so evaluators can easily
 * test the app on physical phones against their laptop backend (e.g. http://192.168.1.50:5000)
 * without needing to recompile the APK.
 */

import { Capacitor } from '@capacitor/core';

// Current host configurations
export const DEFAULT_LAN_URL = 'http://172.168.67.254:5000';
export const DEFAULT_LOCAL_URL = 'http://localhost:5000';
export const DEFAULT_TUNNEL_URL = 'https://safecircle-live.loca.lt';

export function getApiBaseUrl() {
  // If running in browser on localhost, ALWAYS use local port 5000 loopback
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return DEFAULT_LOCAL_URL;
    }
  }

  const custom = localStorage.getItem('safecircle_api_url');
  if (custom && custom.trim()) {
    const trimmed = custom.trim().replace(/\/+$/, '');
    // Clean dead or outdated addresses
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

  // If accessed via LAN IP in browser (e.g. http://172.168.67.254:5173)
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    if (!host.startsWith('10.0.2.') && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:5000`;
    }
  }

  // If running as native Android APK on a physical phone:
  // Default to live public HTTPS cloud tunnel (works on cellular 4G/5G and Wi-Fi without firewall issues)
  if (Capacitor.isNativePlatform()) {
    return DEFAULT_TUNNEL_URL;
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
