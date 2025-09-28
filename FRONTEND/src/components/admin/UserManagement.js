// src/components/admin/UserManagement.js
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  Avatar,
  Button,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar
} from '@mui/material';
import { 
  Person, 
  Report, 
  History, 
  Block, 
  Warning, 
  Flag,
  Group as GroupIcon,
  RssFeed,
  ShoppingBasket,
  Chat
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const UserManagement = ({ 
  user, 
  userReports, 
  userActivities,
  suspensions,
  warnings,
  onSuspendUser,
  onBanUser,
  onWarnUser,
  onRemoveSuspension,
  loading
}) => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [suspensionDuration, setSuspensionDuration] = useState(1);
  
  if (!user) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Loading user details...</Typography>
      </Box>
    );
  }
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const openActionDialog = (type) => {
    setActionType(type);
    setActionReason('');
    setActionDialogOpen(true);
  };
  
  const closeActionDialog = () => {
    setActionDialogOpen(false);
  };
  
  const handleActionSubmit = () => {
    if (!actionReason) return;
    
    switch (actionType) {
      case 'warn':
        onWarnUser(user.user_id, actionReason);
        break;
      case 'suspend':
        onSuspendUser(user.user_id, actionReason, suspensionDuration);
        break;
      case 'ban':
        onBanUser(user.user_id, actionReason);
        break;
      default:
        break;
    }
    
    closeActionDialog();
  };
  
  const handleViewReport = (reportId) => {
    navigate(`/admin/reports/${reportId}`);
  };
  
  const handleRemoveSuspension = (suspensionId) => {
    onRemoveSuspension(user.user_id, suspensionId);
  };
  
  // Check if user is currently suspended
  const isCurrentlySuspended = suspensions?.some(s => s.is_active);

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar 
                  src={user.avatar_url} 
                  alt={user.username}
                  sx={{ width: 80, height: 80 }}
                >
                  {user.username?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h5">
                    {user.username}
                    {user.is_verified && (
                      <Chip 
                        label="Verified" 
                        color="primary" 
                        size="small" 
                        sx={{ ml: 1 }} 
                      />
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    User ID: {user.user_id}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body1" paragraph>
                {user.bio || 'No bio provided'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <RssFeed fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Posts" 
                    secondary={user.stats?.post_count || '0'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <GroupIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Groups" 
                    secondary={user.stats?.group_count || '0'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ShoppingBasket fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Marketplace Listings" 
                    secondary={user.stats?.marketplace_count || '0'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Flag fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Times Reported" 
                    secondary={user.stats?.times_reported || '0'} 
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<Warning />}
                  onClick={() => openActionDialog('warn')}
                >
                  Warn User
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Block />}
                  onClick={() => openActionDialog('suspend')}
                  disabled={isCurrentlySuspended}
                >
                  Suspend User
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Block />}
                  onClick={() => openActionDialog('ban')}
                >
                  Ban User
                </Button>
                <Button
                  variant="contained"
                  onClick={() => window.open(`/users/${user.username}`, '_blank')}
                >
                  View Public Profile
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="user management tabs">
          <Tab icon={<Report />} label="Reports" id="user-tab-0" aria-controls="user-tabpanel-0" />
          <Tab icon={<Warning />} label="Warnings" id="user-tab-1" aria-controls="user-tabpanel-1" />
          <Tab icon={<Block />} label="Suspensions" id="user-tab-2" aria-controls="user-tabpanel-2" />
          <Tab icon={<History />} label="Activity" id="user-tab-3" aria-controls="user-tabpanel-3" />
        </Tabs>
      </Box>
      
      {/* Reports Tab */}
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          Reports ({userReports?.length || 0})
        </Typography>
        {userReports?.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report ID</TableCell>
                  <TableCell>Reporter</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userReports.map(report => (
                  <TableRow key={report.report_id}>
                    <TableCell>{report.report_id}</TableCell>
                    <TableCell>{report.reporter_username}</TableCell>
                    <TableCell>{report.reason}</TableCell>
                    <TableCell>
                      {format(new Date(report.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={report.status} 
                        color={
                          report.status === 'pending' ? 'warning' : 
                          report.status === 'resolved' ? 'success' : 
                          'default'
                        } 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
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
        ) : (
          <Typography variant="body1" color="text.secondary">
            No reports found for this user.
          </Typography>
        )}
      </TabPanel>
      
      {/* Warnings Tab */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Warnings ({warnings?.length || 0})
        </Typography>
        {warnings?.length > 0 ? (
          <List>
            {warnings.map(warning => (
              <Card key={warning.warning_id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Warning #{warning.warning_id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(warning.created_at), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Issued by: {warning.admin_username}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                    {warning.message}
                  </Typography>
                  {warning.group_id && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Related to group: {warning.group_name}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </List>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No warnings issued to this user.
          </Typography>
        )}
      </TabPanel>
      
      {/* Suspensions Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Suspensions ({suspensions?.length || 0})
        </Typography>
        {suspensions?.length > 0 ? (
          <List>
            {suspensions.map(suspension => (
              <Card 
                key={suspension.suspension_id} 
                sx={{ 
                  mb: 2, 
                  borderLeft: suspension.is_active ? '4px solid #f44336' : 'none'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Suspension #{suspension.suspension_id}
                      {suspension.is_active && (
                        <Chip 
                          label="Active" 
                          color="error" 
                          size="small" 
                          sx={{ ml: 1 }} 
                        />
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(suspension.created_at), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Issued by: {suspension.admin_username}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    Reason: {suspension.reason}
                  </Typography>
                  {suspension.end_date && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      End date: {format(new Date(suspension.end_date), 'MMM dd, yyyy')}
                    </Typography>
                  )}
                  {suspension.group_id && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Related to group: {suspension.group_name}
                    </Typography>
                  )}
                  {suspension.is_active && (
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        variant="outlined" 
                        color="primary"
                        size="small"
                        onClick={() => handleRemoveSuspension(suspension.suspension_id)}
                      >
                        Remove Suspension
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </List>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No suspensions found for this user.
          </Typography>
        )}
      </TabPanel>
      
      {/* Activity Tab */}
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        {userActivities?.length > 0 ? (
          <List>
            {userActivities.map(activity => (
              <ListItem 
                key={activity.activity_id} 
                divider 
                alignItems="flex-start"
              >
                <ListItemAvatar>
                  <Avatar>
                    {activity.activity_type === 'post' && <RssFeed />}
                    {activity.activity_type === 'group' && <GroupIcon />}
                    {activity.activity_type === 'marketplace' && <ShoppingBasket />}
                    {activity.activity_type === 'message' && <Chat />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1">
                      {activity.activity_type === 'post' && 'Created a post'}
                      {activity.activity_type === 'group' && (
                        activity.action === 'join' ? 'Joined a group' : 'Created a group'
                      )}
                      {activity.activity_type === 'marketplace' && 'Posted a marketplace listing'}
                      {activity.activity_type === 'message' && 'Sent a message'}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm')}
                      </Typography>
                      {activity.content && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {activity.content.length > 100 
                            ? activity.content.substring(0, 100) + '...' 
                            : activity.content}
                        </Typography>
                      )}
                      {activity.group_name && (
                        <Typography variant="body2" color="text.secondary">
                          Group: {activity.group_name}
                        </Typography>
                      )}
                      {activity.item_title && (
                        <Typography variant="body2">
                          {activity.item_title}
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No recent activity found for this user.
          </Typography>
        )}
      </TabPanel>
      
      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onClose={closeActionDialog}>
        <DialogTitle>
          {actionType === 'warn' && 'Warn User'}
          {actionType === 'suspend' && 'Suspend User'}
          {actionType === 'ban' && 'Ban User Permanently'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {actionType === 'warn' && 'Send an official warning to this user. The warning will be visible to the user.'}
            {actionType === 'suspend' && 'Temporarily suspend this user from the platform.'}
            {actionType === 'ban' && 'Permanently ban this user from the platform. This action cannot be undone.'}
          </DialogContentText>
          
          <TextField
            autoFocus
            margin="dense"
            label={
              actionType === 'warn' ? 'Warning Message' : 
              actionType === 'suspend' ? 'Suspension Reason' : 'Ban Reason'
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
                value={suspensionDuration}
                onChange={(e) => setSuspensionDuration(e.target.value)}
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
          <Button onClick={closeActionDialog}>Cancel</Button>
          <Button 
            onClick={handleActionSubmit} 
            color={
              actionType === 'warn' ? 'warning' : 'error'
            }
            disabled={!actionReason}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;