import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import LeaveRequests from './pages/LeaveRequests';
import ApplyLeave from './pages/ApplyLeave';

function App() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={user ? "app-container" : ""}>
      {user && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      <div className={user ? "main-content" : ""}>
        {user && <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />}
        <div className={user ? "content-body" : ""}>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="/leaves" element={
              <ProtectedRoute>
                <LeaveRequests />
              </ProtectedRoute>
            } />
            
            <Route path="/apply-leave" element={
              <ProtectedRoute>
                <ApplyLeave />
              </ProtectedRoute>
            } />

            {/* Catch-all redirects to dashboard if logged in, else login */}
            <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;

