const mongoose = require('mongoose');

const JOURNEY_STATUSES = ['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
const SAFETY_STATES = ['NORMAL', 'CAUTION', 'ELEVATED', 'CRISIS'];

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null }
}, { _id: false });

const journeySchema = new mongoose.Schema({
  userId: {
    type: String,
    default: 'demo-user-1'
  },
  startLocation: {
    type: locationSchema,
    required: [true, 'Start location is required']
  },
  destination: {
    type: locationSchema,
    required: [true, 'Destination is required']
  },
  expectedArrival: {
    type: Date,
    required: [true, 'Expected arrival time is required']
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: {
      values: JOURNEY_STATUSES,
      message: '{VALUE} is not a valid journey status'
    },
    default: 'ACTIVE'
  },
  currentState: {
    type: String,
    enum: {
      values: SAFETY_STATES,
      message: '{VALUE} is not a valid safety state'
    },
    default: 'NORMAL'
  },
  selectedContacts: [{
    type: String
  }],
  selectedRoute: {
    routeId: { type: String, default: null },
    name: { type: String, default: null },
    distance: { type: String, default: null },
    estimatedDuration: { type: String, default: null },
    routeType: { type: String, default: null },
    contextualEstimate: { type: String, default: null },
    signals: [{ type: String }],
    waypoints: [[Number]]
  },
  notes: {
    type: String,
    trim: true,
    default: ''
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
  Journey: mongoose.model('Journey', journeySchema),
  JOURNEY_STATUSES,
  SAFETY_STATES
};
