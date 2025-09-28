// src/pages/admin/ArchivedMessagesPage.js
import React, { useState, useEffect } from 'react';
import { Container, Box, Snackbar, Alert } from '@mui/material';
import ArchivedMessages from '../../components/admin/ArchivedMessages';
import adminService from '../../services/adminService';

const ArchivedMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filters, setFilters] = useState({
    reason: '',
    adminUsername: '',
    dateFrom: '',
    dateTo: '',
    groupId: '',
    userId: '',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    const fetchArchivedMessages = async () => {
      try {
        setLoading(true);
        const response = await adminService.getArchivedMessages(filters);
        setMessages(response.messages);
        setTotalCount(response.totalCount);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch archived messages:', err);
        setError('Failed to load archived messages. Please try again later.');
        setLoading(false);
      }
    };

    fetchArchivedMessages();
  }, [filters]);

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handleRestoreMessage = async (archiveId) => {
    try {
      setActionLoading(true);
      await adminService.restoreMessage(archiveId);
      
      // Remove the restored message from the list
      setMessages(messages.filter(msg => msg.archive_id !== archiveId));
      setTotalCount(prevCount => prevCount - 1);
      
      setSuccess('Message restored successfully');
      setActionLoading(false);
    } catch (err) {
      console.error('Failed to restore message:', err);
      setError('Failed to restore message. Please try again.');
      setActionLoading(false);
    }
  };

  const handlePermanentDelete = async (archiveId) => {
    try {
      setActionLoading(true);
      
      // This endpoint would need to be added to the backend
      await fetch(`/api/admin/messages/archive/${archiveId}/permanent-delete`, {
        method: 'DELETE',
      });
      
      // Remove the deleted message from the list
      setMessages(messages.filter(msg => msg.archive_id !== archiveId));
      setTotalCount(prevCount => prevCount - 1);
      
      setSuccess('Message permanently deleted');
      setActionLoading(false);
    } catch (err) {
      console.error('Failed to permanently delete message:', err);
      setError('Failed to permanently delete message. Please try again.');
      setActionLoading(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <ArchivedMessages
          messages={messages}
          totalCount={totalCount}
          filters={filters}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
          onRestoreMessage={handleRestoreMessage}
          onPermanentDelete={handlePermanentDelete}
          loading={loading || actionLoading}
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

export default ArchivedMessagesPage;