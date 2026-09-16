const { createDefaultDeviceState, DEVICE_STATUSES } = require('../models/DeviceStatus');
const journeyService = require('./journeyService');
const safetyStateEngine = require('./safetyStateEngine');

// In-memory store for device states per journey
const inMemoryDeviceStates = new Map();

class DeviceFallbackService {
  /**
   * Retrieves or initializes device status for a journey
   */
  async getDeviceStatus(journeyId) {
    const journey = await journeyService.getJourneyById(journeyId);
    if (!journey) {
      const error = new Error('Journey not found');
      error.statusCode = 404;
      throw error;
    }

    if (!inMemoryDeviceStates.has(journeyId)) {
      const defaultState = createDefaultDeviceState(journeyId, journey.currentState || 'NORMAL');
      inMemoryDeviceStates.set(journeyId, defaultState);
    }

    const state = inMemoryDeviceStates.get(journeyId);
    // Keep last known safety state in sync
    state.lastKnownSafetyState = journey.currentState || 'NORMAL';
    return state;
  }

  /**
   * Simulates primary phone becoming unavailable (e.g. battery drain, signal loss)
   * Activates Wearable Fallback mode and emits DEVICE_OFFLINE (+10) to Safety State Engine.
   *
   * REALISM RULE:
   * Does NOT claim live phone tracking when the phone is unavailable.
   * Demonstrates future companion wearable continuity.
   */
  async setPhoneUnavailable(journeyId) {
    const state = await this.getDeviceStatus(journeyId);
    const journey = await journeyService.getJourneyById(journeyId);

    const now = new Date().toISOString();

    // 1. Update phone state to UNAVAILABLE
    state.phone.status = 'UNAVAILABLE';
    state.phone.connectionType = 'NONE';
    state.phone.batteryLevel = 0;
    state.phone.lastSeen = now;
    state.phone.isFallbackActive = false;

    // 2. Engage Wearable as fallback device
    if (state.wearable.status !== 'DISCONNECTED') {
      state.wearable.status = 'CONNECTED';
      state.wearable.connectionType = 'STANDALONE_ESCORTSYNC_FALLBACK';
      state.wearable.isFallbackActive = true;
      state.activeDevice = 'WEARABLE';
      state.fallbackActive = true;
    } else {
      state.activeDevice = 'NONE';
      state.fallbackActive = false;
    }

    state.lastSynchronizedAt = now;
    state.lastKnownSafetyState = journey.currentState || 'NORMAL';
    state.simulationNotice = 'Hardware Integration Simulation — Wearable active as fallback. No live phone tracking.';

    // 3. Emit explainable DEVICE_OFFLINE event to Safety State Engine (contributes +10, not instant crisis)
    await safetyStateEngine.processNewEvent(journeyId, {
      type: 'DEVICE_OFFLINE',
      description: 'Primary smartphone unavailable. SafeCircle wearable fallback engaged.',
      source: 'SENSOR_SIMULATOR',
      metadata: {
        previousDevice: 'PHONE',
        activeFallback: state.wearable.status === 'CONNECTED' ? 'WEARABLE' : 'NONE',
        simulation: true
      }
    });

    inMemoryDeviceStates.set(journeyId, state);
    return state;
  }

  /**
   * Restores primary phone to CONNECTED state
   */
  async setPhoneConnected(journeyId) {
    const state = await this.getDeviceStatus(journeyId);
    const journey = await journeyService.getJourneyById(journeyId);

    const now = new Date().toISOString();

    // Restore phone
    state.phone.status = 'CONNECTED';
    state.phone.connectionType = 'CELLULAR_5G';
    state.phone.batteryLevel = 84;
    state.phone.lastSeen = now;
    state.phone.isFallbackActive = false;

    // Return wearable to companion standby
    if (state.wearable.status === 'CONNECTED') {
      state.wearable.connectionType = 'BLE_COMPANION_LINK';
      state.wearable.isFallbackActive = false;
    }

    state.activeDevice = 'PHONE';
    state.fallbackActive = false;
    state.lastSynchronizedAt = now;
    state.lastKnownSafetyState = journey.currentState || 'NORMAL';
    state.simulationNotice = 'Hardware Integration Simulation — Primary smartphone restored.';

    inMemoryDeviceStates.set(journeyId, state);
    return state;
  }

  /**
   * Updates wearable device status (CONNECTED or DISCONNECTED)
   */
  async setWearableStatus(journeyId, status) {
    const upperStatus = String(status || '').toUpperCase();
    if (!DEVICE_STATUSES.includes(upperStatus)) {
      const error = new Error(`Invalid status "${status}". Allowed: ${DEVICE_STATUSES.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const state = await this.getDeviceStatus(journeyId);
    state.wearable.status = upperStatus;
    state.wearable.lastSeen = new Date().toISOString();

    if (upperStatus === 'DISCONNECTED') {
      state.wearable.connectionType = 'NONE';
      state.wearable.isFallbackActive = false;
      if (state.phone.status === 'UNAVAILABLE') {
        state.activeDevice = 'NONE';
        state.fallbackActive = false;
      }
    } else if (upperStatus === 'CONNECTED') {
      state.wearable.connectionType = state.phone.status === 'UNAVAILABLE' 
        ? 'STANDALONE_ESCORTSYNC_FALLBACK' 
        : 'BLE_COMPANION_LINK';
      if (state.phone.status === 'UNAVAILABLE') {
        state.activeDevice = 'WEARABLE';
        state.fallbackActive = true;
      }
    }

    inMemoryDeviceStates.set(journeyId, state);
    return state;
  }

  /**
   * Resets device states to standard baseline
   */
  async resetDeviceState(journeyId) {
    const journey = await journeyService.getJourneyById(journeyId);
    const defaultState = createDefaultDeviceState(journeyId, journey?.currentState || 'NORMAL');
    inMemoryDeviceStates.set(journeyId, defaultState);
    return defaultState;
  }
}

module.exports = new DeviceFallbackService();
