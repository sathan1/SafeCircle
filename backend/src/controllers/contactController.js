const contactService = require('../services/contactService');
const permissionService = require('../services/permissionService');

// @desc    Get all trusted contacts
// @route   GET /api/contacts
const getContacts = async (req, res) => {
  try {
    const contacts = await contactService.getAllContacts();
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
    const contact = await contactService.getContactById(req.params.id);
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
    const newContact = await contactService.createContact(req.body);
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
    const updated = await contactService.updateContact(req.params.id, req.body);
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
    const updated = await contactService.toggleContactStatus(req.params.id, isActive);
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
    await contactService.deleteContact(req.params.id);
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
    const policy = await contactService.getContactPermissions(req.params.id);
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
    const updated = await contactService.updateContactPermissions(req.params.id, permissions);
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
    const restored = await contactService.restoreDefaultPermissions(req.params.id);
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
    const contact = await contactService.getContactById(req.params.id);

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
  checkAuthorization
};
