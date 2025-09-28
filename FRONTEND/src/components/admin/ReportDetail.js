// src/components/admin/ReportDetail.js
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Avatar,
  Link
} from '@mui/material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const ReportDetail = ({ report, onUpdateStatus, onTakeAction, loading, error }) => {
  const navigate = useNavigate();
  const [newStatus, setNewStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [actionDuration, setActionDuration] = useState(1);
  const [openActionDialog, setOpenActionDialog] = useState(false);
  
  if (!report) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Loading report details...</Typography>
      </Box>
    );
  }

  const statusColors = {
    pending: 'warning',
    resolved: 'success',
    dismissed: 'default',
  };
  
  const reportTypes = {
    message: 'Message',
    user: 'User',
    group: 'Group',
    marketplace: 'Marketplace',
    knowledge: 'Knowledge Base'
  };

  const handleOpenActionDialog = (type) => {
    setActionType(type);
    setOpenActionDialog(true);
  };

  const handleCloseActionDialog = () => {
    setOpenActionDialog(false);
    setActionReason('');
    setActionDuration(1);
  };

  const handleUpdateStatus = () => {
    if (newStatus && (newStatus !== report.status)) {
      onUpdateStatus(report.report_id, newStatus, resolutionNotes);
    }
  };

  const handleTakeAction = () => {
    if (!actionReason) return;
    
    let actionDetails;
    
    switch (actionType) {
      case 'warn':
        actionDetails = { warningMessage: actionReason };
        break;
      case 'suspend':
        actionDetails = { reason: actionReason, durationDays: actionDuration };
        break;
      case 'ban':
        actionDetails = { reason: actionReason };
        break;
      case 'delete':
        actionDetails = { reason: actionReason };
        break;
      default:
        return;
    }
    
    onTakeAction(actionType, report.report_type, report.reported_id, actionDetails);
    handleCloseActionDialog();
  };

  const handleViewUser = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  const renderReportedContent = () => {
    switch (report.report_type) {
      case 'message':
        return (
          <Card variant="outlined" sx={{ mb: 3, bgcolor: 'grey.100' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Message Content:
              </Typography>
              <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
                {report.message_content}
              </Typography>
              {report.message_media && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Media Attachments:
                  </Typography>
                  <Link href={report.message_media} target="_blank">
                    View Media
                  </Link>
                </Box>
              )}
            </CardContent>
          </Card>
        );
      
      case 'user':
        return (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar src={report.reported_avatar} alt={report.reported_username}>
                  {report.reported_username?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h6">
                  {report.reported_username}
                </Typography>
              </Box>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => handleViewUser(report.reported_id)}
              >
                View User Profile
              </Button>
            </CardContent>
          </Card>
        );
        
      case 'group':
        return (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {report.group_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Group ID: {report.reported_id}
              </Typography>
              <Typography variant="body1" paragraph>
                {report.group_description}
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => navigate(`/admin/groups/${report.reported_id}`)}
              >
                View Group
              </Button>
            </CardContent>
          </Card>
        );
        
      case 'marketplace':
        return (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {report.listing_title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Listing ID: {report.reported_id}
              </Typography>
              <Typography variant="body1" paragraph>
                {report.listing_description}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Price: {report.listing_price}
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                sx={{ mt: 2 }}
                onClick={() => navigate(`/marketplace/listings/${report.reported_id}`)}
              >
                View Listing
              </Button>
            </CardContent>
          </Card>
        );
        
      case 'knowledge':
        return (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {report.article_title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Article ID: {report.reported_id}
              </Typography>
              <Typography variant="body1" paragraph>
                {report.article_excerpt || 'No excerpt available'}
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => navigate(`/knowledge/${report.reported_id}`)}
              >
                View Full Article
              </Button>
            </CardContent>
          </Card>
        );
        
      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="div">
              Report #{report.report_id}
            </Typography>
            <Chip 
              label={report.status} 
              color={statusColors[report.status] || 'default'} 
            />
          </Box>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Report Type
              </Typography>
              <Typography variant="body1">
                {reportTypes[report.report_type] || report.report_type}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Submitted On
              </Typography>
              <Typography variant="body1">
                {format(new Date(report.created_at), 'MMM dd, yyyy HH:mm')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Reported By
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar src={report.reporter_avatar} sx={{ width: 24, height: 24 }}>
                  {report.reporter_username?.charAt(0).toUpperCase()}
                </Avatar>
                <Link 
                  component="button" 
                  variant="body1"
                  onClick={() => handleViewUser(report.reporter_id)}
                >
                  {report.reporter_username}
                </Link>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Report Reason
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.5 }}>
                {report.reason}
              </Typography>
            </Grid>
            {report.description && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Additional Description
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                  {report.description}
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>
        Reported Content
      </Typography>
      {renderReportedContent()}

      {report.status === 'resolved' || report.status === 'dismissed' ? (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Resolution Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Resolved By
                </Typography>
                <Typography variant="body1">
                  {report.resolved_by_username || 'Unknown'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Resolved On
                </Typography>
                <Typography variant="body1">
                  {report.resolved_at ? 
                    format(new Date(report.resolved_at), 'MMM dd, yyyy HH:mm') : 
                    'N/A'}
                </Typography>
              </Grid>
              {report.resolution_notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Resolution Notes
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                    {report.resolution_notes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Update Report Status
            </Typography>
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>New Status</InputLabel>
                <Select
                  value={newStatus}
                  label="New Status"
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <MenuItem value="resolved">Resolve</MenuItem>
                  <MenuItem value="dismissed">Dismiss</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Resolution Notes"
                multiline
                rows={4}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Add notes about how this report was handled..."
                sx={{ mb: 2 }}
              />
              <Button 
                variant="contained" 
                color="primary"
                disabled={!newStatus || loading}
                onClick={handleUpdateStatus}
              >
                Update Status
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Action buttons based on report type */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Actions
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {report.report_type === 'message' && (
              <Button 
                variant="outlined" 
                color="error" 
                onClick={() => handleOpenActionDialog('delete')}
              >
                Delete Message
              </Button>
            )}
            
            {report.report_type === 'user' && (
              <>
                <Button 
                  variant="outlined" 
                  color="warning" 
                  onClick={() => handleOpenActionDialog('warn')}
                >
                  Warn User
                </Button>
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={() => handleOpenActionDialog('suspend')}
                >
                  Suspend User
                </Button>
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={() => handleOpenActionDialog('ban')}
                >
                  Ban User
                </Button>
              </>
            )}
            
            {report.report_type === 'group' && (
              <>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={() => onTakeAction('join', 'group', report.reported_id)}
                >
                  Join Group as Admin
                </Button>
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={() => handleOpenActionDialog('suspend')}
                >
                  Suspend Group
                </Button>
              </>
            )}
            
            {report.report_type === 'marketplace' && (
              <Button 
                variant="outlined" 
                color="error" 
                onClick={() => handleOpenActionDialog('delete')}
              >
                Remove Listing
              </Button>
            )}
            
            {report.report_type === 'knowledge' && (
              <Button 
                variant="outlined" 
                color="error" 
                onClick={() => handleOpenActionDialog('delete')}
              >
                Remove Article
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Action dialog for additional input */}
      <Dialog open={openActionDialog} onClose={handleCloseActionDialog}>
        <DialogTitle>
          {actionType === 'warn' && 'Warn User'}
          {actionType === 'suspend' && (report.report_type === 'group' ? 'Suspend Group' : 'Suspend User')}
          {actionType === 'ban' && 'Ban User Permanently'}
          {actionType === 'delete' && (
            report.report_type === 'message' ? 'Delete Message' :
            report.report_type === 'marketplace' ? 'Remove Listing' :
            'Remove Article'
          )}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {actionType === 'warn' && 'Send an official warning to this user. The warning will be visible to the user.'}
            {actionType === 'suspend' && 'Temporarily suspend access to the platform or specific features.'}
            {actionType === 'ban' && 'Permanently ban this user from the platform. This action cannot be undone.'}
            {actionType === 'delete' && 'Remove this content from the platform. This action cannot be undone.'}
          </DialogContentText>
          
          <TextField
            autoFocus
            margin="dense"
            label={
              actionType === 'warn' ? 'Warning Message' : 
              'Reason for ' + (
                actionType === 'suspend' ? 'suspension' : 
                actionType === 'ban' ? 'ban' : 'removal'
              )
            }
            fullWidth
            multiline
            rows={3}
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          
          {actionType === 'suspend' && (
            <FormControl fullWidth variant="outlined">
              <InputLabel>Duration (days)</InputLabel>
              <Select
                value={actionDuration}
                onChange={(e) => setActionDuration(e.target.value)}
                label="Duration (days)"
              >
                <MenuItem value={1}>1 day</MenuItem>
                <MenuItem value={3}>3 days</MenuItem>
                <MenuItem value={7}>7 days</MenuItem>
                <MenuItem value={14}>14 days</MenuItem>
                <MenuItem value={30}>30 days</MenuItem>
                <MenuItem value={90}>90 days</MenuItem>
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseActionDialog}>Cancel</Button>
          <Button 
            onClick={handleTakeAction} 
            color={actionType === 'warn' ? 'warning' : 'error'}
            disabled={!actionReason}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportDetail;