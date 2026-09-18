import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

class MobileEvidenceService {
  async checkPermissions() {
    if (!Capacitor.isNativePlatform()) {
      return { camera: 'granted' };
    }
    try {
      return await Camera.checkPermissions();
    } catch (e) {
      console.warn('Camera permission check failed:', e);
      return { camera: 'prompt' };
    }
  }

  async requestPermissions() {
    if (!Capacitor.isNativePlatform()) {
      return { camera: 'granted' };
    }
    try {
      return await Camera.requestPermissions();
    } catch (e) {
      console.warn('Camera permission request failed:', e);
      return { camera: 'denied' };
    }
  }

  /**
   * Captures emergency evidence with explicit user activation.
   * Never activates in secret.
   */
  async captureEmergencySnapshot() {
    if (!Capacitor.isNativePlatform()) {
      // Return simulated snapshot for browser/testing
      return {
        format: 'jpeg',
        dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23f43f5e" width="200" height="200"/><text x="20" y="100" fill="white" font-size="14">Evidence Snapshot</text></svg>',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const image = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      return {
        format: image.format,
        dataUrl: image.dataUrl,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      if (err.message && err.message.includes('User cancelled')) {
        return null;
      }
      throw new Error(`Evidence capture failed: ${err.message}`);
    }
  }
}

export const mobileEvidenceService = new MobileEvidenceService();
export default mobileEvidenceService;
