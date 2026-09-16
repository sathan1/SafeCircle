const mongoose = require('mongoose');

const CHECKIN_STATUSES = ['PENDING', 'COMPLETED', 'MISSED', 'CANCELLED'];
const CHECKIN_RESPONSES = ['SAFE', 'NEED_HELP'];

const checkInSchema = new mongoose.Schema({
  journeyId: {
    type: String,
    required: [true, 'journeyId is required'],
    index: true
  },
  status: {
    type: String,
    enum: {
      values: CHECKIN_STATUSES,
      message: '{VALUE} is not a valid check-in status'
    },
    default: 'PENDING'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  dueAt: {
    type: Date,
    required: [true, 'dueAt timestamp is required']
  },
  respondedAt: {
    type: Date,
    default: null
  },
  response: {
    type: String,
    enum: {
      values: [...CHECKIN_RESPONSES, null],
      message: '{VALUE} is not a valid check-in response'
    },
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
  CheckIn: mongoose.model('CheckIn', checkInSchema),
  CHECKIN_STATUSES,
  CHECKIN_RESPONSES
};
