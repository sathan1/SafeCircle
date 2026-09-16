const mongoose = require('mongoose');

const ESCALATION_LEVELS = ['LEVEL_1', 'LEVEL_2', 'LEVEL_3'];
const ESCALATION_STATUSES = ['PENDING', 'NOTIFIED_SIMULATION', 'RESOLVED', 'CANCELLED'];

const escalationSchema = new mongoose.Schema({
  journeyId: {
    type: String,
    required: [true, 'journeyId is required'],
    index: true
  },
  checkInId: {
    type: String,
    default: null
  },
  level: {
    type: String,
    enum: {
      values: ESCALATION_LEVELS,
      message: '{VALUE} is not a valid escalation level'
    },
    required: [true, 'level is required']
  },
  trigger: {
    type: String,
    required: [true, 'trigger description is required']
  },
  status: {
    type: String,
    enum: {
      values: ESCALATION_STATUSES,
      message: '{VALUE} is not a valid escalation status'
    },
    default: 'NOTIFIED_SIMULATION'
  },
  targetContacts: [{
    contactId: String,
    name: String,
    relationship: String,
    priority: Number,
    phone: String,
    allowedDisclosures: mongoose.Schema.Types.Mixed,
    notificationType: { type: String, default: 'SIMULATED_ALERT' }
  }],
  reason: {
    type: String,
    default: ''
  },
  resolvedAt: {
    type: Date,
    default: null
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
  Escalation: mongoose.model('Escalation', escalationSchema),
  ESCALATION_LEVELS,
  ESCALATION_STATUSES
};
