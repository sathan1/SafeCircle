const mongoose = require('mongoose');

const DEVICE_TYPES = ['PHONE', 'WEARABLE'];
const DEVICE_STATUSES = ['CONNECTED', 'DISCONNECTED', 'UNAVAILABLE'];

const deviceStatusSchema = new mongoose.Schema({
  journeyId: {
    type: String,
    required: true,
    index: true
  },
  deviceType: {
    type: String,
    required: true,
    enum: DEVICE_TYPES
  },
  status: {
    type: String,
    required: true,
    enum: DEVICE_STATUSES,
    default: 'CONNECTED'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 85
  },
  connectionType: {
    type: String,
    default: 'CELLULAR'
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  isFallbackActive: {
    type: Boolean,
    default: false
  },
  lastSyncState: {
    type: String,
    default: 'NORMAL'
  }
}, {
  timestamps: true
});

const createDefaultDeviceState = (journeyId, currentState = 'NORMAL') => {
  const now = new Date().toISOString();
  return {
    journeyId,
    phone: {
      deviceType: 'PHONE',
      status: 'CONNECTED',
      lastSeen: now,
      batteryLevel: 82,
      connectionType: 'CELLULAR_5G',
      isPrimary: true,
      isFallbackActive: false,
      lastSyncState: currentState,
      modelName: 'Primary Smartphone (SafeCircle Escort App)'
    },
    wearable: {
      deviceType: 'WEARABLE',
      status: 'CONNECTED',
      lastSeen: now,
      batteryLevel: 94,
      connectionType: 'BLE_COMPANION_LINK',
      isPrimary: false,
      isFallbackActive: false,
      lastSyncState: currentState,
      modelName: 'SafeCircle Companion Band / Smartwatch'
    },
    activeDevice: 'PHONE',
    fallbackActive: false,
    lastSynchronizedAt: now,
    simulationNotice: 'Hardware Integration Simulation — Demonstrating future companion wearable fallback'
  };
};

module.exports = {
  DEVICE_TYPES,
  DEVICE_STATUSES,
  createDefaultDeviceState,
  DeviceStatus: mongoose.model('DeviceStatus', deviceStatusSchema)
};
