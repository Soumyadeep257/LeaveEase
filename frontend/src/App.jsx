import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';

// Root index redirector
const RootRedirect = () => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'manager') {
    return <Navigate to="/manager/dashboard" replace />;
  }

  return <Navigate to="/employee/dashboard" replace />;
};

// 404 Not Found Page
const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <span className="text-6xl font-black text-indigo-600">404</span>
        <h2 className="text-2xl font-bold text-slate-800">Page Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested page could not be found or you may not have sufficient permissions to view it.
        </p>
        <RootRedirect />
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Employee Dashboard (Protected) */}
              <Route
                path="/employee/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['employee', 'manager']}>
                    <EmployeeDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Manager Dashboard (Manager Only Protected) */}
              <Route
                path="/manager/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['manager']}>
                    <ManagerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Root index redirect */}
              <Route path="/" element={<RootRedirect />} />

              {/* Catch all 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
