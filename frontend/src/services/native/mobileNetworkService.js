import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';

class MobileNetworkService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.connectionType = 'unknown';
    this.listeners = [];
  }

  async initialize() {
    try {
      const status = await Network.getStatus();
      this.isOnline = status.connected;
      this.connectionType = status.connectionType;

      Network.addListener('networkStatusChange', (status) => {
        this.isOnline = status.connected;
        this.connectionType = status.connectionType;
        this.notifyListeners();
      });
    } catch (e) {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notifyListeners();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notifyListeners();
      });
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback({ isOnline: this.isOnline, connectionType: this.connectionType });
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(cb => {
      try {
        cb({ isOnline: this.isOnline, connectionType: this.connectionType });
      } catch (err) {
        console.error('Error notifying network listener:', err);
      }
    });
  }
}

export const mobileNetworkService = new MobileNetworkService();
export default mobileNetworkService;
