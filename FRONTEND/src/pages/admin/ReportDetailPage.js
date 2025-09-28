// src/pages/admin/ReportDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Snackbar, Alert } from '@mui/material';
import ReportDetail from '../../components/admin/ReportDetail';
import adminService from '../../services/adminService';

const ReportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchReportDetail = async () => {
      try {
        setLoading(true);
        const reportData = await adminService.getReportById(id);
        setReport(reportData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch report details:', err);
        setError('Failed to load report details. Please try again later.');
        setLoading(false);
      }
    };

    if (id) {
      fetchReportDetail();
    }
  }, [id]);

  const handleUpdateStatus = async (reportId, status, notes) => {
    try {
      setActionLoading(true);
      await adminService.updateReportStatus(reportId, status, notes);
      
      // Refresh report data
      const updatedReport = await adminService.getReportById(reportId);
      setReport(updatedReport);
      
      setSuccess(`Report status updated to ${status}`);
      setActionLoading(false);
    } catch (err) {
      console.error('Failed to update report status:', err);
      setError('Failed to update report status. Please try again.');
      setActionLoading(false);
    }
  };

  const handleTakeAction = async (actionType, targetType, targetId, details) => {
    try {
      setActionLoading(true);
      
      switch (actionType) {
        case 'warn':
          await adminService.warnUser(targetId, details.groupId, details.warningMessage);
          setSuccess('Warning issued successfully');
          break;
        
        case 'suspend':
          await adminService.suspendUser(targetId, details.groupId, details.reason, details.durationDays);
          setSuccess('User suspended successfully');
          break;
        
        case 'ban':
          await adminService.banUser(targetId, details.groupId, details.reason);
          setSuccess('User banned successfully');
          break;
        
        case 'delete':
          if (targetType === 'message') {
            await adminService.deleteMessage(targetId, details.reason);
            setSuccess('Message deleted successfully');
          }
          break;
        
        case 'join':
          if (targetType === 'group') {
            await adminService.joinGroup(targetId);
            setSuccess('Joined group as admin');
            // Navigate to group
            navigate(`/groups/${targetId}`);
          }
          break;
          
        default:
          setError('Unknown action type');
          break;
      }
      
      setActionLoading(false);
      
      // Refresh report data if we're still on the page
      const updatedReport = await adminService.getReportById(id);
      setReport(updatedReport);
      
    } catch (err) {
      console.error(`Failed to execute ${actionType}:`, err);
      setError(`Failed to ${actionType}. Please try again.`);
      setActionLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <ReportDetail
          report={report}
          onUpdateStatus={handleUpdateStatus}
          onTakeAction={handleTakeAction}
          loading={loading || actionLoading}
          error={error}
        />
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

export default ReportDetailPage;