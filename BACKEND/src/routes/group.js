/**
 * Group routes
 * Handles all group-related endpoints
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const GroupController = require('../controllers/groupController');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// Validation middleware for creating a group
const validateCreateGroup = [
  body('name')
    .isString()
    .notEmpty()
    .withMessage('Group name is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Group name must be between 3 and 50 characters'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
];

/**
 * @route POST /api/groups
 * @description Create a new group
 * @access Private
 */
router.post('/', 
  auth, 
  validateCreateGroup, 
  validate, 
  GroupController.create
);

/**
 * @route GET /api/groups
 * @description Get all groups for the logged-in user
 * @access Private
 */
router.get('/',
  auth,
  GroupController.getUserGroups
);

/**
 * @route GET /api/groups/search
 * @description Search for groups
 * @access Private
 */
router.get('/search',
  auth,
  GroupController.search
);

/**
 * @route GET /api/groups/popular
 * @description Get popular groups
 * @access Private
 */
router.get('/popular',
  auth,
  GroupController.getPopular
);

/**
 * @route GET /api/groups/:groupId
 * @description Get a specific group by ID
 * @access Private
 */
router.get('/:groupId',
  auth,
  GroupController.getById
);

/**
 * @route POST /api/groups/:groupId/join
 * @description Join a group
 * @access Private
 */
router.post('/:groupId/join',
  auth,
  GroupController.join
);

/**
 * @route DELETE /api/groups/:groupId/leave
 * @description Leave a group
 * @access Private
 */
router.delete('/:groupId/leave',
  auth,
  GroupController.leave
);

/**
 * @route GET /api/groups/:groupId/members
 * @description Get members of a group
 * @access Private
 */
router.get('/:groupId/members',
  auth,
  GroupController.getMembers
);

/**
 * @route POST /api/groups/:groupId/admins
 * @description Make a user an admin
 * @access Private (Admin only)
 */
router.post('/:groupId/admins',
  auth,
  body('userId').isInt().withMessage('User ID must be an integer'),
  validate,
  GroupController.makeAdmin
);

/**
 * @route DELETE /api/groups/:groupId/admins
 * @description Remove admin role from a user
 * @access Private (Admin only)
 */
router.delete('/:groupId/admins',
  auth,
  body('userId').isInt().withMessage('User ID must be an integer'),
  validate,
  GroupController.removeAdmin
);

module.exports = router;