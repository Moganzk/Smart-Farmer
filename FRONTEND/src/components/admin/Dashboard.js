// src/components/admin/Dashboard.js
import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CardHeader,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Paper,
  TextField
} from '@mui/material';
import { 
  Report as ReportIcon,
  PersonOff,
  Flag,
  Warning,
  Message,
  TrendingUp,
  ArrowUpward,
  ArrowDownward,
  CheckCircle,
  Person,
  CalendarToday
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend
);

const DashboardMetricCard = ({ title, value, icon, color, percentChange, onClick }) => {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s',
        '&:hover': onClick ? { transform: 'translateY(-4px)', boxShadow: 3 } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar sx={{ bgcolor: color }}>
              {icon}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h5" component="div">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Grid>
          {percentChange !== undefined && (
            <Grid item>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {percentChange > 0 ? (
                  <ArrowUpward color="success" fontSize="small" />
                ) : (
                  <ArrowDownward color="error" fontSize="small" />
                )}
                <Typography 
                  variant="body2" 
                  color={percentChange > 0 ? 'success.main' : 'error.main'}
                  sx={{ ml: 0.5 }}
                >
                  {Math.abs(percentChange)}%
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

const AdminDashboard = ({ 
  metrics, 
  recentReports, 
  recentActivityLogs,
  dateRange,
  onDateRangeChange,
  onViewAllReports,
  onViewAllLogs,
  loading
}) => {
  const navigate = useNavigate();
  
  if (!metrics) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Loading dashboard metrics...</Typography>
      </Box>
    );
  }

  const handleViewReport = (reportId) => {
    navigate(`/admin/reports/${reportId}`);
  };
  
  const handleViewUser = (userId) => {
    navigate(`/admin/users/${userId}`);
  };
  
  // Format data for charts
  const reportsChartData = {
    labels: metrics.reports.timeline.map(item => format(new Date(item.date), 'MMM dd')),
    datasets: [
      {
        label: 'Reports',
        data: metrics.reports.timeline.map(item => item.count),
        backgroundColor: 'rgba(255, 152, 0, 0.6)',
        borderColor: 'rgba(255, 152, 0, 1)',
        borderWidth: 1,
      }
    ]
  };
  
  const moderationActionsData = {
    labels: ['Warnings', 'Suspensions', 'Bans', 'Deleted Content'],
    datasets: [
      {
        label: 'Actions Taken',
        data: [
          metrics.actions.warnings,
          metrics.actions.suspensions,
          metrics.actions.bans,
          metrics.actions.deletions
        ],
        backgroundColor: [
          'rgba(255, 193, 7, 0.6)',
          'rgba(244, 67, 54, 0.6)',
          'rgba(33, 33, 33, 0.6)',
          'rgba(156, 39, 176, 0.6)'
        ],
        borderColor: [
          'rgba(255, 193, 7, 1)',
          'rgba(244, 67, 54, 1)',
          'rgba(33, 33, 33, 1)',
          'rgba(156, 39, 176, 1)'
        ],
        borderWidth: 1,
      }
    ]
  };
  
  const reportTypeData = {
    labels: Object.keys(metrics.reportTypes).map(key => {
      const labelMap = {
        user: 'Users',
        message: 'Messages',
        group: 'Groups',
        marketplace: 'Marketplace',
        knowledge: 'Knowledge Base'
      };
      return labelMap[key] || key;
    }),
    datasets: [
      {
        data: Object.values(metrics.reportTypes),
        backgroundColor: [
          'rgba(33, 150, 243, 0.6)',
          'rgba(139, 195, 74, 0.6)',
          'rgba(156, 39, 176, 0.6)',
          'rgba(255, 87, 34, 0.6)',
          'rgba(0, 188, 212, 0.6)'
        ],
        borderColor: [
          'rgba(33, 150, 243, 1)',
          'rgba(139, 195, 74, 1)',
          'rgba(156, 39, 176, 1)',
          'rgba(255, 87, 34, 1)',
          'rgba(0, 188, 212, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };
  
  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" component="h1">
          Moderation Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="From Date"
            type="date"
            value={dateRange.from}
            onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            label="To Date"
            type="date"
            value={dateRange.to}
            onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        </Box>
      </Box>

      {/* Metrics Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <DashboardMetricCard
            title="Pending Reports"
            value={metrics.reports.pending}
            icon={<ReportIcon />}
            color="#ff9800" // orange
            percentChange={metrics.reports.pendingChange}
            onClick={onViewAllReports}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <DashboardMetricCard
            title="Active Suspensions"
            value={metrics.suspensions.active}
            icon={<PersonOff />}
            color="#f44336" // red
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <DashboardMetricCard
            title="Reports Resolved"
            value={metrics.reports.resolved}
            icon={<CheckCircle />}
            color="#4caf50" // green
            percentChange={metrics.reports.resolvedChange}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <DashboardMetricCard
            title="Warnings Issued"
            value={metrics.actions.warnings}
            icon={<Warning />}
            color="#ff9800" // orange
            percentChange={metrics.actions.warningsChange}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Reports Over Time" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <Line 
                  data={reportsChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0
                        }
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Report Types" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                <Pie 
                  data={reportTypeData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Items */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Recent Reports" 
              action={
                <Button color="primary" onClick={onViewAllReports}>
                  View All
                </Button>
              }
            />
            <Divider />
            <CardContent sx={{ px: 0 }}>
              <List>
                {recentReports?.length > 0 ? (
                  recentReports.map(report => (
                    <ListItem 
                      key={report.report_id} 
                      divider
                      button
                      onClick={() => handleViewReport(report.report_id)}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#ff9800' }}>
                          <Flag />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body1" noWrap>
                            {report.report_type === 'message' && 'Message Report'}
                            {report.report_type === 'user' && `User Report: ${report.reported_username}`}
                            {report.report_type === 'group' && `Group Report: ${report.group_name}`}
                            {report.report_type === 'marketplace' && `Marketplace Report: ${report.listing_title}`}
                            {report.report_type === 'knowledge' && `Knowledge Base Report: ${report.article_title}`}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {`${report.reason.substring(0, 50)}${report.reason.length > 50 ? '...' : ''}`}
                          </Typography>
                        }
                      />
                      <Chip 
                        label={report.status} 
                        color={
                          report.status === 'pending' ? 'warning' : 
                          report.status === 'resolved' ? 'success' : 
                          'default'
                        }
                        size="small"
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No recent reports" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Moderation Activity" 
              action={
                <Button color="primary" onClick={onViewAllLogs}>
                  View All
                </Button>
              }
            />
            <Divider />
            <CardContent sx={{ px: 0 }}>
              <List>
                {recentActivityLogs?.length > 0 ? (
                  recentActivityLogs.map(log => (
                    <ListItem 
                      key={log.log_id} 
                      divider
                      button={log.target_user_id ? true : false}
                      onClick={log.target_user_id ? () => handleViewUser(log.target_user_id) : undefined}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: 
                            log.action_type.includes('suspend') ? '#f44336' :
                            log.action_type.includes('warn') ? '#ff9800' :
                            log.action_type.includes('ban') ? '#212121' :
                            log.action_type.includes('delete') ? '#9c27b0' :
                            '#2196f3'
                        }}>
                          {log.action_type.includes('suspend') && <PersonOff />}
                          {log.action_type.includes('warn') && <Warning />}
                          {log.action_type.includes('ban') && <PersonOff />}
                          {log.action_type.includes('delete') && <Message />}
                          {!log.action_type.includes('suspend') && 
                           !log.action_type.includes('warn') && 
                           !log.action_type.includes('ban') && 
                           !log.action_type.includes('delete') && <Person />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body1" noWrap>
                            {log.action_type.replace(/_/g, ' ')}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {log.admin_username}
                            </Typography>
                            {" — "}
                            {log.target_username && (
                              <Typography component="span" variant="body2">
                                {log.action_type.includes('report') ? 
                                  `Report #${log.target_id}` : 
                                  `User: ${log.target_username}`}
                              </Typography>
                            )}
                          </>
                        }
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarToday fontSize="inherit" sx={{ mr: 0.5 }} />
                        {format(new Date(log.created_at), 'MMM dd')}
                      </Typography>
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No recent activity" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Moderation Actions Chart */}
      <Grid container sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Moderation Actions" />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <Bar 
                  data={moderationActionsData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0
                        }
                      }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;