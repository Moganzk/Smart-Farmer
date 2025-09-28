// src/routes/AdminRoutes.js
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import ReportsPage from '../pages/admin/ReportsPage';
import ReportDetailPage from '../pages/admin/ReportDetailPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import ActivityLogPage from '../pages/admin/ActivityLogPage';
import ArchivedMessagesPage from '../pages/admin/ArchivedMessagesPage';

// Admin authorization check
const AdminRoute = ({ children }) => {
  // This should be replaced with your actual auth logic
  const isAdmin = localStorage.getItem('role') === 'admin';
  
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }
  
  return <AdminLayout>{children}</AdminLayout>;
};

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
      <Route path="/reports" element={<AdminRoute><ReportsPage /></AdminRoute>} />
      <Route path="/reports/:id" element={<AdminRoute><ReportDetailPage /></AdminRoute>} />
      <Route path="/users" element={<AdminRoute><Navigate to="/admin" replace /></AdminRoute>} />
      <Route path="/users/:id" element={<AdminRoute><UserManagementPage /></AdminRoute>} />
      <Route path="/activity-logs" element={<AdminRoute><ActivityLogPage /></AdminRoute>} />
      <Route path="/archived-messages" element={<AdminRoute><ArchivedMessagesPage /></AdminRoute>} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRoutes;