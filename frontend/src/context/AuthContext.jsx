import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const DEMO_ACCOUNTS = {
  employee: {
    name: 'Alex Morgan',
    email: 'alex@leaveease.com',
    role: 'employee',
    department: 'Engineering',
    leaveBalance: { casual: 8, sick: 6, earned: 14 },
    totalQuota: { casual: 12, sick: 10, earned: 18 },
  },
  manager: {
    name: 'Sarah Jenkins',
    email: 'sarah.manager@leaveease.com',
    role: 'manager',
    department: 'Engineering',
    leaveBalance: { casual: 10, sick: 8, earned: 20 },
    totalQuota: { casual: 14, sick: 10, earned: 22 },
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user and token from localStorage on initial load
  useEffect(() => {
    const savedToken = localStorage.getItem('leaveEase_token');
    const savedUser = localStorage.getItem('leaveEase_user');

    // Purge any legacy mock tokens that don't conform to real JWT
    if (savedToken && (!savedToken.includes('.') || savedToken.startsWith('mock_jwt_'))) {
      localStorage.removeItem('leaveEase_token');
      localStorage.removeItem('leaveEase_user');
      setToken(null);
      setUser(null);
    } else if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to parse saved user credentials', err);
        localStorage.removeItem('leaveEase_token');
        localStorage.removeItem('leaveEase_user');
      }
    }
    setLoading(false);
  }, []);

  // Save or clear user & token in localStorage
  const updateAuth = (newToken, newUser) => {
    if (newToken && newUser) {
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('leaveEase_token', newToken);
      localStorage.setItem('leaveEase_user', JSON.stringify(newUser));
    } else {
      setToken(null);
      setUser(null);
      localStorage.removeItem('leaveEase_token');
      localStorage.removeItem('leaveEase_user');
    }
  };

  // Login handler
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token: receivedToken, user: receivedUser } = response.data;
      updateAuth(receivedToken, receivedUser);
      return { success: true, user: receivedUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your email and password.';
      return { success: false, message };
    }
  };

  // Demo direct login for quick testing via backend demo route
  const loginAsDemo = async (role = 'employee') => {
    try {
      const response = await authAPI.demoLogin(role);
      const { token: receivedToken, user: receivedUser } = response.data;
      updateAuth(receivedToken, receivedUser);
      return { success: true, user: receivedUser };
    } catch (error) {
      console.error('Demo login failed on backend:', error);
      const message = error.response?.data?.message || 'Could not connect to backend server';
      return { success: false, message };
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token: receivedToken, user: receivedUser } = response.data;
      updateAuth(receivedToken, receivedUser);
      return { success: true, user: receivedUser };
    } catch (error) {
      console.error('Registration failed:', error);
      const message = error.response?.data?.message || 'Registration failed. Please verify your details.';
      return { success: false, message };
    }
  };

  // Logout handler
  const logout = () => {
    updateAuth(null, null);
  };

  // Update profile or leave balance in state
  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('leaveEase_user', JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    loginAsDemo,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
