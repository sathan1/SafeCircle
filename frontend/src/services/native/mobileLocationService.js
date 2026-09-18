import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

class MobileLocationService {
  constructor() {
    this.lastKnownLocation = null;
    this.watchId = null;
    this.staleThresholdMs = 120000; // 2 minutes
  }

  async checkPermissions() {
    if (!Capacitor.isNativePlatform()) {
      return { location: 'granted' };
    }
    try {
      return await Geolocation.checkPermissions();
    } catch (err) {
      console.warn('Error checking geolocation permissions:', err);
      return { location: 'prompt' };
    }
  }

  async requestPermissions() {
    if (!Capacitor.isNativePlatform()) {
      return { location: 'granted' };
    }
    try {
      return await Geolocation.requestPermissions();
    } catch (err) {
      console.warn('Error requesting geolocation permissions:', err);
      return { location: 'denied' };
    }
  }

  async getCurrentLocation() {
    try {
      let position;
      if (Capacitor.isNativePlatform()) {
        position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        });
      } else if (navigator.geolocation) {
        position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 30000
          });
        });
      }

      if (position && position.coords) {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy || 10,
          speed: position.coords.speed || 0,
          heading: position.coords.heading || null,
          altitude: position.coords.altitude || null,
          timestamp: position.timestamp || Date.now(),
          isStale: false,
          isLive: true,
          source: Capacitor.isNativePlatform() ? 'android-fused-location' : 'browser-gps'
        };
        this.lastKnownLocation = loc;
        return loc;
      }
    } catch (err) {
      console.warn('Failed to get live location:', err.message);
    }

    // Return last known location marked as stale if available
    if (this.lastKnownLocation) {
      const isStale = (Date.now() - this.lastKnownLocation.timestamp) > this.staleThresholdMs;
      return {
        ...this.lastKnownLocation,
        isStale,
        isLive: false
      };
    }

    // Default fallback coordinates (Central Bangalore)
    return {
      lat: 12.9716,
      lng: 77.5946,
      accuracy: 50,
      timestamp: Date.now(),
      isStale: true,
      isLive: false,
      source: 'fallback-default'
    };
  }

  getLastKnownLocation() {
    if (!this.lastKnownLocation) return null;
    const isStale = (Date.now() - this.lastKnownLocation.timestamp) > this.staleThresholdMs;
    return {
      ...this.lastKnownLocation,
      isStale
    };
  }
}

export const mobileLocationService = new MobileLocationService();
export default mobileLocationService;
