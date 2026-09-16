const { 
  RELATIONSHIPS, 
  NOTIFICATION_PREFERENCES,
  SAFETY_STATES,
  INFORMATION_TYPES,
  DEFAULT_PERMISSIONS,
  createDefaultPermissions 
} = require('../models/TrustedContact');

// In-memory demo repository pre-seeded with initial trusted contacts and their independent permissions
let inMemoryContacts = [
  {
    id: 'tc-1',
    name: 'Mom',
    relationship: 'Parent',
    phone: '+91 98765 43210',
    email: 'mom.demo@example.com',
    priority: 1,
    isActive: true,
    notificationPreference: 'Push',
    permissions: createDefaultPermissions(),
    createdAt: new Date('2026-09-01T10:00:00Z').toISOString()
  },
  {
    id: 'tc-2',
    name: 'Priya',
    relationship: 'Sibling',
    phone: '+91 98123 45678',
    email: 'priya.demo@example.com',
    priority: 2,
    isActive: true,
    notificationPreference: 'SMS',
    permissions: {
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
        APPROXIMATE_LOCATION: false,
        LIVE_LOCATION: false,
        EMERGENCY_STATUS: true,
        JOURNEY_DETAILS: false
      },
      CRISIS: {
        JOURNEY_STATUS: true,
        APPROXIMATE_LOCATION: true,
        LIVE_LOCATION: true,
        EMERGENCY_STATUS: true,
        JOURNEY_DETAILS: true
      }
    },
    createdAt: new Date('2026-09-05T14:30:00Z').toISOString()
  },
  {
    id: 'tc-3',
    name: 'Ananya',
    relationship: 'Friend',
    phone: '+91 97000 11223',
    email: 'ananya.demo@example.com',
    priority: 3,
    isActive: true,
    notificationPreference: 'Call',
    permissions: {
      NORMAL: {
        JOURNEY_STATUS: false,
        APPROXIMATE_LOCATION: false,
        LIVE_LOCATION: false,
        EMERGENCY_STATUS: false,
        JOURNEY_DETAILS: false
      },
      CAUTION: {
        JOURNEY_STATUS: true,
        APPROXIMATE_LOCATION: false,
        LIVE_LOCATION: false,
        EMERGENCY_STATUS: false,
        JOURNEY_DETAILS: false
      },
      ELEVATED: {
        JOURNEY_STATUS: true,
        APPROXIMATE_LOCATION: false,
        LIVE_LOCATION: false,
        EMERGENCY_STATUS: true,
        JOURNEY_DETAILS: false
      },
      CRISIS: {
        JOURNEY_STATUS: true,
        APPROXIMATE_LOCATION: true,
        LIVE_LOCATION: true,
        EMERGENCY_STATUS: true,
        JOURNEY_DETAILS: false
      }
    },
    createdAt: new Date('2026-09-10T09:15:00Z').toISOString()
  },
  {
    id: 'tc-4',
    name: 'Rohan',
    relationship: 'Colleague',
    phone: '+91 99887 76655',
    email: 'rohan.demo@example.com',
    priority: 4,
    isActive: false,
    notificationPreference: 'SMS',
    permissions: createDefaultPermissions(),
    createdAt: new Date('2026-09-12T11:00:00Z').toISOString()
  }
];

/**
 * Validate input payload according to project rules
 */
const validateContactData = (data, isUpdate = false) => {
  const errors = [];

  if (!isUpdate || data.name !== undefined) {
    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
      errors.push('Name is required');
    }
  }

  if (!isUpdate || data.relationship !== undefined) {
    if (!data.relationship || !RELATIONSHIPS.includes(data.relationship)) {
      errors.push(`Relationship is required and must be one of: ${RELATIONSHIPS.join(', ')}`);
    }
  }

  if (!isUpdate || data.phone !== undefined) {
    if (!data.phone || typeof data.phone !== 'string' || !data.phone.trim()) {
      errors.push('Phone number is required');
    }
  }

  if (!isUpdate || data.priority !== undefined) {
    const p = Number(data.priority);
    if (!Number.isInteger(p) || p < 1) {
      errors.push('Priority must be a positive integer (e.g. 1, 2, 3)');
    }
  }

  if (data.notificationPreference !== undefined) {
    const normalized = NOTIFICATION_PREFERENCES.find(
      opt => opt.toLowerCase() === String(data.notificationPreference).toLowerCase()
    );
    if (!normalized) {
      errors.push(`Notification preference must be one of: ${NOTIFICATION_PREFERENCES.join(', ')}`);
    } else {
      data.notificationPreference = normalized;
    }
  }

  return errors;
};

// Validate permission matrix structure
const validatePermissionsObject = (permissions) => {
  if (!permissions || typeof permissions !== 'object') {
    return 'Permissions must be an object with states NORMAL, CAUTION, ELEVATED, CRISIS';
  }

  for (const state of SAFETY_STATES) {
    if (!permissions[state] || typeof permissions[state] !== 'object') {
      return `Missing or invalid configuration for state ${state}`;
    }
    for (const infoType of INFORMATION_TYPES) {
      if (permissions[state][infoType] !== undefined && typeof permissions[state][infoType] !== 'boolean') {
        return `Permission ${infoType} in state ${state} must be a boolean`;
      }
    }
  }

  return null;
};

// Repository CRUD Operations
const getAllContacts = async () => {
  return [...inMemoryContacts].sort((a, b) => a.priority - b.priority);
};

const getContactById = async (id) => {
  return inMemoryContacts.find(c => c.id === id) || null;
};

const createContact = async (data) => {
  const validationErrors = validateContactData(data);
  if (validationErrors.length > 0) {
    const error = new Error(validationErrors.join(', '));
    error.statusCode = 400;
    throw error;
  }

  const newContact = {
    id: `tc-${Date.now()}`,
    name: data.name.trim(),
    relationship: data.relationship,
    phone: data.phone.trim(),
    email: (data.email || '').trim().toLowerCase(),
    priority: Number(data.priority),
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    notificationPreference: data.notificationPreference || 'Push',
    permissions: data.permissions || createDefaultPermissions(),
    createdAt: new Date().toISOString()
  };

  inMemoryContacts.push(newContact);
  return newContact;
};

const updateContact = async (id, data) => {
  const contactIndex = inMemoryContacts.findIndex(c => c.id === id);
  if (contactIndex === -1) {
    const error = new Error('Contact not found');
    error.statusCode = 404;
    throw error;
  }

  const validationErrors = validateContactData(data, true);
  if (validationErrors.length > 0) {
    const error = new Error(validationErrors.join(', '));
    error.statusCode = 400;
    throw error;
  }

  const existing = inMemoryContacts[contactIndex];
  const updated = {
    ...existing,
    name: data.name !== undefined ? data.name.trim() : existing.name,
    relationship: data.relationship !== undefined ? data.relationship : existing.relationship,
    phone: data.phone !== undefined ? data.phone.trim() : existing.phone,
    email: data.email !== undefined ? data.email.trim().toLowerCase() : existing.email,
    priority: data.priority !== undefined ? Number(data.priority) : existing.priority,
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : existing.isActive,
    notificationPreference: data.notificationPreference !== undefined ? data.notificationPreference : existing.notificationPreference,
    permissions: data.permissions !== undefined ? data.permissions : existing.permissions,
    updatedAt: new Date().toISOString()
  };

  inMemoryContacts[contactIndex] = updated;
  return updated;
};

const toggleContactStatus = async (id, isActive) => {
  const contact = inMemoryContacts.find(c => c.id === id);
  if (!contact) {
    const error = new Error('Contact not found');
    error.statusCode = 404;
    throw error;
  }

  contact.isActive = isActive !== undefined ? Boolean(isActive) : !contact.isActive;
  contact.updatedAt = new Date().toISOString();
  return contact;
};

const deleteContact = async (id) => {
  const initialLength = inMemoryContacts.length;
  inMemoryContacts = inMemoryContacts.filter(c => c.id !== id);

  if (inMemoryContacts.length === initialLength) {
    const error = new Error('Contact not found');
    error.statusCode = 404;
    throw error;
  }

  return true;
};

// Permission Policy Operations
const getContactPermissions = async (id) => {
  const contact = inMemoryContacts.find(c => c.id === id);
  if (!contact) {
    const error = new Error('Contact not found');
    error.statusCode = 404;
    throw error;
  }

  // Ensure contact has complete permissions structure
  if (!contact.permissions) {
    contact.permissions = createDefaultPermissions();
  }

  return {
    contactId: contact.id,
    contactName: contact.name,
    relationship: contact.relationship,
    isActive: contact.isActive !== false,
    permissions: contact.permissions
  };
};

const updateContactPermissions = async (id, newPermissions) => {
  const contact = inMemoryContacts.find(c => c.id === id);
  if (!contact) {
    const error = new Error('Contact not found');
    error.statusCode = 404;
    throw error;
  }

  const permError = validatePermissionsObject(newPermissions);
  if (permError) {
    const error = new Error(permError);
    error.statusCode = 400;
    throw error;
  }

  // Deep clone to ensure full independence
  contact.permissions = JSON.parse(JSON.stringify(newPermissions));
  contact.updatedAt = new Date().toISOString();

  return {
    contactId: contact.id,
    contactName: contact.name,
    relationship: contact.relationship,
    isActive: contact.isActive !== false,
    permissions: contact.permissions
  };
};

const restoreDefaultPermissions = async (id) => {
  const contact = inMemoryContacts.find(c => c.id === id);
  if (!contact) {
    const error = new Error('Contact not found');
    error.statusCode = 404;
    throw error;
  }

  contact.permissions = createDefaultPermissions();
  contact.updatedAt = new Date().toISOString();

  return {
    contactId: contact.id,
    contactName: contact.name,
    relationship: contact.relationship,
    isActive: contact.isActive !== false,
    permissions: contact.permissions
  };
};

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  toggleContactStatus,
  deleteContact,
  getContactPermissions,
  updateContactPermissions,
  restoreDefaultPermissions,
  validateContactData,
  validatePermissionsObject
};
