const Group = require('../../models/group');
const logger = require('../../utils/logger');

class InvitationController {
  static async sendInvitation(req, res) {
    try {
      const { groupId } = req.params;
      const { userId, email } = req.body;
      
      // Either userId or email must be provided
      if (!userId && !email) {
        return res.status(400).json({
          error: {
            message: 'Either userId or email must be provided'
          }
        });
      }

      const invitation = await Group.createInvitation(
        groupId,
        req.user.user_id,
        userId || null,
        email || null
      );

      // TODO: Send email notification if email is provided
      // This would typically be handled by a notification service

      res.status(201).json({
        message: 'Invitation sent successfully',
        data: { invitation }
      });
    } catch (error) {
      logger.error('Error sending invitation:', error);
      res.status(400).json({
        error: {
          message: error.message || 'Error sending invitation'
        }
      });
    }
  }

  static async listPendingInvitations(req, res) {
    try {
      const { groupId } = req.params;
      
      // Check if user is a member
      const isMember = await Group.isMember(groupId, req.user.user_id);
      if (!isMember) {
        return res.status(403).json({
          error: {
            message: 'Access denied. Must be a group member.'
          }
        });
      }

      const invitations = await Group.getPendingInvitationsByGroup(groupId);
      
      res.json({
        data: { invitations }
      });
    } catch (error) {
      logger.error('Error listing invitations:', error);
      res.status(500).json({
        error: {
          message: 'Error retrieving invitations'
        }
      });
    }
  }

  static async getUserInvitations(req, res) {
    try {
      const invitations = await Group.getPendingInvitationsByUser(req.user.user_id);
      
      res.json({
        data: { invitations }
      });
    } catch (error) {
      logger.error('Error getting user invitations:', error);
      res.status(500).json({
        error: {
          message: 'Error retrieving invitations'
        }
      });
    }
  }

  static async acceptInvitation(req, res) {
    try {
      const { invitationId } = req.params;
      
      const member = await Group.acceptInvitation(invitationId, req.user.user_id);
      
      res.json({
        message: 'Invitation accepted successfully',
        data: { member }
      });
    } catch (error) {
      logger.error('Error accepting invitation:', error);
      res.status(400).json({
        error: {
          message: error.message || 'Error accepting invitation'
        }
      });
    }
  }

  static async declineInvitation(req, res) {
    try {
      const { invitationId } = req.params;
      
      await Group.declineInvitation(invitationId, req.user.user_id);
      
      res.json({
        message: 'Invitation declined successfully'
      });
    } catch (error) {
      logger.error('Error declining invitation:', error);
      res.status(400).json({
        error: {
          message: error.message || 'Error declining invitation'
        }
      });
    }
  }

  static async cancelInvitation(req, res) {
    try {
      const { invitationId } = req.params;
      
      await Group.cancelInvitation(invitationId, req.user.user_id);
      
      res.json({
        message: 'Invitation cancelled successfully'
      });
    } catch (error) {
      logger.error('Error cancelling invitation:', error);
      res.status(400).json({
        error: {
          message: error.message || 'Error cancelling invitation'
        }
      });
    }
  }

  static async getInvitationByToken(req, res) {
    try {
      const { token } = req.params;
      
      const invitation = await Group.getInvitationByToken(token);
      
      if (!invitation) {
        return res.status(404).json({
          error: {
            message: 'Invitation not found'
          }
        });
      }

      // Check if expired
      if (new Date(invitation.expires_at) < new Date()) {
        return res.status(400).json({
          error: {
            message: 'Invitation has expired'
          }
        });
      }

      // Check if already processed
      if (invitation.status !== 'pending') {
        return res.status(400).json({
          error: {
            message: 'Invitation has already been processed'
          }
        });
      }

      const group = await Group.findById(invitation.group_id);
      
      res.json({
        data: { 
          invitation,
          group
        }
      });
    } catch (error) {
      logger.error('Error getting invitation by token:', error);
      res.status(500).json({
        error: {
          message: 'Error retrieving invitation'
        }
      });
    }
  }
}

module.exports = InvitationController;