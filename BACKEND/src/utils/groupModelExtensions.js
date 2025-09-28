/**
 * Additional methods for the Group model
 * to support search, popular groups, and tagging
 */

const Group = require('../models/group');
const db = require('../config/database');
const logger = require('../utils/logger');

// Additional methods to add to the Group class
const GroupExtensions = {
  /**
   * Search for groups by term (name, description, tags)
   * @param {string} term - Search term
   * @param {number} limit - Limit results
   * @param {number} offset - Offset for pagination
   * @returns {array} Matching groups
   */
  async search(term, limit = 20, offset = 0) {
    try {
      const query = `
        SELECT g.*, 
               COUNT(DISTINCT gm.user_id) as member_count,
               COUNT(DISTINCT m.message_id) as message_count,
               array_agg(DISTINCT gt.tag_name) AS tags
        FROM groups g
        LEFT JOIN group_members gm ON g.group_id = gm.group_id
        LEFT JOIN messages m ON g.group_id = m.group_id
        LEFT JOIN group_tags gt ON g.group_id = gt.group_id
        WHERE g.is_active = true AND (
          to_tsvector('english', g.name) @@ plainto_tsquery('english', $1)
          OR to_tsvector('english', g.description) @@ plainto_tsquery('english', $1)
          OR EXISTS (
            SELECT 1 FROM group_tags 
            WHERE group_id = g.group_id AND tag_name ILIKE '%' || $1 || '%'
          )
        )
        GROUP BY g.group_id
        ORDER BY g.is_featured DESC, g.last_activity_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      const result = await db.query(query, [term, limit, offset]);
      return result.rows;
    } catch (error) {
      logger.error(`Error searching groups: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Find groups by name (exact match or LIKE)
   * @param {string} name - Group name
   * @param {boolean} exact - Whether to match exactly
   * @returns {object|array} Group(s) found
   */
  async findByName(name, exact = true) {
    try {
      let query, params;
      
      if (exact) {
        query = `
          SELECT * FROM groups
          WHERE LOWER(name) = LOWER($1) AND is_active = true
        `;
        params = [name];
      } else {
        query = `
          SELECT * FROM groups
          WHERE name ILIKE $1 AND is_active = true
        `;
        params = [`%${name}%`];
      }
      
      const result = await db.query(query, params);
      
      return exact ? result.rows[0] : result.rows;
    } catch (error) {
      logger.error(`Error finding group by name: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Get popular groups by member count and activity
   * @param {number} limit - Limit results
   * @returns {array} Popular groups
   */
  async findPopular(limit = 10) {
    try {
      const query = `
        SELECT g.*, 
               COUNT(DISTINCT gm.user_id) as member_count,
               COUNT(DISTINCT m.message_id) as message_count,
               array_agg(DISTINCT gt.tag_name) AS tags
        FROM groups g
        LEFT JOIN group_members gm ON g.group_id = gm.group_id
        LEFT JOIN messages m ON g.group_id = m.group_id
        LEFT JOIN group_tags gt ON g.group_id = gt.group_id
        WHERE g.is_active = true
        GROUP BY g.group_id
        ORDER BY g.is_featured DESC, member_count DESC, g.last_activity_at DESC
        LIMIT $1
      `;
      
      const result = await db.query(query, [limit]);
      return result.rows;
    } catch (error) {
      logger.error(`Error finding popular groups: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Find groups by user ID
   * @param {number} userId - User ID
   * @returns {array} User's groups
   */
  async findByUserId(userId) {
    try {
      const query = `
        SELECT g.*, 
               COUNT(DISTINCT gm2.user_id) as member_count,
               COUNT(DISTINCT m.message_id) as message_count,
               gm1.is_admin as is_user_admin,
               array_agg(DISTINCT gt.tag_name) AS tags
        FROM groups g
        JOIN group_members gm1 ON g.group_id = gm1.group_id
        LEFT JOIN group_members gm2 ON g.group_id = gm2.group_id
        LEFT JOIN messages m ON g.group_id = m.group_id
        LEFT JOIN group_tags gt ON g.group_id = gt.group_id
        WHERE gm1.user_id = $1 AND g.is_active = true
        GROUP BY g.group_id, gm1.is_admin
        ORDER BY g.last_activity_at DESC
      `;
      
      const result = await db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      logger.error(`Error finding user groups: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Get member count for a group
   * @param {number} groupId - Group ID
   * @returns {number} Member count
   */
  async getMemberCount(groupId) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM group_members
        WHERE group_id = $1
      `;
      
      const result = await db.query(query, [groupId]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      logger.error(`Error getting member count: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Get admin count for a group
   * @param {number} groupId - Group ID
   * @returns {number} Admin count
   */
  async getAdminCount(groupId) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM group_members
        WHERE group_id = $1 AND is_admin = true
      `;
      
      const result = await db.query(query, [groupId]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      logger.error(`Error getting admin count: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Get members of a group
   * @param {number} groupId - Group ID
   * @returns {array} Group members
   */
  async getMembers(groupId) {
    try {
      const query = `
        SELECT u.user_id, u.username, u.full_name, u.profile_picture,
               u.location, u.bio, gm.is_admin, gm.joined_at
        FROM group_members gm
        JOIN users u ON gm.user_id = u.user_id
        WHERE gm.group_id = $1
        ORDER BY gm.is_admin DESC, gm.joined_at ASC
      `;
      
      const result = await db.query(query, [groupId]);
      return result.rows;
    } catch (error) {
      logger.error(`Error getting group members: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Update member role (admin status)
   * @param {number} groupId - Group ID
   * @param {number} userId - User ID
   * @param {boolean} isAdmin - Whether user is admin
   * @returns {object} Updated member
   */
  async updateMemberRole(groupId, userId, isAdmin) {
    try {
      const query = `
        UPDATE group_members
        SET is_admin = $3
        WHERE group_id = $1 AND user_id = $2
        RETURNING *
      `;
      
      const result = await db.query(query, [groupId, userId, isAdmin]);
      return result.rows[0];
    } catch (error) {
      logger.error(`Error updating member role: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Add tags to a group
   * @param {number} groupId - Group ID
   * @param {string[]} tags - Array of tag names
   * @returns {array} Added tags
   */
  async addTags(groupId, tags) {
    try {
      if (!Array.isArray(tags) || tags.length === 0) {
        return [];
      }
      
      // Validate tags (length, format)
      const validTags = tags
        .filter(tag => typeof tag === 'string' && tag.trim().length > 0)
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length <= 50);
      
      if (validTags.length === 0) {
        return [];
      }
      
      // Insert tags one by one to handle conflicts
      const addedTags = [];
      
      for (const tag of validTags) {
        try {
          const result = await db.query(
            `INSERT INTO group_tags (group_id, tag_name)
             VALUES ($1, $2)
             ON CONFLICT (group_id, tag_name) DO NOTHING
             RETURNING *`,
            [groupId, tag]
          );
          
          if (result.rows.length > 0) {
            addedTags.push(result.rows[0]);
          }
        } catch (error) {
          logger.error(`Error adding tag ${tag}: ${error.message}`);
        }
      }
      
      return addedTags;
    } catch (error) {
      logger.error(`Error adding group tags: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Remove a tag from a group
   * @param {number} groupId - Group ID
   * @param {string} tagName - Tag to remove
   * @returns {boolean} Success
   */
  async removeTag(groupId, tagName) {
    try {
      const result = await db.query(
        `DELETE FROM group_tags
         WHERE group_id = $1 AND tag_name = $2
         RETURNING *`,
        [groupId, tagName.trim().toLowerCase()]
      );
      
      return result.rows.length > 0;
    } catch (error) {
      logger.error(`Error removing group tag: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Get tags for a group
   * @param {number} groupId - Group ID
   * @returns {array} Group tags
   */
  async getTags(groupId) {
    try {
      const result = await db.query(
        `SELECT * FROM group_tags
         WHERE group_id = $1
         ORDER BY created_at DESC`,
        [groupId]
      );
      
      return result.rows;
    } catch (error) {
      logger.error(`Error getting group tags: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Increment the view count for a group
   * @param {number} groupId - Group ID
   * @returns {number} New view count
   */
  async incrementViewCount(groupId) {
    try {
      const result = await db.query(
        `SELECT increment_group_view_count($1)`,
        [groupId]
      );
      
      const updatedGroup = await this.findById(groupId);
      return updatedGroup.view_count;
    } catch (error) {
      logger.error(`Error incrementing view count: ${error.message}`);
      throw error;
    }
  }
};

// Add the extension methods to the Group class
Object.assign(Group, GroupExtensions);

module.exports = Group;