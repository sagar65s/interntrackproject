import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE = process.env.REACT_APP_API_URL || '';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('interntrack_token'));

  // Set default axios header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Verify token on load
  const verifyToken = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await axios.get(`${API_BASE}/api/auth/me`);
      if (data.success) setUser(data.user);
      else logout();
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { verifyToken(); }, [verifyToken]);

  const login = async (email, password) => {
    const { data } = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
    if (data.success) {
      localStorage.setItem('interntrack_token', data.token);
      setToken(data.token);
      setUser(data.user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    }
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await axios.post(`${API_BASE}/api/auth/register`, { name, email, password });
    if (data.success) {
      localStorage.setItem('interntrack_token', data.token);
      setToken(data.token);
      setUser(data.user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('interntrack_token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
