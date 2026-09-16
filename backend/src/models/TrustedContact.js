const mongoose = require('mongoose');

const RELATIONSHIPS = ['Parent', 'Sibling', 'Friend', 'Partner', 'Guardian', 'Other'];
const NOTIFICATION_PREFERENCES = ['Push', 'SMS', 'Call', 'Email'];

const SAFETY_STATES = ['NORMAL', 'CAUTION', 'ELEVATED', 'CRISIS'];
const INFORMATION_TYPES = [
  'JOURNEY_STATUS',
  'APPROXIMATE_LOCATION',
  'LIVE_LOCATION',
  'EMERGENCY_STATUS',
  'JOURNEY_DETAILS'
];

const DEFAULT_PERMISSIONS = {
  NORMAL: {
    JOURNEY_STATUS: true,
    APPROXIMATE_LOCATION: false,
    LIVE_LOCATION: false,
    EMERGENCY_STATUS: false,
    JOURNEY_DETAILS: false
  },
  CAUTION: {
    JOURNEY_STATUS: true,
    APPROXIMATE_LOCATION: false,
    LIVE_LOCATION: false,
    EMERGENCY_STATUS: true,
    JOURNEY_DETAILS: false
  },
  ELEVATED: {
    JOURNEY_STATUS: true,
    APPROXIMATE_LOCATION: true,
    LIVE_LOCATION: false,
    EMERGENCY_STATUS: true,
    JOURNEY_DETAILS: true
  },
  CRISIS: {
    JOURNEY_STATUS: true,
    APPROXIMATE_LOCATION: true,
    LIVE_LOCATION: true,
    EMERGENCY_STATUS: true,
    JOURNEY_DETAILS: true
  }
};

const createDefaultPermissions = () => JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS));

const statePermissionSchema = new mongoose.Schema({
  JOURNEY_STATUS: { type: Boolean, default: true },
  APPROXIMATE_LOCATION: { type: Boolean, default: false },
  LIVE_LOCATION: { type: Boolean, default: false },
  EMERGENCY_STATUS: { type: Boolean, default: false },
  JOURNEY_DETAILS: { type: Boolean, default: false }
}, { _id: false });

const trustedContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  relationship: {
    type: String,
    required: [true, 'Relationship is required'],
    enum: {
      values: RELATIONSHIPS,
      message: '{VALUE} is not a supported relationship'
    },
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  priority: {
    type: Number,
    required: [true, 'Priority is required'],
    min: [1, 'Priority must be a positive integer'],
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notificationPreference: {
    type: String,
    enum: {
      values: NOTIFICATION_PREFERENCES,
      message: '{VALUE} is not a valid notification preference'
    },
    default: 'Push'
  },
  permissions: {
    type: Map,
    of: statePermissionSchema,
    default: createDefaultPermissions
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

module.exports = {
  TrustedContact: mongoose.model('TrustedContact', trustedContactSchema),
  RELATIONSHIPS,
  NOTIFICATION_PREFERENCES,
  SAFETY_STATES,
  INFORMATION_TYPES,
  DEFAULT_PERMISSIONS,
  createDefaultPermissions
};
