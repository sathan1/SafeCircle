import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * Mobile App lifecycle, status bar, and hardware back-button controller
 */
class MobileAppService {
  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.backButtonHandlers = [];
  }

  async initialize(navigate, onBackDefault) {
    if (!this.isNative) return;

    try {
      // Configure Status Bar
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
    } catch (e) {
      console.warn('Status bar styling unavailable:', e);
    }

    try {
      // Register native back-button listener
      App.addListener('backButton', ({ canGoBack }) => {
        // If any custom handler registered (e.g. modal, discreet mode), invoke the top one
        if (this.backButtonHandlers.length > 0) {
          const handler = this.backButtonHandlers[this.backButtonHandlers.length - 1];
          const handled = handler();
          if (handled) return;
        }

        // Check if on root or login screen
        const currentPath = window.location.pathname;
        if (currentPath === '/' || currentPath === '/login') {
          App.exitApp();
          return;
        }

        if (currentPath === '/register') {
          if (navigate) navigate('/login');
          return;
        }

        if (canGoBack && navigate) {
          navigate(-1);
        } else if (onBackDefault && onBackDefault()) {
          return;
        } else if (navigate) {
          navigate('/');
        } else {
          App.exitApp();
        }
      });
    } catch (e) {
      console.warn('Back button listener registration failed:', e);
    }
  }

  pushBackHandler(handler) {
    this.backButtonHandlers.push(handler);
    return () => {
      this.backButtonHandlers = this.backButtonHandlers.filter(h => h !== handler);
    };
  }

  async exitApp() {
    if (this.isNative) {
      await App.exitApp();
    }
  }

  isAndroid() {
    return Capacitor.getPlatform() === 'android';
  }
}

export const mobileAppService = new MobileAppService();
export default mobileAppService;
