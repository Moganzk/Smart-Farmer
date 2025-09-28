import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  List, 
  ListItem, 
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Box
} from '@mui/material';

const UserInvitations = () => {
  const { user, token } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Fetch user invitations
  useEffect(() => {    
    const fetchInvitations = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/groups/invitations/pending', {
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
  }, [token]);

  // Accept invitation
  const handleAcceptInvitation = async (invitationId) => {
    setLoading(true);
    try {
      await axios.post(`/api/groups/invitations/${invitationId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove from list
      setInvitations(invitations.filter(inv => inv.invitation_id !== invitationId));
      showNotification('Invitation accepted successfully', 'success');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      showNotification(
        error.response?.data?.error?.message || 'Failed to accept invitation', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Decline invitation
  const handleDeclineInvitation = async (invitationId) => {
    setLoading(true);
    try {
      await axios.post(`/api/groups/invitations/${invitationId}/decline`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove from list
      setInvitations(invitations.filter(inv => inv.invitation_id !== invitationId));
      showNotification('Invitation declined', 'info');
    } catch (error) {
      console.error('Error declining invitation:', error);
      showNotification('Failed to decline invitation', 'error');
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
            Your Group Invitations
          </Typography>
          
          {loading && <CircularProgress size={24} />}
          
          {invitations.length > 0 ? (
            <List>
              {invitations.map((invitation) => (
                <React.Fragment key={invitation.invitation_id}>
                  <ListItem>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1">
                        {invitation.group_name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Invited by: {invitation.inviter_name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Expires: {new Date(invitation.expires_at).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleAcceptInvitation(invitation.invitation_id)}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleDeclineInvitation(invitation.invitation_id)}
                      >
                        Decline
                      </Button>
                    </Box>
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

export default UserInvitations;