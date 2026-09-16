const mongoose = require('mongoose');

const EVENT_TYPES = [
  'JOURNEY_STARTED',
  'ROUTE_DEVIATION',
  'PROLONGED_STOP',
  'MISSED_CHECKIN',
  'DEVICE_OFFLINE',
  'USER_CONFIRMED_SAFE',
  'NEED_HELP',
  'EMERGENCY_ACTIVATED',
  'UNUSUAL_JOURNEY_DELAY'
];

const SEVERITY_LEVELS = ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const DEFAULT_SCORE_CONTRIBUTIONS = {
  JOURNEY_STARTED: 0,
  ROUTE_DEVIATION: 25,
  PROLONGED_STOP: 20,
  MISSED_CHECKIN: 25,
  DEVICE_OFFLINE: 10,
  USER_CONFIRMED_SAFE: 0,
  NEED_HELP: 50,
  EMERGENCY_ACTIVATED: 80,
  UNUSUAL_JOURNEY_DELAY: 15
};

const DEFAULT_SEVERITIES = {
  JOURNEY_STARTED: 'INFO',
  ROUTE_DEVIATION: 'MEDIUM',
  PROLONGED_STOP: 'MEDIUM',
  MISSED_CHECKIN: 'MEDIUM',
  DEVICE_OFFLINE: 'LOW',
  USER_CONFIRMED_SAFE: 'INFO',
  NEED_HELP: 'HIGH',
  EMERGENCY_ACTIVATED: 'CRITICAL',
  UNUSUAL_JOURNEY_DELAY: 'MEDIUM'
};

const journeyEventSchema = new mongoose.Schema({
  journeyId: {
    type: String,
    required: [true, 'journeyId is required'],
    index: true
  },
  type: {
    type: String,
    required: [true, 'Event type is required'],
    enum: {
      values: EVENT_TYPES,
      message: '{VALUE} is not a valid journey event type'
    }
  },
  severity: {
    type: String,
    enum: {
      values: SEVERITY_LEVELS,
      message: '{VALUE} is not a valid severity level'
    },
    default: function() {
      return DEFAULT_SEVERITIES[this.type] || 'INFO';
    }
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true
  },
  scoreContribution: {
    type: Number,
    default: function() {
      return DEFAULT_SCORE_CONTRIBUTIONS[this.type] !== undefined
        ? DEFAULT_SCORE_CONTRIBUTIONS[this.type]
        : 0;
    }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({})
  },
  source: {
    type: String,
    enum: ['SYSTEM', 'SENSOR_SIMULATOR', 'USER', 'DEMO', 'ANOMALY_ENGINE', 'AI_ANOMALY_INTELLIGENCE'],
    default: 'DEMO'
  },
  timestamp: {
    type: Date,
    default: Date.now
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
  JourneyEvent: mongoose.model('JourneyEvent', journeyEventSchema),
  EVENT_TYPES,
  SEVERITY_LEVELS,
  DEFAULT_SCORE_CONTRIBUTIONS,
  DEFAULT_SEVERITIES
};
