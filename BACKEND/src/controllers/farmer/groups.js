// src/controllers/farmer/groups.js
const { pool } = require('../../config/database');
const logger = require('../../utils/logger');
const responses = require('../../utils/responses');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all groups the user is a member of
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserGroups = async (req, res) => {
  const userId = req.user.user_id;
  
  try {
    const result = await pool.query(
      `SELECT g.*, gm.is_admin, 
        (SELECT COUNT(*) FROM group_members WHERE group_id = g.group_id) as member_count
       FROM groups g
       JOIN group_members gm ON g.group_id = gm.group_id
       WHERE gm.user_id = $1 AND g.is_active = true
       ORDER BY g.created_at DESC`,
      [userId]
    );
    
    return responses.success(res, { groups: result.rows });
  } catch (error) {
    logger.error('Error fetching user groups:', error);
    return responses.serverError(res, 'Failed to fetch user groups');
  }
};

/**
 * Create a new group
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createGroup = async (req, res) => {
  const userId = req.user.user_id;
  const { name, description, crop_focus, is_public = true, location = null } = req.body;
  
  try {
    // Generate a random invite code
    const inviteCode = uuidv4().substring(0, 8);
    
    // Start a transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create the group
      const groupResult = await client.query(
        `INSERT INTO groups 
          (name, description, crop_focus, is_public, invite_code, location, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [name, description, crop_focus, is_public, inviteCode, location, userId]
      );
      
      const group = groupResult.rows[0];
      
      // Add creator as admin member
      await client.query(
        `INSERT INTO group_members 
          (group_id, user_id, is_admin, joined_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
        [group.group_id, userId, true]
      );
      
      await client.query('COMMIT');
      
      return responses.created(res, { 
        message: 'Group created successfully',
        group: group
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Error creating group:', error);
    return responses.serverError(res, 'Failed to create group');
  }
};

/**
 * Get group details by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getGroupById = async (req, res) => {
  const userId = req.user.user_id;
  const { id } = req.params;
  
  try {
    // Check if user is a member
    const memberCheck = await pool.query(
      'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (memberCheck.rows.length === 0) {
      // Check if the group is public
      const publicCheck = await pool.query(
        'SELECT is_public FROM groups WHERE group_id = $1 AND is_active = true',
        [id]
      );
      
      if (publicCheck.rows.length === 0) {
        return responses.notFound(res, 'Group not found');
      }
      
      if (!publicCheck.rows[0].is_public) {
        return responses.forbidden(res, 'You are not a member of this private group');
      }
    }
    
    // Get group details
    const groupResult = await pool.query(
      `SELECT g.*, 
        (SELECT COUNT(*) FROM group_members WHERE group_id = g.group_id) as member_count,
        EXISTS(SELECT 1 FROM group_members WHERE group_id = g.group_id AND user_id = $2 AND is_admin = true) as is_admin
       FROM groups g
       WHERE g.group_id = $1 AND g.is_active = true`,
      [id, userId]
    );
    
    if (groupResult.rows.length === 0) {
      return responses.notFound(res, 'Group not found');
    }
    
    const group = groupResult.rows[0];
    
    // Get recent messages
    const messagesResult = await pool.query(
      `SELECT m.*, u.username, u.profile_image
       FROM messages m
       JOIN users u ON m.user_id = u.user_id
       WHERE m.group_id = $1 AND m.is_deleted = false
       ORDER BY m.created_at DESC
       LIMIT 10`,
      [id]
    );
    
    group.recent_messages = messagesResult.rows.reverse();
    
    return responses.success(res, { group });
  } catch (error) {
    logger.error('Error fetching group:', error);
    return responses.serverError(res, 'Failed to fetch group details');
  }
};

/**
 * Update group details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateGroup = async (req, res) => {
  const userId = req.user.user_id;
  const { id } = req.params;
  const { name, description, crop_focus, is_public, location } = req.body;
  
  try {
    // Check if user is an admin
    const adminCheck = await pool.query(
      'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2 AND is_admin = true',
      [id, userId]
    );
    
    if (adminCheck.rows.length === 0) {
      return responses.forbidden(res, 'Only group admins can update group details');
    }
    
    // Build update query based on provided fields
    const updates = [];
    const values = [];
    let paramCounter = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramCounter++}`);
      values.push(name);
    }
    
    if (description !== undefined) {
      updates.push(`description = $${paramCounter++}`);
      values.push(description);
    }
    
    if (crop_focus !== undefined) {
      updates.push(`crop_focus = $${paramCounter++}`);
      values.push(crop_focus);
    }
    
    if (is_public !== undefined) {
      updates.push(`is_public = $${paramCounter++}`);
      values.push(is_public);
    }
    
    if (location !== undefined) {
      updates.push(`location = $${paramCounter++}`);
      values.push(location);
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    if (updates.length === 1) {
      return responses.success(res, { message: 'No changes to update' });
    }
    
    // Execute update
    const result = await pool.query(
      `UPDATE groups 
       SET ${updates.join(', ')} 
       WHERE group_id = $${paramCounter}
       RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return responses.notFound(res, 'Group not found');
    }
    
    return responses.success(res, { 
      message: 'Group updated successfully',
      group: result.rows[0]
    });
  } catch (error) {
    logger.error('Error updating group:', error);
    return responses.serverError(res, 'Failed to update group');
  }
};

/**
 * Add a member to a group
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addGroupMember = async (req, res) => {
  const adminId = req.user.user_id;
  const { id } = req.params;
  const { user_id, is_admin = false } = req.body;
  
  try {
    // Check if current user is an admin
    const adminCheck = await pool.query(
      'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2 AND is_admin = true',
      [id, adminId]
    );
    
    if (adminCheck.rows.length === 0) {
      return responses.forbidden(res, 'Only group admins can add members');
    }
    
    // Check if user exists
    const userCheck = await pool.query(
      'SELECT user_id, username FROM users WHERE user_id = $1 AND is_active = true',
      [user_id]
    );
    
    if (userCheck.rows.length === 0) {
      return responses.notFound(res, 'User not found');
    }
    
    // Check if user is already a member
    const memberCheck = await pool.query(
      'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2',
      [id, user_id]
    );
    
    if (memberCheck.rows.length > 0) {
      return responses.badRequest(res, 'User is already a member of this group');
    }
    
    // Add user to group
    await pool.query(
      `INSERT INTO group_members 
        (group_id, user_id, is_admin, joined_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
      [id, user_id, is_admin]
    );
    
    // Get group details
    const groupResult = await pool.query(
      'SELECT name FROM groups WHERE group_id = $1',
      [id]
    );
    
    // Send notification to the added user
    const notificationService = require('../../services/notifications/notificationService');
    await notificationService.sendGroupInvitationNotification(
      user_id,
      id,
      groupResult.rows[0].name,
      adminId,
      req.user.username
    );
    
    return responses.success(res, { 
      message: 'Member added successfully',
      username: userCheck.rows[0].username
    });
  } catch (error) {
    logger.error('Error adding group member:', error);
    return responses.serverError(res, 'Failed to add member to group');
  }
};

/**
 * Remove a member from a group
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const removeGroupMember = async (req, res) => {
  const currentUserId = req.user.user_id;
  const { id, userId } = req.params;
  
  try {
    // Check if current user is an admin (only if not removing self)
    if (currentUserId !== parseInt(userId)) {
      const adminCheck = await pool.query(
        'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2 AND is_admin = true',
        [id, currentUserId]
      );
      
      if (adminCheck.rows.length === 0) {
        return responses.forbidden(res, 'Only group admins can remove members');
      }
    }
    
    // Check if user to remove is an admin
    const targetAdminCheck = await pool.query(
      'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2 AND is_admin = true',
      [id, userId]
    );
    
    // Prevent non-admins from removing admins
    if (targetAdminCheck.rows.length > 0 && 
        currentUserId !== parseInt(userId) &&
        !(await isGroupCreator(id, currentUserId))) {
      return responses.forbidden(res, 'Only the group creator can remove admin members');
    }
    
    // Remove the member
    const result = await pool.query(
      'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return responses.notFound(res, 'Member not found in this group');
    }
    
    // If last member, deactivate group
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM group_members WHERE group_id = $1',
      [id]
    );
    
    if (parseInt(countResult.rows[0].count) === 0) {
      await pool.query(
        'UPDATE groups SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE group_id = $1',
        [id]
      );
    }
    
    return responses.success(res, { 
      message: 'Member removed successfully'
    });
  } catch (error) {
    logger.error('Error removing group member:', error);
    return responses.serverError(res, 'Failed to remove member from group');
  }
};

/**
 * Get all members of a group
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getGroupMembers = async (req, res) => {
  const userId = req.user.user_id;
  const { id } = req.params;
  
  try {
    // Check if user is a member
    const memberCheck = await pool.query(
      'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (memberCheck.rows.length === 0) {
      // Check if group is public
      const publicCheck = await pool.query(
        'SELECT is_public FROM groups WHERE group_id = $1 AND is_active = true',
        [id]
      );
      
      if (publicCheck.rows.length === 0) {
        return responses.notFound(res, 'Group not found');
      }
      
      if (!publicCheck.rows[0].is_public) {
        return responses.forbidden(res, 'You are not a member of this private group');
      }
    }
    
    // Get members
    const result = await pool.query(
      `SELECT gm.*, u.username, u.full_name, u.profile_image, u.location, u.expertise
       FROM group_members gm
       JOIN users u ON gm.user_id = u.user_id
       WHERE gm.group_id = $1
       ORDER BY gm.is_admin DESC, gm.joined_at ASC`,
      [id]
    );
    
    return responses.success(res, { members: result.rows });
  } catch (error) {
    logger.error('Error fetching group members:', error);
    return responses.serverError(res, 'Failed to fetch group members');
  }
};

/**
 * Join a group using an invite code
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const joinGroup = async (req, res) => {
  const userId = req.user.user_id;
  const { inviteCode } = req.params;
  
  try {
    // Find the group by invite code
    const groupResult = await pool.query(
      'SELECT * FROM groups WHERE invite_code = $1 AND is_active = true',
      [inviteCode]
    );
    
    if (groupResult.rows.length === 0) {
      return responses.notFound(res, 'Invalid invite code or group not found');
    }
    
    const group = groupResult.rows[0];
    
    // Check if user is already a member
    const memberCheck = await pool.query(
      'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2',
      [group.group_id, userId]
    );
    
    if (memberCheck.rows.length > 0) {
      return responses.badRequest(res, 'You are already a member of this group');
    }
    
    // Add user to group
    await pool.query(
      `INSERT INTO group_members 
        (group_id, user_id, is_admin, joined_at)
       VALUES ($1, $2, false, CURRENT_TIMESTAMP)`,
      [group.group_id, userId]
    );
    
    return responses.success(res, { 
      message: `You have joined ${group.name}`,
      group: group
    });
  } catch (error) {
    logger.error('Error joining group:', error);
    return responses.serverError(res, 'Failed to join group');
  }
};

/**
 * Leave a group
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const leaveGroup = async (req, res) => {
  const userId = req.user.user_id;
  const { id } = req.params;
  
  try {
    // Check if user is a member
    const memberCheck = await pool.query(
      'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (memberCheck.rows.length === 0) {
      return responses.badRequest(res, 'You are not a member of this group');
    }
    
    // Check if user is the creator/last admin
    if (await isGroupCreator(id, userId)) {
      // Count admins
      const adminCountResult = await pool.query(
        'SELECT COUNT(*) FROM group_members WHERE group_id = $1 AND is_admin = true',
        [id]
      );
      
      if (parseInt(adminCountResult.rows[0].count) === 1) {
        // Check if there are other members who could be promoted
        const memberCountResult = await pool.query(
          'SELECT COUNT(*) FROM group_members WHERE group_id = $1 AND is_admin = false',
          [id]
        );
        
        if (parseInt(memberCountResult.rows[0].count) > 0) {
          return responses.badRequest(res, 'As the last admin, you must promote another member to admin before leaving');
        }
      }
    }
    
    // Remove the member
    await pool.query(
      'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2',
      [id, userId]
    );
    
    // If last member, deactivate group
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM group_members WHERE group_id = $1',
      [id]
    );
    
    if (parseInt(countResult.rows[0].count) === 0) {
      await pool.query(
        'UPDATE groups SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE group_id = $1',
        [id]
      );
    }
    
    return responses.success(res, { 
      message: 'You have left the group'
    });
  } catch (error) {
    logger.error('Error leaving group:', error);
    return responses.serverError(res, 'Failed to leave group');
  }
};

// Helper function to check if a user is the creator of a group
async function isGroupCreator(groupId, userId) {
  try {
    const result = await pool.query(
      'SELECT created_by FROM groups WHERE group_id = $1',
      [groupId]
    );
    
    if (result.rows.length === 0) {
      return false;
    }
    
    return result.rows[0].created_by === userId;
  } catch (error) {
    logger.error('Error checking group creator:', error);
    return false;
  }
}

module.exports = {
  getUserGroups,
  createGroup,
  getGroupById,
  updateGroup,
  addGroupMember,
  removeGroupMember,
  getGroupMembers,
  joinGroup,
  leaveGroup
};
