import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TokenGenerator from './pages/TokenGenerator';
import BillPayment from './pages/BillPayment';
import MealHistory from './pages/MealHistory';
import QRScanner from './pages/QRScanner';
import OrganizationSetup from './pages/OrganizationSetup';

function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/organization/setup" element={<OrganizationSetup />} />
            
            <Route path="/" element={
              <PrivateRoute>
                <StudentDashboard />
              </PrivateRoute>
            } />
            
            <Route path="/token-generator" element={
              <PrivateRoute allowedRoles={['student']}>
                <TokenGenerator />
              </PrivateRoute>
            } />
            
            <Route path="/bills" element={
              <PrivateRoute allowedRoles={['student']}>
                <BillPayment />
              </PrivateRoute>
            } />
            
            <Route path="/meals" element={
              <PrivateRoute allowedRoles={['student']}>
                <MealHistory />
              </PrivateRoute>
            } />
            
            <Route path="/admin" element={
              <PrivateRoute allowedRoles={['admin', 'organization']}>
                <AdminDashboard />
              </PrivateRoute>
            } />
            
            <Route path="/scanner" element={
              <PrivateRoute allowedRoles={['admin', 'organization']}>
                <QRScanner />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
