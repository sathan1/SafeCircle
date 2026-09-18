import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

class MobileNotificationService {
  constructor() {
    this.hasPermission = false;
  }

  async initialize() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      // Create high-priority emergency channel for Android
      await LocalNotifications.createChannel({
        id: 'safecircle-alerts',
        name: 'SafeCircle Emergency Alerts',
        description: 'Critical notifications for safety escalations, check-ins, and emergency signals',
        importance: 5,
        visibility: 1,
        sound: 'res_custom_alert',
        vibration: true
      });
    } catch (e) {
      console.warn('Channel creation skipped or failed:', e);
    }
  }

  async requestPermission() {
    if (!Capacitor.isNativePlatform()) {
      if ('Notification' in window) {
        const res = await Notification.requestPermission();
        this.hasPermission = res === 'granted';
        return this.hasPermission;
      }
      return false;
    }

    try {
      const status = await LocalNotifications.requestPermissions();
      this.hasPermission = status.display === 'granted';
      return this.hasPermission;
    } catch (e) {
      console.warn('Notification permission request failed:', e);
      return false;
    }
  }

  async sendCheckInNotification(journeyId, checkInId, secondsRemaining = 60) {
    if (!Capacitor.isNativePlatform()) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('SafeCircle: Check-In Required', {
          body: `Please confirm your safety within ${secondsRemaining} seconds to prevent circle escalation.`
        });
      }
      return;
    }

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'SafeCircle: Check-In Required',
            body: `Confirm your safety within ${secondsRemaining}s to avoid escalation.`,
            id: Math.floor(Math.random() * 100000),
            channelId: 'safecircle-alerts',
            schedule: { at: new Date(Date.now() + 100) },
            sound: null,
            extra: { journeyId, checkInId }
          }
        ]
      });
    } catch (e) {
      console.warn('Failed to schedule local notification:', e);
    }
  }

  async sendStateEscalationNotification(newState, reason) {
    if (!Capacitor.isNativePlatform()) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`SafeCircle Alert: ${newState}`, {
          body: reason || `Safety state transitioned to ${newState}. Progressive circle awareness updated.`
        });
      }
      return;
    }

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: `SafeCircle: Safety Level ${newState}`,
            body: reason || `Your safety state has escalated to ${newState}.`,
            id: Math.floor(Math.random() * 100000),
            channelId: 'safecircle-alerts',
            schedule: { at: new Date(Date.now() + 100) },
            extra: { newState }
          }
        ]
      });
    } catch (e) {
      console.warn('Failed to schedule escalation notification:', e);
    }
  }
}

export const mobileNotificationService = new MobileNotificationService();
export default mobileNotificationService;
