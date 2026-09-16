const express = require('express');
const contactController = require('../controllers/contactController');

const router = express.Router();

// GET all contacts / POST new contact
router.route('/')
  .get(contactController.getContacts)
  .post(contactController.createContact);

// PATCH status (active/inactive)
router.route('/:id/status')
  .patch(contactController.toggleContactStatus);

// Contact Permissions endpoints
router.route('/:id/permissions')
  .get(contactController.getContactPermissions)
  .put(contactController.updateContactPermissions)
  .patch(contactController.updateContactPermissions);

router.route('/:id/permissions/restore-default')
  .post(contactController.restoreDefaultPermissions);

// Backend Authorization verification endpoint
router.route('/:id/authorize')
  .post(contactController.checkAuthorization);

// GET single contact / PUT update / DELETE contact
router.route('/:id')
  .get(contactController.getContactById)
  .put(contactController.updateContact)
  .delete(contactController.deleteContact);

module.exports = router;
