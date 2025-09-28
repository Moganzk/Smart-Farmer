import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  List, 
  ListItem, 
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';

const GroupInvitations = ({ groupId, isAdmin }) => {
  const { user, token } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Fetch group invitations
  useEffect(() => {
    if (!groupId) return;
    
    const fetchInvitations = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/groups/${groupId}/invitations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInvitations(response.data.data.invitations);
      } catch (error) {
        console.error('Error fetching invitations:', error);
        showNotification('Failed to load invitations', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, [groupId, token]);

  // Send invitation
  const handleSendInvitation = async () => {
    setLoading(true);
    try {
      // Determine if we're inviting by email or searching for a user ID
      let payload = {};
      
      if (inviteEmail.includes('@')) {
        payload = { email: inviteEmail };
      } else {
        // In a real app, you might want to search for users first
        showNotification('Please enter a valid email address', 'warning');
        setLoading(false);
        return;
      }
      
      await axios.post(`/api/groups/${groupId}/invitations`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh invitations
      const response = await axios.get(`/api/groups/${groupId}/invitations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvitations(response.data.data.invitations);
      
      setOpenDialog(false);
      setInviteEmail('');
      showNotification('Invitation sent successfully', 'success');
    } catch (error) {
      console.error('Error sending invitation:', error);
      showNotification(
        error.response?.data?.error?.message || 'Failed to send invitation', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Cancel invitation
  const handleCancelInvitation = async (invitationId) => {
    setLoading(true);
    try {
      await axios.delete(`/api/groups/invitations/${invitationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setInvitations(invitations.filter(inv => inv.invitation_id !== invitationId));
      showNotification('Invitation cancelled', 'success');
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      showNotification('Failed to cancel invitation', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show notification
  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <div>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Group Invitations
          </Typography>
          
          {isAdmin && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => setOpenDialog(true)}
              sx={{ mb: 2 }}
            >
              Invite Member
            </Button>
          )}

          {loading && <CircularProgress size={24} />}
          
          {invitations.length > 0 ? (
            <List>
              {invitations.map((invitation) => (
                <React.Fragment key={invitation.invitation_id}>
                  <ListItem>
                    <div style={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1">
                        {invitation.invitee_identifier}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Invited by: {invitation.inviter_name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Expires: {new Date(invitation.expires_at).toLocaleString()}
                      </Typography>
                    </div>
                    {isAdmin && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleCancelInvitation(invitation.invitation_id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography variant="body1">No pending invitations</Typography>
          )}
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Invite Member</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Enter email address"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSendInvitation} 
            color="primary"
            disabled={!inviteEmail || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Send Invitation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default GroupInvitations;