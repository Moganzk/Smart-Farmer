const express = require('express');
const router = express.Router();
const GroupController = require('../controllers/groups/group.controller');
const InvitationController = require('../controllers/groups/invitation.controller');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  validateCreateGroup,
  validateUpdateGroup,
  validateGroupId,
  validateAddMember,
  validateRemoveMember,
  validateSearchGroups,
  validateSendInvitation,
  validateInvitationId,
  validateInvitationToken
} = require('../middleware/validate/group.validate');

// Public invitation route (no auth required)
router.get('/invitations/token/:token', validateInvitationToken, validate, InvitationController.getInvitationByToken);

// Apply auth middleware to all routes except public endpoints
router.use(auth);

// Group management routes
router.post('/', validateCreateGroup, validate, GroupController.create);
router.get('/:groupId', validateGroupId, validate, GroupController.getGroup);
router.put('/:groupId', validateUpdateGroup, validate, GroupController.updateGroup);
router.delete('/:groupId', validateGroupId, validate, GroupController.deleteGroup);

// Member management routes
router.post('/:groupId/members', validateAddMember, validate, GroupController.addMember);
router.delete('/:groupId/members/:userId', validateRemoveMember, validate, GroupController.removeMember);

// Join/Leave routes
router.post('/:groupId/join', validateGroupId, validate, GroupController.joinGroup);
router.post('/:groupId/leave', validateGroupId, validate, GroupController.leaveGroup);

// Search and list routes
router.get('/', validateSearchGroups, validate, GroupController.searchGroups);
router.get('/user/groups', validateSearchGroups, validate, GroupController.getUserGroups);

// Invitation routes
router.post('/:groupId/invitations', validateSendInvitation, validate, InvitationController.sendInvitation);
router.get('/:groupId/invitations', validateGroupId, validate, InvitationController.listPendingInvitations);
router.get('/invitations/pending', InvitationController.getUserInvitations);
router.post('/invitations/:invitationId/accept', validateInvitationId, validate, InvitationController.acceptInvitation);
router.post('/invitations/:invitationId/decline', validateInvitationId, validate, InvitationController.declineInvitation);
router.delete('/invitations/:invitationId', validateInvitationId, validate, InvitationController.cancelInvitation);

// Apply auth middleware to all routes except public endpoints
router.use((req, res, next) => {
  // Skip auth for public token route
  if (req.path.startsWith('/invitations/token/')) {
    return next();
  }
  return auth(req, res, next);
});

// Message routes
const messageRoutes = require('./messages');
router.use('/:groupId/messages', messageRoutes);

module.exports = router;