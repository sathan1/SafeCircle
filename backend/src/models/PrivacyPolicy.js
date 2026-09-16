const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  journeyStatus: { type: Boolean, default: false },
  safetyAlert: { type: Boolean, default: false },
  approximateLocation: { type: Boolean, default: false },
  liveLocation: { type: Boolean, default: false },
  emergencyStatus: { type: Boolean, default: false },
  evidenceStatus: { type: Boolean, default: false }
}, { _id: false });

const privacyPolicySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrustedContact',
    required: true
  },
  permissions: {
    NORMAL: { type: permissionSchema, default: () => ({}) },
    CAUTION: { type: permissionSchema, default: () => ({ safetyAlert: true }) },
    ELEVATED: { type: permissionSchema, default: () => ({ safetyAlert: true, approximateLocation: true }) },
    CRISIS: { type: permissionSchema, default: () => ({ safetyAlert: true, liveLocation: true, emergencyStatus: true }) }
  }
}, { timestamps: true });

// Ensure one policy per user-contact pair
privacyPolicySchema.index({ userId: 1, contactId: 1 }, { unique: true });

module.exports = mongoose.model('PrivacyPolicy', privacyPolicySchema);
