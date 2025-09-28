// src/components/admin/ArchivedMessages.js
import React, { useState } from 'react';
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
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Pagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Chip,
  Avatar
} from '@mui/material';
import { 
  Visibility, 
  Restore, 
  DeleteForever,
  Search,
  Person,
  Group as GroupIcon,
  CalendarToday
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const ArchivedMessages = ({
  messages,
  totalCount,
  filters,
  onFilterChange,
  onPageChange,
  onRestoreMessage,
  onPermanentDelete,
  loading
}) => {
  const navigate = useNavigate();
  const [localFilters, setLocalFilters] = useState(filters || {
    reason: '',
    adminUsername: '',
    dateFrom: '',
    dateTo: '',
    groupId: '',
    userId: ''
  });
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState('');
  const [confirmationText, setConfirmationText] = useState('');

  const handleFilterChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleViewUser = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleViewGroup = (groupId) => {
    navigate(`/admin/groups/${groupId}`);
  };

  const openDialog = (message, action) => {
    setSelectedMessage(message);
    setDialogAction(action);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedMessage(null);
    setDialogAction('');
    setConfirmationText('');
  };

  const handleConfirmAction = () => {
    if (!selectedMessage) return;

    if (dialogAction === 'restore') {
      onRestoreMessage(selectedMessage.archive_id);
    } else if (dialogAction === 'delete' && confirmationText === 'DELETE') {
      onPermanentDelete(selectedMessage.archive_id);
    }

    closeDialog();
  };

  const totalPages = Math.ceil(totalCount / (filters?.limit || 10));

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Archived Messages ({totalCount})
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search by Reason"
                value={localFilters.reason || ''}
                onChange={(e) => handleFilterChange('reason', e.target.value)}
                InputProps={{
                  startAdornment: <Search color="action" sx={{ mr: 1 }} />
                }}
              />
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
                label="User ID"
                value={localFilters.userId || ''}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Group ID"
                value={localFilters.groupId || ''}
                onChange={(e) => handleFilterChange('groupId', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="From Date"
                type="date"
                value={localFilters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
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
          <Typography>Loading archived messages...</Typography>
        </Box>
      ) : messages?.length > 0 ? (
        <>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Sent By</TableCell>
                  <TableCell>Content</TableCell>
                  <TableCell>Deleted By</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Group</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {messages.map((message) => (
                  <TableRow key={message.archive_id}>
                    <TableCell>
                      {format(new Date(message.deleted_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                          src={message.user_avatar} 
                          sx={{ width: 24, height: 24 }}
                        >
                          {message.username?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Link
                          component="button"
                          variant="body2"
                          onClick={() => handleViewUser(message.user_id)}
                        >
                          {message.username}
                        </Link>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          maxWidth: 250, 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis' 
                        }}
                      >
                        {message.content}
                      </Typography>
                      {message.has_attachments && (
                        <Chip 
                          label="Has Attachments" 
                          size="small" 
                          color="info" 
                          sx={{ mt: 0.5 }} 
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {message.deleted_by_username}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          maxWidth: 200, 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis' 
                        }}
                      >
                        {message.deletion_reason}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {message.group_id ? (
                        <Link
                          component="button"
                          variant="body2"
                          onClick={() => handleViewGroup(message.group_id)}
                        >
                          {message.group_name || `Group #${message.group_id}`}
                        </Link>
                      ) : (
                        <Typography variant="body2">Direct Message</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => openDialog(message, 'view')}
                        >
                          View
                        </Button>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          startIcon={<Restore />}
                          onClick={() => openDialog(message, 'restore')}
                        >
                          Restore
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<DeleteForever />}
                          onClick={() => openDialog(message, 'delete')}
                        >
                          Delete
                        </Button>
                      </Box>
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
          <Typography>No archived messages found with the selected filters.</Typography>
        </Box>
      )}

      {/* Dialogs */}
      <Dialog 
        open={dialogOpen && dialogAction === 'view'} 
        onClose={closeDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Message Content</DialogTitle>
        <DialogContent>
          {selectedMessage && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Message Details
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <Person fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Sent by: {selectedMessage.username}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <CalendarToday fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Original date: {format(new Date(selectedMessage.created_at), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </Grid>
                  {selectedMessage.group_id && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <GroupIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Group: {selectedMessage.group_name || `Group #${selectedMessage.group_id}`}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>

              <Card variant="outlined" sx={{ mb: 3, bgcolor: 'grey.50' }}>
                <CardContent>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedMessage.content}
                  </Typography>
                  
                  {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Attachments:
                      </Typography>
                      {selectedMessage.attachments.map((attachment, index) => (
                        <Link 
                          key={index} 
                          href={attachment.url} 
                          target="_blank" 
                          sx={{ display: 'block', mt: 0.5 }}
                        >
                          {attachment.filename || `Attachment ${index + 1}`}
                        </Link>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Deletion Information
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <Person fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Deleted by: {selectedMessage.deleted_by_username}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <CalendarToday fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Deleted on: {format(new Date(selectedMessage.deleted_at), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Reason for deletion:
                    </Typography>
                    <Typography variant="body2">
                      {selectedMessage.deletion_reason}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Close</Button>
          <Button 
            color="primary" 
            startIcon={<Restore />}
            onClick={() => {
              closeDialog();
              openDialog(selectedMessage, 'restore');
            }}
          >
            Restore Message
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={dialogOpen && dialogAction === 'restore'} 
        onClose={closeDialog}
      >
        <DialogTitle>Restore Message</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to restore this deleted message? 
            It will become visible again to all users in the conversation.
          </Typography>
          {selectedMessage && (
            <Card variant="outlined" sx={{ mt: 2, bgcolor: 'grey.50' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Message Preview:
                </Typography>
                <Typography variant="body2" sx={{ 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis' 
                }}>
                  {selectedMessage.content}
                </Typography>
              </CardContent>
            </Card>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button 
            color="primary"
            onClick={handleConfirmAction}
          >
            Restore Message
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={dialogOpen && dialogAction === 'delete'} 
        onClose={closeDialog}
      >
        <DialogTitle>Permanently Delete Message</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Are you sure you want to permanently delete this message? 
            This action cannot be undone and the message will be permanently removed from the database.
          </Typography>
          {selectedMessage && (
            <Card variant="outlined" sx={{ mt: 2, bgcolor: 'grey.50' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Message Preview:
                </Typography>
                <Typography variant="body2" sx={{ 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis' 
                }}>
                  {selectedMessage.content}
                </Typography>
              </CardContent>
            </Card>
          )}
          <TextField
            fullWidth
            margin="dense"
            label="Type DELETE to confirm"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            variant="outlined"
            sx={{ mt: 2 }}
            error={confirmationText.length > 0 && confirmationText !== 'DELETE'}
            helperText={confirmationText.length > 0 && confirmationText !== 'DELETE' ? 
              "Please type DELETE in all caps to confirm" : ""}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button 
            color="error"
            disabled={confirmationText !== 'DELETE'}
            onClick={handleConfirmAction}
          >
            Permanently Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ArchivedMessages;