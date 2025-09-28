// src/pages/admin/UserManagementPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Box, Typography, Snackbar, Alert } from '@mui/material';
import UserManagement from '../../components/admin/UserManagement';
import adminService from '../../services/adminService';

const UserManagementPage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [userReports, setUserReports] = useState([]);
  const [userActivities, setUserActivities] = useState([]);
  const [suspensions, setSuspensions] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Note: These endpoints would need to be created in the backend
        // We'll assume the structure of the API responses here
        
        // Fetch user details
        const userResponse = await fetch(`/api/admin/users/${id}`);
        if (!userResponse.ok) throw new Error('Failed to fetch user data');
        const userData = await userResponse.json();
        setUser(userData);
        
        // Fetch reports about this user
        const reportsData = await adminService.getUserReports(id, 1, 50);
        setUserReports(reportsData.reports);
        
        // Fetch user activities
        const activitiesResponse = await fetch(`/api/admin/users/${id}/activities`);
        if (!activitiesResponse.ok) throw new Error('Failed to fetch user activities');
        const activitiesData = await activitiesResponse.json();
        setUserActivities(activitiesData.activities);
        
        // Fetch suspensions
        const suspensionsResponse = await fetch(`/api/admin/users/${id}/suspensions`);
        if (!suspensionsResponse.ok) throw new Error('Failed to fetch user suspensions');
        const suspensionsData = await suspensionsResponse.json();
        setSuspensions(suspensionsData.suspensions);
        
        // Fetch warnings
        const warningsResponse = await fetch(`/api/admin/users/${id}/warnings`);
        if (!warningsResponse.ok) throw new Error('Failed to fetch user warnings');
        const warningsData = await warningsResponse.json();
        setWarnings(warningsData.warnings);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again later.');
        setLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id]);

  const handleSuspendUser = async (userId, reason, durationDays) => {
    try {
      setActionLoading(true);
      await adminService.suspendUser(userId, null, reason, durationDays);
      
      // Refresh suspensions data
      const suspensionsResponse = await fetch(`/api/admin/users/${userId}/suspensions`);
      const suspensionsData = await suspensionsResponse.json();
      setSuspensions(suspensionsData.suspensions);
      
      setSuccess('User suspended successfully');
      setActionLoading(false);
    } catch (err) {
      console.error('Failed to suspend user:', err);
      setError('Failed to suspend user. Please try again.');
      setActionLoading(false);
    }
  };

  const handleBanUser = async (userId, reason) => {
    try {
      setActionLoading(true);
      await adminService.banUser(userId, null, reason);
      
      setSuccess('User banned successfully');
      setActionLoading(false);
      
      // Optionally, refresh user data to show updated status
      const userResponse = await fetch(`/api/admin/users/${userId}`);
      const userData = await userResponse.json();
      setUser(userData);
    } catch (err) {
      console.error('Failed to ban user:', err);
      setError('Failed to ban user. Please try again.');
      setActionLoading(false);
    }
  };

  const handleWarnUser = async (userId, warningMessage) => {
    try {
      setActionLoading(true);
      await adminService.warnUser(userId, null, warningMessage);
      
      // Refresh warnings data
      const warningsResponse = await fetch(`/api/admin/users/${userId}/warnings`);
      const warningsData = await warningsResponse.json();
      setWarnings(warningsData.warnings);
      
      setSuccess('Warning issued successfully');
      setActionLoading(false);
    } catch (err) {
      console.error('Failed to warn user:', err);
      setError('Failed to warn user. Please try again.');
      setActionLoading(false);
    }
  };

  const handleRemoveSuspension = async (userId, suspensionId) => {
    try {
      setActionLoading(true);
      await adminService.removeSuspension(userId, suspensionId);
      
      // Refresh suspensions data
      const suspensionsResponse = await fetch(`/api/admin/users/${userId}/suspensions`);
      const suspensionsData = await suspensionsResponse.json();
      setSuspensions(suspensionsData.suspensions);
      
      setSuccess('Suspension removed successfully');
      setActionLoading(false);
    } catch (err) {
      console.error('Failed to remove suspension:', err);
      setError('Failed to remove suspension. Please try again.');
      setActionLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        {!loading && !user ? (
          <Typography variant="h5" color="error" align="center">
            User not found
          </Typography>
        ) : (
          <UserManagement
            user={user}
            userReports={userReports}
            userActivities={userActivities}
            suspensions={suspensions}
            warnings={warnings}
            onSuspendUser={handleSuspendUser}
            onBanUser={handleBanUser}
            onWarnUser={handleWarnUser}
            onRemoveSuspension={handleRemoveSuspension}
            loading={loading || actionLoading}
          />
        )}
      </Box>

      {error && (
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}
      
      {success && (
        <Snackbar 
          open={!!success} 
          autoHideDuration={6000} 
          onClose={() => setSuccess(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>
      )}
    </Container>
  );
};

export default UserManagementPage;