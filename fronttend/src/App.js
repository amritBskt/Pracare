import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import ChatInterface from './components/Chat/ChatInterface';
import Reports from './components/Reports/Reports';
import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/Common/LoadingSpinner';
import AdminDashboard from './components/Admin/AdminDashboard';
import Unauthorized from './components/Unauthorized/Unauthorized';

import './App.css';

const ProtectedRoute = ({ children, requireStaff = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) return <Navigate to="/login" />;

  if (requireStaff && !user.is_staff) return <Navigate to="/unauthorized" />;

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return user ? <Navigate to="/" /> : children;
};

const DefaultRedirect = () => {
  const { user, loading } = useAuth();

  if (loading)  return <LoadingSpinner />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Staff → Admin Dashboard
  // ✅ Normal user → User Dashboard
  return user.is_staff ? (
    <Navigate to="/admin-dashboard" replace />
  ) : (
    <Navigate to="/dashboard" replace />
  );
};
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DefaultRedirect />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route
                path="admin-dashboard"
                element={
                  <ProtectedRoute requireStaff>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="chat" element={<ChatInterface />} />
              <Route path="chat/:sessionId" element={<ChatInterface />} />
              <Route path="reports" element={<Reports />} />
            </Route>

             <Route path="/unauthorized" element={<Unauthorized />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
