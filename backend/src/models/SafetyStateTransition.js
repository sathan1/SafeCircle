const mongoose = require('mongoose');
const { SAFETY_STATES } = require('./Journey');

const safetyStateTransitionSchema = new mongoose.Schema({
  journeyId: {
    type: String,
    required: [true, 'journeyId is required'],
    index: true
  },
  previousState: {
    type: String,
    enum: SAFETY_STATES,
    required: [true, 'previousState is required']
  },
  newState: {
    type: String,
    enum: SAFETY_STATES,
    required: [true, 'newState is required']
  },
  reason: {
    type: String,
    required: [true, 'Transition reason is required'],
    trim: true
  },
  signalScore: {
    type: Number,
    required: [true, 'signalScore is required'],
    default: 0
  },
  triggeredBy: {
    type: String,
    default: 'Safety State Engine'
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
  SafetyStateTransition: mongoose.model('SafetyStateTransition', safetyStateTransitionSchema)
};
