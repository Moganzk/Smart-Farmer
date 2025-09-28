const db = require('../config/database');
const logger = require('../utils/logger');
const crypto = require('crypto');

class Group {
  static async create({ name, description, createdBy, cropFocus, maxMembers }) {
    try {
      const result = await db.query(
        `INSERT INTO groups (
          name, 
          description, 
          created_by, 
          crop_focus,
          max_members
        ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [name, description, createdBy, cropFocus, maxMembers || 100]
      );

      // Add creator as a group admin
      await db.query(
        `INSERT INTO group_members (group_id, user_id, is_admin)
         VALUES ($1, $2, true)`,
        [result.rows[0].group_id, createdBy]
      );

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating group:', error);
      throw error;
    }
  }

  static async findById(groupId) {
    try {
      const result = await db.query(
        `SELECT g.*, 
                COUNT(DISTINCT gm.user_id) as member_count,
                COUNT(DISTINCT m.message_id) as message_count
         FROM groups g
         LEFT JOIN group_members gm ON g.group_id = gm.group_id
         LEFT JOIN messages m ON g.group_id = m.group_id
         WHERE g.group_id = $1 AND g.is_active = true
         GROUP BY g.group_id`,
        [groupId]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error finding group:', error);
      throw error;
    }
  }

  static async update(groupId, { name, description, cropFocus, maxMembers }) {
    try {
      const result = await db.query(
        `UPDATE groups 
         SET name = COALESCE($1, name),
             description = COALESCE($2, description),
             crop_focus = COALESCE($3, crop_focus),
             max_members = COALESCE($4, max_members)
         WHERE group_id = $5 AND is_active = true
         RETURNING *`,
        [name, description, cropFocus, maxMembers, groupId]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating group:', error);
      throw error;
    }
  }

  static async delete(groupId) {
    try {
      const result = await db.query(
        `UPDATE groups 
         SET is_active = false 
         WHERE group_id = $1 
         RETURNING *`,
        [groupId]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error deleting group:', error);
      throw error;
    }
  }

  static async listMembers(groupId) {
    try {
      const result = await db.query(
        `SELECT u.user_id, u.username, u.full_name, u.location,
                gm.joined_at, gm.is_admin
         FROM group_members gm
         JOIN users u ON gm.user_id = u.user_id
         WHERE gm.group_id = $1
         ORDER BY gm.is_admin DESC, gm.joined_at ASC`,
        [groupId]
      );
      return result.rows;
    } catch (error) {
      logger.error('Error listing group members:', error);
      throw error;
    }
  }

  static async addMember(groupId, userId, isAdmin = false) {
    try {
      // Check if group has space
      const group = await this.findById(groupId);
      const currentMembers = parseInt(group.member_count);
      
      if (currentMembers >= group.max_members) {
        throw new Error('Group has reached maximum member limit');
      }

      const result = await db.query(
        `INSERT INTO group_members (group_id, user_id, is_admin)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [groupId, userId, isAdmin]
      );
      return result.rows[0];
    } catch (error) {
      if (error.constraint === 'group_members_pkey') {
        throw new Error('User is already a member of this group');
      }
      logger.error('Error adding group member:', error);
      throw error;
    }
  }

  static async removeMember(groupId, userId) {
    try {
      const result = await db.query(
        `DELETE FROM group_members 
         WHERE group_id = $1 AND user_id = $2
         RETURNING *`,
        [groupId, userId]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error removing group member:', error);
      throw error;
    }
  }

  static async isAdmin(groupId, userId) {
    try {
      const result = await db.query(
        `SELECT is_admin 
         FROM group_members 
         WHERE group_id = $1 AND user_id = $2`,
        [groupId, userId]
      );
      return result.rows[0]?.is_admin || false;
    } catch (error) {
      logger.error('Error checking admin status:', error);
      throw error;
    }
  }

  static async isMember(groupId, userId) {
    try {
      const result = await db.query(
        `SELECT 1 
         FROM group_members 
         WHERE group_id = $1 AND user_id = $2`,
        [groupId, userId]
      );
      return result.rows.length > 0;
    } catch (error) {
      logger.error('Error checking member status:', error);
      throw error;
    }
  }
  
  /**
   * Set admin status for a group member
   * @param {number} groupId - Group ID
   * @param {number} userId - User ID
   * @param {boolean} isAdmin - Admin status to set
   * @returns {Promise<Object>} - Updated member record
   */
  static async setAdminStatus(groupId, userId, isAdmin) {
    try {
      const result = await db.query(
        `UPDATE group_members 
         SET is_admin = $3
         WHERE group_id = $1 AND user_id = $2
         RETURNING *`,
        [groupId, userId, isAdmin]
      );
      
      if (result.rows.length === 0) {
        throw new Error('User is not a member of this group');
      }
      
      return result.rows[0];
    } catch (error) {
      logger.error('Error setting admin status:', error);
      throw error;
    }
  }
  
  /**
   * Set featured status for a group
   * @param {number} groupId - Group ID
   * @param {boolean} isFeatured - Featured status to set
   * @returns {Promise<Object>} - Updated group
   */
  static async setFeatured(groupId, isFeatured) {
    try {
      const result = await db.query(
        `UPDATE groups 
         SET is_featured = $2
         WHERE group_id = $1
         RETURNING *`,
        [groupId, isFeatured]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Group not found');
      }
      
      return result.rows[0];
    } catch (error) {
      logger.error('Error setting featured status:', error);
      throw error;
    }
  }

  static async search({ name, cropFocus, limit = 10, offset = 0 }) {
    try {
      let query = `
        SELECT g.*, 
               COUNT(DISTINCT gm.user_id) as member_count,
               COUNT(DISTINCT m.message_id) as message_count
        FROM groups g
        LEFT JOIN group_members gm ON g.group_id = gm.group_id
        LEFT JOIN messages m ON g.group_id = m.group_id
        WHERE g.is_active = true
      `;
      const params = [];
      let paramCount = 1;

      if (name) {
        query += ` AND g.name ILIKE $${paramCount}`;
        params.push(`%${name}%`);
        paramCount++;
      }

      if (cropFocus) {
        query += ` AND g.crop_focus = $${paramCount}`;
        params.push(cropFocus);
        paramCount++;
      }

      query += ` GROUP BY g.group_id
                 ORDER BY g.created_at DESC
                 LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error searching groups:', error);
      throw error;
    }
  }

  static async getUserGroups(userId, { limit = 10, offset = 0 }) {
    try {
      const result = await db.query(
        `SELECT g.*, 
                COUNT(DISTINCT gm2.user_id) as member_count,
                COUNT(DISTINCT m.message_id) as message_count,
                gm1.is_admin as is_user_admin
         FROM groups g
         JOIN group_members gm1 ON g.group_id = gm1.group_id
         LEFT JOIN group_members gm2 ON g.group_id = gm2.group_id
         LEFT JOIN messages m ON g.group_id = m.group_id
         WHERE gm1.user_id = $1 AND g.is_active = true
         GROUP BY g.group_id, gm1.is_admin
         ORDER BY g.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );
      return result.rows;
    } catch (error) {
      logger.error('Error getting user groups:', error);
      throw error;
    }
  }

  // Invitation system methods
  static async createInvitation(groupId, inviterId, inviteeId, invitationEmail) {
    try {
      // Check if inviter is an admin
      const isAdmin = await this.isAdmin(groupId, inviterId);
      if (!isAdmin) {
        throw new Error('Only group admins can send invitations');
      }

      // Check if group has space
      const group = await this.findById(groupId);
      const currentMembers = parseInt(group.member_count);
      
      if (currentMembers >= group.max_members) {
        throw new Error('Group has reached maximum member limit');
      }

      // Check if user is already a member
      if (inviteeId) {
        const isMember = await this.isMember(groupId, inviteeId);
        if (isMember) {
          throw new Error('User is already a member of this group');
        }
      }

      // Check for existing pending invitation
      const existingInvitation = await db.query(
        `SELECT * FROM group_invitations 
         WHERE group_id = $1 AND 
               (invitee_id = $2 OR invitation_email = $3) AND 
               status = 'pending'`,
        [groupId, inviteeId, invitationEmail]
      );

      if (existingInvitation.rows.length > 0) {
        throw new Error('An invitation is already pending for this user');
      }

      // Generate token and set expiry (24 hours from now)
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const result = await db.query(
        `INSERT INTO group_invitations (
          group_id,
          inviter_id,
          invitee_id,
          invitation_email,
          token,
          expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [groupId, inviterId, inviteeId, invitationEmail, token, expiresAt]
      );

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating invitation:', error);
      throw error;
    }
  }

  static async getInvitation(invitationId) {
    try {
      const result = await db.query(
        `SELECT gi.*, g.name as group_name, u1.username as inviter_name, 
                u2.username as invitee_name
         FROM group_invitations gi
         JOIN groups g ON gi.group_id = g.group_id
         JOIN users u1 ON gi.inviter_id = u1.user_id
         LEFT JOIN users u2 ON gi.invitee_id = u2.user_id
         WHERE gi.invitation_id = $1`,
        [invitationId]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting invitation:', error);
      throw error;
    }
  }

  static async getInvitationByToken(token) {
    try {
      const result = await db.query(
        `SELECT * FROM group_invitations WHERE token = $1`,
        [token]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting invitation by token:', error);
      throw error;
    }
  }

  static async getPendingInvitationsByUser(userId) {
    try {
      const result = await db.query(
        `SELECT gi.*, g.name as group_name, u.username as inviter_name
         FROM group_invitations gi
         JOIN groups g ON gi.group_id = g.group_id
         JOIN users u ON gi.inviter_id = u.user_id
         WHERE gi.invitee_id = $1 AND gi.status = 'pending' AND gi.expires_at > NOW()`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      logger.error('Error getting pending invitations:', error);
      throw error;
    }
  }

  static async getPendingInvitationsByGroup(groupId) {
    try {
      const result = await db.query(
        `SELECT gi.*, u1.username as inviter_name, 
                COALESCE(u2.username, gi.invitation_email) as invitee_identifier
         FROM group_invitations gi
         JOIN users u1 ON gi.inviter_id = u1.user_id
         LEFT JOIN users u2 ON gi.invitee_id = u2.user_id
         WHERE gi.group_id = $1 AND gi.status = 'pending' AND gi.expires_at > NOW()
         ORDER BY gi.created_at DESC`,
        [groupId]
      );
      return result.rows;
    } catch (error) {
      logger.error('Error getting group pending invitations:', error);
      throw error;
    }
  }

  static async acceptInvitation(invitationId, userId) {
    try {
      // Start transaction
      await db.query('BEGIN');

      // Get the invitation
      const invitation = await this.getInvitation(invitationId);
      
      if (!invitation) {
        throw new Error('Invitation not found');
      }

      // Check if invitation is still pending and not expired
      if (invitation.status !== 'pending') {
        throw new Error('Invitation has already been processed');
      }
      
      if (new Date(invitation.expires_at) < new Date()) {
        await db.query(
          `UPDATE group_invitations SET status = 'expired' WHERE invitation_id = $1`,
          [invitationId]
        );
        throw new Error('Invitation has expired');
      }

      // Check if the accepting user matches the invitation
      if (invitation.invitee_id && invitation.invitee_id !== userId) {
        throw new Error('This invitation is not for you');
      }

      // Update invitation status
      await db.query(
        `UPDATE group_invitations SET status = 'accepted' WHERE invitation_id = $1`,
        [invitationId]
      );

      // Add the user to the group
      const member = await this.addMember(invitation.group_id, userId, false);

      // Commit transaction
      await db.query('COMMIT');
      return member;
    } catch (error) {
      await db.query('ROLLBACK');
      logger.error('Error accepting invitation:', error);
      throw error;
    }
  }

  static async declineInvitation(invitationId, userId) {
    try {
      // Get the invitation
      const invitation = await this.getInvitation(invitationId);
      
      if (!invitation) {
        throw new Error('Invitation not found');
      }

      // Check if invitation is still pending
      if (invitation.status !== 'pending') {
        throw new Error('Invitation has already been processed');
      }

      // Check if the declining user matches the invitation
      if (invitation.invitee_id && invitation.invitee_id !== userId) {
        throw new Error('This invitation is not for you');
      }

      // Update invitation status
      const result = await db.query(
        `UPDATE group_invitations SET status = 'declined' WHERE invitation_id = $1 RETURNING *`,
        [invitationId]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error declining invitation:', error);
      throw error;
    }
  }

  static async cancelInvitation(invitationId, userId) {
    try {
      // Get the invitation
      const invitation = await this.getInvitation(invitationId);
      
      if (!invitation) {
        throw new Error('Invitation not found');
      }

      // Check if the user is the inviter or an admin
      const isInviter = invitation.inviter_id === userId;
      const isAdmin = await this.isAdmin(invitation.group_id, userId);
      
      if (!isInviter && !isAdmin) {
        throw new Error('Only the inviter or group admin can cancel invitations');
      }

      // Delete the invitation
      const result = await db.query(
        `DELETE FROM group_invitations WHERE invitation_id = $1 RETURNING *`,
        [invitationId]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error cancelling invitation:', error);
      throw error;
    }
  }
}

module.exports = Group;