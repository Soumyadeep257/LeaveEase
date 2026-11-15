import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 text-sm font-medium">Loading LeaveEase...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> redirect to login
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role validation: if allowedRoles is provided and user role is not in it
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If an employee tries to access /manager/dashboard, redirect them to /employee/dashboard
    if (user.role === 'employee') {
      return <Navigate to="/employee/dashboard" replace />;
    }
    // If a manager tries to access /employee/dashboard (or other), redirect to /manager/dashboard
    if (user.role === 'manager') {
      return <Navigate to="/manager/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
