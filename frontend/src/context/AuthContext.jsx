import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

// Sample preloaded demo accounts for instant preview before backend is up
export const DEMO_ACCOUNTS = {
  employee: {
    _id: 'emp_001',
    name: 'Alex Morgan',
    email: 'alex@leaveease.com',
    role: 'employee',
    department: 'Engineering',
    leaveBalance: {
      casual: 8,
      sick: 6,
      earned: 14,
    },
    totalQuota: {
      casual: 12,
      sick: 10,
      earned: 18,
    },
  },
  manager: {
    _id: 'mgr_001',
    name: 'Sarah Jenkins',
    email: 'sarah.manager@leaveease.com',
    role: 'manager',
    department: 'Engineering',
    leaveBalance: {
      casual: 10,
      sick: 8,
      earned: 20,
    },
    totalQuota: {
      casual: 14,
      sick: 10,
      earned: 22,
    },
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

    if (savedToken && savedUser) {
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
      // Offline fallback: if backend is not reachable or credentials match demo
      if (email === DEMO_ACCOUNTS.employee.email) {
        const demoToken = 'mock_jwt_token_employee_123';
        updateAuth(demoToken, DEMO_ACCOUNTS.employee);
        return { success: true, user: DEMO_ACCOUNTS.employee, isDemo: true };
      } else if (email === DEMO_ACCOUNTS.manager.email) {
        const demoToken = 'mock_jwt_token_manager_456';
        updateAuth(demoToken, DEMO_ACCOUNTS.manager);
        return { success: true, user: DEMO_ACCOUNTS.manager, isDemo: true };
      }

      const message = error.response?.data?.message || 'Login failed. Please check credentials or start the backend.';
      return { success: false, message };
    }
  };

  // Demo direct login for quick testing
  const loginAsDemo = (role = 'employee') => {
    const demoUser = DEMO_ACCOUNTS[role] || DEMO_ACCOUNTS.employee;
    const demoToken = `mock_jwt_token_${role}_${Date.now()}`;
    updateAuth(demoToken, demoUser);
    return demoUser;
  };

  // Register handler
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token: receivedToken, user: receivedUser } = response.data;
      updateAuth(receivedToken, receivedUser);
      return { success: true, user: receivedUser };
    } catch (error) {
      // Offline fallback: create dummy user session if backend is not reachable
      const fallbackUser = {
        _id: 'user_' + Date.now(),
        name: userData.name,
        email: userData.email,
        role: userData.role || 'employee',
        department: userData.department || 'Engineering',
        leaveBalance: { casual: 10, sick: 8, earned: 15 },
        totalQuota: { casual: 12, sick: 10, earned: 18 },
      };
      const fallbackToken = 'mock_jwt_registered_' + Date.now();
      updateAuth(fallbackToken, fallbackUser);
      return { success: true, user: fallbackUser, isDemo: true };
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
