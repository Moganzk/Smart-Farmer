import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { adminService } from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';
import { ReportItem } from '../components/ReportItem';
import { UserItem } from '../components/UserItem';
import { formatDate } from '../utils/dateUtils';

const AdminDashboardScreen = () => {
  const { user } = useAuth();
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [suspensions, setSuspensions] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [actionError, setActionError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const routes = [
    { key: 'reports', title: 'Reports' },
    { key: 'suspensions', title: 'Suspensions' },
    { key: 'metrics', title: 'Metrics' },
  ];

  // Fetch reports
  const fetchReports = async () => {
    try {
      setLoading(true);
      const result = await adminService.getReports({ status: 'pending' });
      setReports(result.reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch suspensions
  const fetchSuspensions = async () => {
    try {
      setLoading(true);
      const result = await adminService.getSuspensions({ isActive: true });
      setSuspensions(result.suspensions);
    } catch (error) {
      console.error('Error fetching suspensions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch metrics
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const result = await adminService.getMetrics();
      setMetrics(result.metrics);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    switch (index) {
      case 0:
        await fetchReports();
        break;
      case 1:
        await fetchSuspensions();
        break;
      case 2:
        await fetchMetrics();
        break;
    }
    setRefreshing(false);
  };

  // Load data on tab change
  useEffect(() => {
    switch (index) {
      case 0:
        fetchReports();
        break;
      case 1:
        fetchSuspensions();
        break;
      case 2:
        fetchMetrics();
        break;
    }
  }, [index]);

  // Handle report click
  const handleReportClick = (report) => {
    setSelectedReport(report);
    setModalVisible(true);
  };

  // Handle report action
  const handleReportAction = async (action) => {
    if (!actionReason.trim() && (action === 'delete' || action === 'suspend')) {
      setActionError('Please provide a reason');
      return;
    }

    setActionError('');
    setLoading(true);

    try {
      switch (action) {
        case 'dismiss':
          await adminService.updateReportStatus(selectedReport.report_id, 'rejected', 'No action needed');
          break;
        case 'delete':
          await adminService.deleteMessage(selectedReport.message_id, actionReason);
          await adminService.updateReportStatus(selectedReport.report_id, 'resolved', `Message deleted. Reason: ${actionReason}`);
          break;
        case 'warn':
          await adminService.warnUser(selectedReport.reported_user_id, null, actionReason);
          await adminService.updateReportStatus(selectedReport.report_id, 'resolved', `User warned. Reason: ${actionReason}`);
          break;
        case 'suspend':
          await adminService.suspendUser(selectedReport.reported_user_id, null, actionReason, 7);
          await adminService.updateReportStatus(selectedReport.report_id, 'resolved', `User suspended. Reason: ${actionReason}`);
          break;
      }

      // Close modal and refresh reports
      setModalVisible(false);
      fetchReports();
    } catch (error) {
      console.error('Error handling report action:', error);
      setActionError(error.message || 'Error processing action');
    } finally {
      setLoading(false);
    }
  };

  // Handle suspension removal
  const handleRemoveSuspension = async (suspensionId, userId) => {
    try {
      setLoading(true);
      await adminService.removeSuspension(userId, suspensionId);
      fetchSuspensions();
    } catch (error) {
      console.error('Error removing suspension:', error);
    } finally {
      setLoading(false);
    }
  };

  // Render report screen
  const ReportsScreen = () => (
    <View style={styles.tabContent}>
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : reports.length > 0 ? (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.report_id.toString()}
          renderItem={({ item }) => (
            <ReportItem
              report={item}
              onPress={() => handleReportClick(item)}
            />
          )}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No pending reports</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // Render suspensions screen
  const SuspensionsScreen = () => (
    <View style={styles.tabContent}>
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : suspensions.length > 0 ? (
        <FlatList
          data={suspensions}
          keyExtractor={(item) => item.suspension_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.suspensionItem}>
              <View style={styles.suspensionHeader}>
                <Text style={styles.suspensionUser}>{item.user_username}</Text>
                <Text style={styles.suspensionBadge}>
                  {item.end_date ? 'Temporary' : 'Permanent'}
                </Text>
              </View>
              
              <Text style={styles.suspensionReason}>{item.reason}</Text>
              
              {item.end_date && (
                <Text style={styles.suspensionExpiry}>
                  Expires: {formatDate(item.end_date)}
                </Text>
              )}
              
              {item.group_id && (
                <Text style={styles.suspensionGroup}>
                  Group: {item.group_name}
                </Text>
              )}
              
              <View style={styles.suspensionFooter}>
                <Text style={styles.suspensionDate}>
                  Created: {formatDate(item.created_at)}
                </Text>
                
                <TouchableOpacity
                  style={styles.suspensionButton}
                  onPress={() => handleRemoveSuspension(item.suspension_id, item.user_id)}
                >
                  <Text style={styles.suspensionButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No active suspensions</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // Render metrics screen
  const MetricsScreen = () => (
    <ScrollView 
      style={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : metrics ? (
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Reports</Text>
            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{metrics.pending_reports}</Text>
                <Text style={styles.metricLabel}>Pending</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{metrics.in_review_reports}</Text>
                <Text style={styles.metricLabel}>In Review</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{metrics.resolved_last_7_days}</Text>
                <Text style={styles.metricLabel}>Resolved (7d)</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>User Actions</Text>
            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{metrics.active_suspensions}</Text>
                <Text style={styles.metricLabel}>Suspensions</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{metrics.permanent_bans}</Text>
                <Text style={styles.metricLabel}>Bans</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{metrics.warnings_last_30_days}</Text>
                <Text style={styles.metricLabel}>Warnings (30d)</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Content</Text>
            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{metrics.deleted_messages_last_7_days}</Text>
                <Text style={styles.metricLabel}>Deleted (7d)</Text>
              </View>
            </View>
          </View>
          
          {metrics.adminStats && (
            <View style={styles.metricCard}>
              <Text style={styles.metricTitle}>Admin Activity</Text>
              <FlatList
                data={metrics.adminStats}
                keyExtractor={(item) => item.admin_id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.adminStatRow}>
                    <Text style={styles.adminName}>{item.admin_username}</Text>
                    <Text style={styles.adminStat}>
                      <Text style={styles.statHighlight}>{item.total_actions}</Text> actions
                    </Text>
                  </View>
                )}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Failed to load metrics</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Text style={styles.refreshButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );

  // Scene map for tab view
  const renderScene = SceneMap({
    reports: ReportsScreen,
    suspensions: SuspensionsScreen,
    metrics: MetricsScreen,
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Moderation Dashboard</Text>
        <Text style={styles.subtitle}>{user?.role || 'Admin'}</Text>
      </View>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        renderTabBar={props => (
          <TabBar
            {...props}
            style={styles.tabBar}
            indicatorStyle={styles.tabIndicator}
            labelStyle={styles.tabLabel}
            activeColor="#4CAF50"
            inactiveColor="#777"
          />
        )}
      />

      {/* Report Action Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Report Details</Text>
            
            {selectedReport && (
              <View style={styles.reportDetails}>
                <Text style={styles.reportLabel}>Reported User:</Text>
                <Text style={styles.reportValue}>{selectedReport.reported_username}</Text>
                
                <Text style={styles.reportLabel}>Reason:</Text>
                <Text style={styles.reportValue}>{selectedReport.report_reason}</Text>
                
                {selectedReport.message_content && (
                  <>
                    <Text style={styles.reportLabel}>Message:</Text>
                    <Text style={styles.reportValue}>{selectedReport.message_content}</Text>
                  </>
                )}
                
                <Text style={styles.reportLabel}>Reported By:</Text>
                <Text style={styles.reportValue}>{selectedReport.reporter_username}</Text>
                
                <Text style={styles.reportLabel}>Group:</Text>
                <Text style={styles.reportValue}>{selectedReport.group_name || 'N/A'}</Text>
                
                <Text style={styles.reportLabel}>Date:</Text>
                <Text style={styles.reportValue}>{formatDate(selectedReport.created_at)}</Text>
                
                <Text style={styles.reasonLabel}>Action Reason:</Text>
                <TextInput
                  style={styles.reasonInput}
                  value={actionReason}
                  onChangeText={setActionReason}
                  placeholder="Enter reason for action..."
                  multiline
                />
                
                {actionError ? (
                  <Text style={styles.errorText}>{actionError}</Text>
                ) : null}
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.dismissButton]}
                    onPress={() => handleReportAction('dismiss')}
                    disabled={loading}
                  >
                    <Text style={styles.actionButtonText}>Dismiss</Text>
                  </TouchableOpacity>
                  
                  {selectedReport.message_id && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleReportAction('delete')}
                      disabled={loading}
                    >
                      <Text style={styles.actionButtonText}>Delete Message</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.warnButton]}
                    onPress={() => handleReportAction('warn')}
                    disabled={loading}
                  >
                    <Text style={styles.actionButtonText}>Warn User</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.suspendButton]}
                    onPress={() => handleReportAction('suspend')}
                    disabled={loading}
                  >
                    <Text style={styles.actionButtonText}>Suspend User</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
              disabled={loading}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#4CAF50" />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 16,
    backgroundColor: '#4CAF50',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#e0f2e0',
  },
  tabBar: {
    backgroundColor: '#fff',
    elevation: 2,
  },
  tabIndicator: {
    backgroundColor: '#4CAF50',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'none',
  },
  tabContent: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  suspensionItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    elevation: 2,
  },
  suspensionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  suspensionUser: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  suspensionBadge: {
    backgroundColor: '#ff6b6b',
    color: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  suspensionReason: {
    marginBottom: 8,
    color: '#555',
  },
  suspensionExpiry: {
    color: '#777',
    marginBottom: 4,
  },
  suspensionGroup: {
    color: '#777',
    marginBottom: 8,
  },
  suspensionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  suspensionDate: {
    color: '#888',
    fontSize: 12,
  },
  suspensionButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  suspensionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  metricsContainer: {
    padding: 16,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  metricTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  metricLabel: {
    color: '#777',
    marginTop: 4,
  },
  adminStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  adminName: {
    fontWeight: 'bold',
  },
  statHighlight: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  reportDetails: {
    marginBottom: 16,
  },
  reportLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#555',
  },
  reportValue: {
    marginBottom: 12,
    color: '#333',
  },
  reasonLabel: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
    color: '#555',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#ff6b6b',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    width: '48%',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 8,
  },
  dismissButton: {
    backgroundColor: '#777',
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
  },
  warnButton: {
    backgroundColor: '#ffab40',
  },
  suspendButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#eee',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    fontWeight: 'bold',
    color: '#333',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
});

export default AdminDashboardScreen;