// src/components/admin/ActivityLog.js
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Link,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Pagination
} from '@mui/material';
import {
  Person,
  PersonOff,
  Warning,
  Flag,
  DeleteForever,
  Check,
  Block,
  ArrowForward
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const ActivityLog = ({ 
  logs, 
  totalCount, 
  filters, 
  onFilterChange, 
  onPageChange, 
  loading 
}) => {
  const navigate = useNavigate();
  const [localFilters, setLocalFilters] = React.useState(filters || {
    actionType: '',
    adminUsername: '',
    dateFrom: '',
    dateTo: ''
  });

  // Action types for filter dropdown
  const actionTypes = [
    { value: 'update_report', label: 'Update Report' },
    { value: 'warn_user', label: 'Warn User' },
    { value: 'suspend_user', label: 'Suspend User' },
    { value: 'ban_user', label: 'Ban User' },
    { value: 'delete_message', label: 'Delete Message' },
    { value: 'join_group', label: 'Join Group' },
    { value: 'feature_group', label: 'Feature Group' }
  ];

  const handleFilterChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleViewUser = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleViewReport = (reportId) => {
    navigate(`/admin/reports/${reportId}`);
  };

  const getActionIcon = (actionType) => {
    switch (true) {
      case actionType.includes('warn'):
        return <Warning sx={{ color: '#ff9800' }} />;
      case actionType.includes('suspend'):
        return <Block sx={{ color: '#f44336' }} />;
      case actionType.includes('ban'):
        return <PersonOff sx={{ color: '#212121' }} />;
      case actionType.includes('delete'):
        return <DeleteForever sx={{ color: '#9c27b0' }} />;
      case actionType.includes('update_report'):
        return <Check sx={{ color: '#4caf50' }} />;
      case actionType.includes('join'):
        return <ArrowForward sx={{ color: '#2196f3' }} />;
      case actionType.includes('feature'):
        return <Flag sx={{ color: '#ff5722' }} />;
      default:
        return <Person />;
    }
  };

  const getActionColor = (actionType) => {
    switch (true) {
      case actionType.includes('warn'):
        return 'warning';
      case actionType.includes('suspend'):
      case actionType.includes('ban'):
      case actionType.includes('delete'):
        return 'error';
      case actionType.includes('update_report'):
        return 'success';
      default:
        return 'default';
    }
  };

  const totalPages = Math.ceil(totalCount / (filters?.limit || 10));

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Moderation Activity Log ({totalCount})
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Action Type</InputLabel>
                <Select
                  value={localFilters.actionType || ''}
                  label="Action Type"
                  onChange={(e) => handleFilterChange('actionType', e.target.value)}
                >
                  <MenuItem value="">All Actions</MenuItem>
                  {actionTypes.map((action) => (
                    <MenuItem key={action.value} value={action.value}>
                      {action.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Admin Username"
                value={localFilters.adminUsername || ''}
                onChange={(e) => handleFilterChange('adminUsername', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="From Date"
                type="date"
                value={localFilters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="To Date"
                type="date"
                value={localFilters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <Typography>Loading activity logs...</Typography>
        </Box>
      ) : logs?.length > 0 ? (
        <>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Admin</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.log_id}>
                    <TableCell>
                      {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                          src={log.admin_avatar} 
                          sx={{ width: 24, height: 24 }}
                        >
                          {log.admin_username?.charAt(0).toUpperCase()}
                        </Avatar>
                        {log.admin_username}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getActionIcon(log.action_type)}
                        label={log.action_type.replace(/_/g, ' ')}
                        color={getActionColor(log.action_type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {log.action_type.includes('report') ? (
                        <Link 
                          component="button"
                          variant="body2"
                          onClick={() => handleViewReport(log.target_id)}
                        >
                          Report #{log.target_id}
                        </Link>
                      ) : log.target_username ? (
                        <Link
                          component="button"
                          variant="body2"
                          onClick={() => handleViewUser(log.target_user_id)}
                        >
                          {log.target_username}
                        </Link>
                      ) : log.target_group_id ? (
                        <Typography variant="body2">
                          Group: {log.group_name}
                        </Typography>
                      ) : log.target_message_id ? (
                        <Typography variant="body2">
                          Message ID: {log.target_message_id}
                        </Typography>
                      ) : (
                        <Typography variant="body2">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.action_details || '-'}
                      </Typography>
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
          <Typography>No activity logs found with the selected filters.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default ActivityLog;