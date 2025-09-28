// src/pages/admin/ActivityLogPage.js
import React, { useState, useEffect } from 'react';
import { Container, Box, Snackbar, Alert } from '@mui/material';
import ActivityLog from '../../components/admin/ActivityLog';
import adminService from '../../services/adminService';

const ActivityLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    actionType: '',
    adminUsername: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 20
  });

  useEffect(() => {
    const fetchActivityLogs = async () => {
      try {
        setLoading(true);
        const response = await adminService.getActivityLogs(filters);
        setLogs(response.logs);
        setTotalCount(response.totalCount);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch activity logs:', err);
        setError('Failed to load activity logs. Please try again later.');
        setLoading(false);
      }
    };

    fetchActivityLogs();
  }, [filters]);

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <ActivityLog
          logs={logs}
          totalCount={totalCount}
          filters={filters}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
          loading={loading}
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
    </Container>
  );
};

export default ActivityLogPage;