// src/routes/farmer/groups.js
const express = require('express');
const router = express.Router();
const groupsController = require('../../controllers/farmer/groups');
const { authenticate } = require('../../middleware/auth');

/**
 * @route GET /api/groups
 * @desc Get all groups the user is a member of
 * @access Private
 */
router.get('/', authenticate, groupsController.getUserGroups);

/**
 * @route POST /api/groups
 * @desc Create a new group
 * @access Private
 */
router.post('/', authenticate, groupsController.createGroup);

/**
 * @route GET /api/groups/:id
 * @desc Get group details by ID
 * @access Private
 */
router.get('/:id', authenticate, groupsController.getGroupById);

/**
 * @route PUT /api/groups/:id
 * @desc Update group details
 * @access Private
 */
router.put('/:id', authenticate, groupsController.updateGroup);

/**
 * @route POST /api/groups/:id/members
 * @desc Add a member to a group
 * @access Private
 */
router.post('/:id/members', authenticate, groupsController.addGroupMember);

/**
 * @route DELETE /api/groups/:id/members/:userId
 * @desc Remove a member from a group
 * @access Private
 */
router.delete('/:id/members/:userId', authenticate, groupsController.removeGroupMember);

/**
 * @route GET /api/groups/:id/members
 * @desc Get all members of a group
 * @access Private
 */
router.get('/:id/members', authenticate, groupsController.getGroupMembers);

/**
 * @route POST /api/groups/join/:inviteCode
 * @desc Join a group using an invite code
 * @access Private
 */
router.post('/join/:inviteCode', authenticate, groupsController.joinGroup);

/**
 * @route POST /api/groups/:id/leave
 * @desc Leave a group
 * @access Private
 */
router.post('/:id/leave', authenticate, groupsController.leaveGroup);

module.exports = router;
