const { body, param, query } = require('express-validator');

const validateCreateGroup = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Group name is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Group name must be between 3 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('cropFocus')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Crop focus cannot exceed 100 characters'),
  body('maxMembers')
    .optional()
    .isInt({ min: 2, max: 1000 })
    .withMessage('Max members must be between 2 and 1000')
];

const validateUpdateGroup = [
  param('groupId')
    .isInt()
    .withMessage('Invalid group ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Group name must be between 3 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('cropFocus')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Crop focus cannot exceed 100 characters'),
  body('maxMembers')
    .optional()
    .isInt({ min: 2, max: 1000 })
    .withMessage('Max members must be between 2 and 1000')
];

const validateGroupId = [
  param('groupId')
    .isInt()
    .withMessage('Invalid group ID')
];

const validateAddMember = [
  param('groupId')
    .isInt()
    .withMessage('Invalid group ID'),
  body('userId')
    .isInt()
    .withMessage('Invalid user ID'),
  body('isAdmin')
    .optional()
    .isBoolean()
    .withMessage('isAdmin must be a boolean')
];

const validateRemoveMember = [
  param('groupId')
    .isInt()
    .withMessage('Invalid group ID'),
  param('userId')
    .isInt()
    .withMessage('Invalid user ID')
];

const validateSearchGroups = [
  query('name')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Search name cannot exceed 50 characters'),
  query('cropFocus')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Crop focus cannot exceed 100 characters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer')
];

const validateSendInvitation = [
  param('groupId')
    .isInt()
    .withMessage('Invalid group ID'),
  body()
    .custom((value, { req }) => {
      // Either userId or email must be provided
      if (!value.userId && !value.email) {
        throw new Error('Either userId or email must be provided');
      }
      return true;
    }),
  body('userId')
    .optional()
    .isInt()
    .withMessage('Invalid user ID'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail()
];

const validateInvitationId = [
  param('invitationId')
    .isInt()
    .withMessage('Invalid invitation ID')
];

const validateInvitationToken = [
  param('token')
    .isLength({ min: 32 })
    .withMessage('Invalid invitation token')
];

module.exports = {
  validateCreateGroup,
  validateUpdateGroup,
  validateGroupId,
  validateAddMember,
  validateRemoveMember,
  validateSearchGroups,
  validateSendInvitation,
  validateInvitationId,
  validateInvitationToken
};