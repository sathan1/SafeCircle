import { Capacitor, registerPlugin } from '@capacitor/core';

// Reference to native plugin if available
const DiscreetLauncher = registerPlugin('DiscreetLauncher');

class MobileDiscreetService {
  constructor() {
    this.isNative = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  }

  getSavedPin() {
    return localStorage.getItem('safecircle_discreet_pin') || '1234';
  }

  setPin(pin) {
    if (!pin || pin.length < 4) {
      throw new Error('PIN must be at least 4 digits');
    }
    localStorage.setItem('safecircle_discreet_pin', pin);
    return true;
  }

  verifyPin(inputPin) {
    const saved = this.getSavedPin();
    return String(inputPin).trim() === saved;
  }

  getSavedMode() {
    return localStorage.getItem('safecircle_discreet_mode') || 'normal';
  }

  async setLauncherMode(mode) {
    localStorage.setItem('safecircle_discreet_mode', mode);

    if (this.isNative) {
      try {
        const result = await DiscreetLauncher.setLauncherMode({ mode });
        return result;
      } catch (err) {
        console.warn('[DiscreetMode] Native launcher switch warning:', err.message);
      }
    }

    return {
      success: true,
      activeMode: mode,
      note: 'Discreet mode appearance updated.'
    };
  }

  async getCurrentLauncherMode() {
    if (this.isNative) {
      try {
        const res = await DiscreetLauncher.getLauncherMode();
        return res.mode || this.getSavedMode();
      } catch (e) {
        // Fall back to saved local preference
      }
    }
    return this.getSavedMode();
  }
}

export const mobileDiscreetService = new MobileDiscreetService();
export default mobileDiscreetService;
