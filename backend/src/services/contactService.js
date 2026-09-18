const { 
  RELATIONSHIPS, 
  NOTIFICATION_PREFERENCES,
  SAFETY_STATES,
  INFORMATION_TYPES,
  DEFAULT_PERMISSIONS,
  createDefaultPermissions 
} = require('../models/TrustedContact');
const { contacts, invitations, users, journeys } = require('./db');
const socketService = require('./socketService');

// Seed contacts for default/demo test suites
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
    if (data.relationship) {
      const relStr = String(data.relationship).toLowerCase().trim();
      if (['mother', 'father', 'mom', 'dad', 'parent'].includes(relStr)) {
        data.relationship = 'Parent';
      } else if (['brother', 'sister', 'sibling'].includes(relStr)) {
        data.relationship = 'Sibling';
      } else if (['friend'].includes(relStr)) {
        data.relationship = 'Friend';
      } else if (['partner', 'spouse', 'husband', 'wife'].includes(relStr)) {
        data.relationship = 'Partner';
      } else if (['guardian'].includes(relStr)) {
        data.relationship = 'Guardian';
      }
    }
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
const getAllContacts = async (userId = null) => {
  if (userId) {
    const userContacts = await contacts.find({ userId });
    return userContacts.sort((a, b) => (a.priority || 1) - (b.priority || 1));
  }
  return [...inMemoryContacts].sort((a, b) => a.priority - b.priority);
};

const getContactById = async (id, userId = null) => {
  // Check user contacts in DB first
  const dbContact = await contacts.findById(id);
  if (dbContact) {
    if (userId && dbContact.userId && dbContact.userId !== userId) {
      return null;
    }
    return dbContact;
  }
  return inMemoryContacts.find(c => c.id === id) || null;
};

const createContact = async (data, userId = null) => {
  const validationErrors = validateContactData(data);
  if (validationErrors.length > 0) {
    const error = new Error(validationErrors.join(', '));
    error.statusCode = 400;
    throw error;
  }

  const newContact = {
    id: `tc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: userId || 'demo-user-1',
    name: data.name.trim(),
    relationship: data.relationship,
    phone: data.phone.trim(),
    email: (data.email || '').trim().toLowerCase(),
    priority: Number(data.priority) || 1,
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    notificationPreference: data.notificationPreference || 'Push',
    permissions: data.permissions || createDefaultPermissions(),
    createdAt: new Date().toISOString()
  };

  if (userId) {
    await contacts.insert(newContact);
  } else {
    inMemoryContacts.push(newContact);
    await contacts.insert(newContact);
  }

  return newContact;
};

const updateContact = async (id, data, userId = null) => {
  const existing = await getContactById(id, userId);
  if (!existing) {
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

  const updates = {
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

  // Update in DB
  const dbContact = await contacts.findById(id);
  if (dbContact) {
    await contacts.update(id, updates);
  }

  // Update in inMemory array for backward compat
  const memIndex = inMemoryContacts.findIndex(c => c.id === id);
  if (memIndex !== -1) {
    inMemoryContacts[memIndex] = { ...inMemoryContacts[memIndex], ...updates };
  }

  return { ...existing, ...updates };
};

const toggleContactStatus = async (id, isActive, userId = null) => {
  const contact = await getContactById(id, userId);
  if (!contact) {
    const error = new Error('Contact not found');
    error.statusCode = 404;
    throw error;
  }

  const newStatus = isActive !== undefined ? Boolean(isActive) : !contact.isActive;
  await updateContact(id, { isActive: newStatus }, userId);
  contact.isActive = newStatus;
  return contact;
};

const deleteContact = async (id, userId = null) => {
  const existing = await getContactById(id, userId);
  if (!existing) {
    const error = new Error('Contact not found');
    error.statusCode = 404;
    throw error;
  }

  await contacts.remove(id);
  inMemoryContacts = inMemoryContacts.filter(c => c.id !== id);
  return true;
};

// Permission Policy Operations
const getContactPermissions = async (id, userId = null) => {
  const contact = await getContactById(id, userId);
  if (!contact) {
    const error = new Error('Contact not found');
    error.statusCode = 404;
    throw error;
  }

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

const updateContactPermissions = async (id, newPermissions, userId = null) => {
  const contact = await getContactById(id, userId);
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

  const permissionsClone = JSON.parse(JSON.stringify(newPermissions));
  await updateContact(id, { permissions: permissionsClone }, userId);

  return {
    contactId: contact.id,
    contactName: contact.name,
    relationship: contact.relationship,
    isActive: contact.isActive !== false,
    permissions: permissionsClone
  };
};

const restoreDefaultPermissions = async (id, userId = null) => {
  const contact = await getContactById(id, userId);
  if (!contact) {
    const error = new Error('Contact not found');
    error.statusCode = 404;
    throw error;
  }

  const defaults = createDefaultPermissions();
  await updateContact(id, { permissions: defaults }, userId);

  return {
    contactId: contact.id,
    contactName: contact.name,
    relationship: contact.relationship,
    isActive: contact.isActive !== false,
    permissions: defaults
  };
};

// ==========================================
// Multi-Account Invitation & Ward Subsystem
// ==========================================

/**
 * Person invites a trusted contact (e.g. Mom or Dad) by email
 */
const inviteContact = async (invitationData, fromUser) => {
  const { name, email, relationship, phone, priority, permissions } = invitationData;
  if (!email || !email.includes('@')) {
    const err = new Error('A valid contact email is required');
    err.statusCode = 400;
    throw err;
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Create or update contact record for fromUser
  const existingContact = await contacts.findOne(c => c.userId === fromUser.id && c.email === normalizedEmail);
  let contactRecord;

  if (existingContact) {
    contactRecord = await updateContact(existingContact.id, {
      name: name || existingContact.name,
      relationship: relationship || existingContact.relationship,
      phone: phone || existingContact.phone,
      priority: priority || existingContact.priority,
      permissions: permissions || existingContact.permissions,
      isActive: true
    }, fromUser.id);
  } else {
    contactRecord = await createContact({
      name: name || normalizedEmail.split('@')[0],
      relationship: relationship || 'Family',
      phone: phone || '+1 000-000-0000',
      email: normalizedEmail,
      priority: priority || 1,
      isActive: true,
      permissions: permissions || createDefaultPermissions()
    }, fromUser.id);
  }

  // Create Invitation record
  const invitation = await invitations.insert({
    fromUserId: fromUser.id,
    fromUserName: fromUser.name,
    fromUserEmail: fromUser.email,
    toEmail: normalizedEmail,
    toName: name || '',
    relationship: relationship || 'Family',
    contactId: contactRecord.id,
    status: 'PENDING',
    permissions: contactRecord.permissions,
    createdAt: new Date().toISOString()
  });

  // Check if invited user already has an account
  const targetUser = await users.findOne({ email: normalizedEmail });
  if (targetUser) {
    // Notify via WebSocket if active
    socketService.sendToUser(targetUser.id, 'INVITATION_RECEIVED', {
      invitationId: invitation.id,
      fromUserName: fromUser.name,
      fromUserEmail: fromUser.email,
      relationship: relationship || 'Family'
    });
  }

  return { contact: contactRecord, invitation };
};

/**
 * Retrieves all pending invitations for a user by email
 */
const getPendingInvitations = async (userEmail) => {
  const normalized = (userEmail || '').toLowerCase().trim();
  return await invitations.find(inv => inv.toEmail === normalized && inv.status === 'PENDING');
};

/**
 * Accept or decline an invitation
 */
const respondToInvitation = async (invitationId, status, user) => {
  const inv = await invitations.findById(invitationId);
  if (!inv) {
    const err = new Error('Invitation not found');
    err.statusCode = 404;
    throw err;
  }

  if (inv.toEmail !== user.email.toLowerCase().trim()) {
    const err = new Error('Unauthorized to respond to this invitation');
    err.statusCode = 403;
    throw err;
  }

  const updatedInv = await invitations.update(invitationId, {
    status: status === 'ACCEPTED' ? 'ACCEPTED' : 'REJECTED',
    toUserId: user.id
  });

  // Notify the inviter (Person)
  socketService.sendToUser(inv.fromUserId, 'INVITATION_RESPONDED', {
    invitationId,
    responderName: user.name,
    responderEmail: user.email,
    status: updatedInv.status
  });

  return updatedInv;
};

/**
 * Retrieves all "Wards" (people who have invited the current user, and invitation was accepted)
 */
const getWardsForUser = async (userEmail) => {
  const normalized = (userEmail || '').toLowerCase().trim();
  const acceptedInvs = await invitations.find(inv => inv.toEmail === normalized && inv.status === 'ACCEPTED');

  const wards = [];
  for (const inv of acceptedInvs) {
    const wardUser = await users.findById(inv.fromUserId);
    if (wardUser) {
      // Find active journey of the ward
      const activeJourney = await journeys.findOne(j => j.userId === wardUser.id && j.status === 'ACTIVE');
      const contact = await contacts.findById(inv.contactId);

      wards.push({
        invitationId: inv.id,
        wardId: wardUser.id,
        wardName: wardUser.name,
        wardEmail: wardUser.email,
        relationship: inv.relationship,
        contactId: inv.contactId,
        permissions: contact ? contact.permissions : inv.permissions,
        activeJourney: activeJourney || null
      });
    }
  }

  return wards;
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
  validatePermissionsObject,
  inviteContact,
  getPendingInvitations,
  respondToInvitation,
  getWardsForUser
};
