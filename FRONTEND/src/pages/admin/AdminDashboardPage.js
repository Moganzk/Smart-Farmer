// src/pages/admin/AdminDashboardPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Snackbar, Alert } from '@mui/material';
import AdminDashboard from '../../components/admin/Dashboard';
import adminService from '../../services/adminService';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [recentActivityLogs, setRecentActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get metrics with optional date range
        const metricsData = await adminService.getMetrics(
          dateRange.from || undefined, 
          dateRange.to || undefined
        );
        setMetrics(metricsData);
        
        // Get recent reports
        const reportsResponse = await adminService.getReports({
          limit: 5,
          page: 1,
          status: 'pending'
        });
        setRecentReports(reportsResponse.reports);
        
        // Get recent activity logs
        const logsResponse = await adminService.getActivityLogs({
          limit: 5,
          page: 1
        });
        setRecentActivityLogs(logsResponse.logs);
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateRange]);

  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
  };

  const handleViewAllReports = () => {
    navigate('/admin/reports');
  };

  const handleViewAllLogs = () => {
    navigate('/admin/activity-logs');
  };

  return (
    <Container maxWidth="xl">
      <AdminDashboard
        metrics={metrics}
        recentReports={recentReports}
        recentActivityLogs={recentActivityLogs}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        onViewAllReports={handleViewAllReports}
        onViewAllLogs={handleViewAllLogs}
        loading={loading}
      />

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

export default AdminDashboardPage;