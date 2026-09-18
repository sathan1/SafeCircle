const contactService = require('../services/contactService');
const permissionService = require('../services/permissionService');
const contactViewService = require('../services/contactViewService');
const { users } = require('../services/db');

// @desc    Get all trusted contacts
// @route   GET /api/contacts
const getContacts = async (req, res) => {
  try {
    const contacts = await contactService.getAllContacts(req.userId);
    res.status(200).json({
      success: true,
      data: contacts,
      count: contacts.length
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Server error fetching contacts'
    });
  }
};

// @desc    Get single contact by ID
// @route   GET /api/contacts/:id
const getContactById = async (req, res) => {
  try {
    const contact = await contactService.getContactById(req.params.id, req.userId);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }
    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Server error fetching contact'
    });
  }
};

// @desc    Create a new trusted contact
// @route   POST /api/contacts
const createContact = async (req, res) => {
  try {
    const newContact = await contactService.createContact(req.body, req.userId);
    res.status(201).json({
      success: true,
      data: newContact,
      message: 'Contact created successfully'
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Failed to create contact'
    });
  }
};

// @desc    Update a contact
// @route   PUT /api/contacts/:id
const updateContact = async (req, res) => {
  try {
    const updated = await contactService.updateContact(req.params.id, req.body, req.userId);
    res.status(200).json({
      success: true,
      data: updated,
      message: 'Contact updated successfully'
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Failed to update contact'
    });
  }
};

// @desc    Activate / deactivate a contact
// @route   PATCH /api/contacts/:id/status
const toggleContactStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const updated = await contactService.toggleContactStatus(req.params.id, isActive, req.userId);
    res.status(200).json({
      success: true,
      data: updated,
      message: `Contact marked as ${updated.isActive ? 'Active' : 'Inactive'}`
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Failed to update contact status'
    });
  }
};

// @desc    Delete a contact
// @route   DELETE /api/contacts/:id
const deleteContact = async (req, res) => {
  try {
    await contactService.deleteContact(req.params.id, req.userId);
    res.status(200).json({
      success: true,
      message: 'Contact removed successfully'
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Failed to remove contact'
    });
  }
};

// @desc    Get contact permission policy
// @route   GET /api/contacts/:id/permissions
const getContactPermissions = async (req, res) => {
  try {
    const policy = await contactService.getContactPermissions(req.params.id, req.userId);
    res.status(200).json({
      success: true,
      data: policy
    });
  } catch (err) {
    res.status(err.statusCode || 404).json({
      success: false,
      message: err.message || 'Failed to get contact permissions'
    });
  }
};

// @desc    Update contact permission policy
// @route   PUT /api/contacts/:id/permissions
const updateContactPermissions = async (req, res) => {
  try {
    const permissions = req.body.permissions || req.body;
    const updated = await contactService.updateContactPermissions(req.params.id, permissions, req.userId);
    res.status(200).json({
      success: true,
      data: updated,
      message: 'Privacy permissions updated successfully'
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Failed to update permissions'
    });
  }
};

// @desc    Restore recommended default permission policy for a contact
// @route   POST /api/contacts/:id/permissions/restore-default
const restoreDefaultPermissions = async (req, res) => {
  try {
    const restored = await contactService.restoreDefaultPermissions(req.params.id, req.userId);
    res.status(200).json({
      success: true,
      data: restored,
      message: 'Default permissions restored successfully'
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Failed to restore default permissions'
    });
  }
};

// @desc    Test backend authorization check
// @route   POST /api/contacts/:id/authorize
const checkAuthorization = async (req, res) => {
  try {
    const { safetyState, informationType } = req.body;
    const contact = await contactService.getContactById(req.params.id, req.userId);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    const isAuthorized = permissionService.canShareInformation(contact, safetyState, informationType);

    res.status(200).json({
      success: true,
      data: {
        contactId: contact.id,
        contactName: contact.name,
        isActive: contact.isActive !== false,
        safetyState: (safetyState || '').toUpperCase(),
        informationType: (informationType || '').toUpperCase(),
        isAuthorized,
        reason: !contact.isActive 
          ? 'Contact is marked as inactive in Safety Circle.' 
          : isAuthorized 
          ? 'Explicitly authorized by contact privacy policy.' 
          : 'Access denied by contact privacy policy.'
      }
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Failed to verify authorization'
    });
  }
};

// ==========================================
// Multi-Account Invitation Controllers
// ==========================================

// @desc    Invite a trusted contact (Person invites Mom or Dad)
// @route   POST /api/contacts/invite
const inviteContact = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const fromUser = await users.findById(req.userId);
    if (!fromUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const result = await contactService.inviteContact(req.body, fromUser);
    res.status(201).json({
      success: true,
      data: result,
      message: `Invitation sent to ${req.body.email}`
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Failed to send invitation'
    });
  }
};

// @desc    Get pending invitations for logged-in user
// @route   GET /api/contacts/invitations/pending
const getPendingInvitations = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const user = await users.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const pending = await contactService.getPendingInvitations(user.email);
    res.status(200).json({
      success: true,
      data: pending,
      count: pending.length
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch pending invitations'
    });
  }
};

// @desc    Accept or reject an invitation
// @route   POST /api/contacts/invitations/:id/respond
const respondToInvitation = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const user = await users.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let status = req.body.status;
    if (!status && req.body.accept !== undefined) {
      status = req.body.accept ? 'ACCEPTED' : 'REJECTED';
    }
    const result = await contactService.respondToInvitation(req.params.id, status || 'ACCEPTED', user);
    res.status(200).json({
      success: true,
      data: result,
      message: `Invitation ${result.status === 'ACCEPTED' ? 'accepted' : 'rejected'} successfully`
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({
      success: false,
      message: err.message || 'Failed to respond to invitation'
    });
  }
};

// @desc    Get all wards (people who have added current user to their circle)
// @route   GET /api/contacts/wards
const getWards = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const user = await users.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const wards = await contactService.getWardsForUser(user.email);
    res.status(200).json({
      success: true,
      data: wards,
      count: wards.length
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch wards'
    });
  }
};

// @desc    Get live journey view of a ward filtered by privacy policy
// @route   GET /api/contacts/wards/:journeyId/view
const getWardJourneyView = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const user = await users.findById(req.userId);
    const { journeyId } = req.params;
    const { contactId } = req.query;

    if (!contactId) {
      return res.status(400).json({ success: false, message: 'contactId parameter is required' });
    }

    const view = await contactViewService.getContactViewForJourney(journeyId, contactId);
    res.status(200).json({
      success: true,
      data: view
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch ward journey view'
    });
  }
};

module.exports = {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  toggleContactStatus,
  deleteContact,
  getContactPermissions,
  updateContactPermissions,
  restoreDefaultPermissions,
  checkAuthorization,
  inviteContact,
  getPendingInvitations,
  respondToInvitation,
  getWards,
  getWardJourneyView
};
