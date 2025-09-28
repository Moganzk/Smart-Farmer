// src/pages/admin/ReportsPage.js
import React, { useState, useEffect } from 'react';
import { Container, Box, Snackbar, Alert } from '@mui/material';
import ReportsList from '../../components/admin/ReportsList';
import adminService from '../../services/adminService';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'pending',
    type: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await adminService.getReports(filters);
        setReports(response.reports);
        setTotalCount(response.totalCount);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
        setError('Failed to load reports. Please try again later.');
        setLoading(false);
      }
    };

    fetchReports();
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
        <ReportsList
          reports={reports}
          totalCount={totalCount}
          loading={loading}
          onPageChange={handlePageChange}
          onFilterChange={handleFilterChange}
          filters={filters}
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

export default ReportsPage;