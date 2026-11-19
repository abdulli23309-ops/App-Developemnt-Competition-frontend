import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch current authenticated user
  const fetchCurrentUser = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      if (response.data && response.data.success) {
        setUser(response.data.data);
      } else {
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.warn('Failed to restore auth session:', err?.response?.data?.message || err.message);
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Standard Login
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data && res.data.success) {
        const { token: jwtToken, user: userData } = res.data.data;
        localStorage.setItem('token', jwtToken);
        setToken(jwtToken);
        setUser(userData);
        return { success: true, user: userData };
      }
      return { success: false, message: res.data?.message || 'Login failed.' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please verify credentials.';
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Click Demo Login
  const demoLogin = async (email) => {
    return login(email, 'Password123!');
  };

  // Register New Student
  const register = async ({ fullName, email, password, registrationNumber, academicProgram }) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', { fullName, email, password, registrationNumber, academicProgram });
      if (res.data && res.data.success) {
        const { token: jwtToken, user: userData } = res.data.data;
        localStorage.setItem('token', jwtToken);
        setToken(jwtToken);
        setUser(userData);
        return { success: true, user: userData };
      }
      return { success: false, message: res.data?.message || 'Registration failed.' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    // Clear Axios Authorization header so subsequent requests are unauthenticated
    delete api.defaults.headers.common['Authorization'];
    navigate('/login', { replace: true });
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    demoLogin,
    register,
    logout,
    refreshUser: fetchCurrentUser,
    isStudent: user?.role === 'Student',
    isDeptAdmin: user?.role === 'DeptAdmin',
    isSuperAdmin: user?.role === 'SuperAdmin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: async () => ({ success: false }),
      demoLogin: async () => ({ success: false }),
      register: async () => ({ success: false }),
      logout: () => {},
      refreshUser: async () => {},
      isStudent: false,
      isDeptAdmin: false,
      isSuperAdmin: false,
    };
  }
  return context;
}

export default AuthContext;
