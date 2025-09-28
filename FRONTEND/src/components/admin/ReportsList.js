// src/components/admin/ReportsList.js
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  Typography,
  Button,
  Box,
  Chip,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const ReportsList = ({ reports, totalCount, loading, onPageChange, onFilterChange, filters }) => {
  const navigate = useNavigate();
  const [localFilters, setLocalFilters] = useState(filters || {
    status: 'pending',
    type: '',
    dateFrom: '',
    dateTo: ''
  });
  
  // Status colors for the chips
  const statusColors = {
    pending: 'warning',
    resolved: 'success',
    dismissed: 'default',
  };

  // Report type readable labels
  const reportTypes = {
    message: 'Message',
    user: 'User',
    group: 'Group',
    marketplace: 'Marketplace',
    knowledge: 'Knowledge Base'
  };

  const handleViewReport = (reportId) => {
    navigate(`/admin/reports/${reportId}`);
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    // Debounce could be added here for better performance
    onFilterChange(newFilters);
  };

  const totalPages = Math.ceil(totalCount / (filters?.limit || 10));

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Reports ({totalCount})
      </Typography>
      
      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={localFilters.status || ''}
            label="Status"
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="dismissed">Dismissed</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={localFilters.type || ''}
            label="Type"
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {Object.entries(reportTypes).map(([key, label]) => (
              <MenuItem key={key} value={key}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <TextField
          label="From Date"
          type="date"
          value={localFilters.dateFrom || ''}
          onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        
        <TextField
          label="To Date"
          type="date"
          value={localFilters.dateTo || ''}
          onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <Typography>Loading reports...</Typography>
        </Box>
      ) : reports?.length > 0 ? (
        <>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Reported Item</TableCell>
                  <TableCell>Reported By</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.report_id}>
                    <TableCell>{report.report_id}</TableCell>
                    <TableCell>{reportTypes[report.report_type] || report.report_type}</TableCell>
                    <TableCell>
                      {report.report_type === 'message' && `Message ID: ${report.reported_id}`}
                      {report.report_type === 'user' && report.reported_username}
                      {report.report_type === 'group' && report.group_name}
                      {report.report_type === 'marketplace' && `Listing: ${report.listing_title}`}
                      {report.report_type === 'knowledge' && `Article: ${report.article_title}`}
                    </TableCell>
                    <TableCell>{report.reporter_username}</TableCell>
                    <TableCell>{report.reason}</TableCell>
                    <TableCell>
                      {format(new Date(report.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={report.status} 
                        color={statusColors[report.status] || 'default'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="contained" 
                        size="small"
                        onClick={() => handleViewReport(report.report_id)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination 
              count={totalPages} 
              page={(filters?.page || 1)} 
              onChange={(e, page) => onPageChange(page)}
              color="primary" 
            />
          </Box>
        </>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <Typography>No reports found with the selected filters.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default ReportsList;