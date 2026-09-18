import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

class MobileDeviceService {
  async getBatteryInfo() {
    try {
      if (Capacitor.isNativePlatform()) {
        const info = await Device.getBatteryInfo();
        return {
          batteryLevel: Math.round((info.batteryLevel || 1) * 100),
          isCharging: !!info.isCharging,
          isLowBattery: (info.batteryLevel || 1) <= 0.15
        };
      } else if (navigator.getBattery) {
        const battery = await navigator.getBattery();
        return {
          batteryLevel: Math.round(battery.level * 100),
          isCharging: battery.charging,
          isLowBattery: battery.level <= 0.15
        };
      }
    } catch (e) {
      console.warn('Battery status unavailable:', e);
    }
    return {
      batteryLevel: 85,
      isCharging: false,
      isLowBattery: false
    };
  }

  async getDeviceInfo() {
    try {
      if (Capacitor.isNativePlatform()) {
        const info = await Device.getInfo();
        return {
          model: info.model,
          platform: info.platform,
          operatingSystem: info.operatingSystem,
          osVersion: info.osVersion,
          manufacturer: info.manufacturer,
          isVirtual: info.isVirtual
        };
      }
    } catch (e) {
      console.warn('Device info unavailable:', e);
    }
    return {
      model: 'Browser / Web Client',
      platform: 'web',
      operatingSystem: 'Unknown',
      osVersion: '1.0',
      manufacturer: 'Generic',
      isVirtual: false
    };
  }
}

export const mobileDeviceService = new MobileDeviceService();
export default mobileDeviceService;
