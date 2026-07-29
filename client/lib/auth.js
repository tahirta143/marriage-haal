'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');

        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          setPermissions(parsed.permissions || []);
        }

        if (storedToken) {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            setPermissions(res.data.user.permissions || []);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        }
      } catch (err) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setUser(null);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { accessToken, user } = res.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        setPermissions(user.permissions || []);
        return user;
      }
      throw new Error(res.data.message || 'Login failed');
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Login failed');
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        const { accessToken, user } = res.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        setPermissions(user.permissions || []);
        return user;
      }
      throw new Error(res.data.message || 'Registration failed');
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Registration failed');
    }
  };

  const sendOTP = async (target, type = 'phone') => {
    try {
      const res = await api.post('/auth/send-otp', { target, type });
      if (res.data.success) {
        return res.data;
      }
      throw new Error(res.data.message || 'Failed to send OTP code');
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to send OTP code');
    }
  };

  const verifyOTP = async (target, otp, name) => {
    try {
      const res = await api.post('/auth/verify-otp', { target, otp, name });
      if (res.data.success) {
        const { accessToken, user } = res.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        setPermissions(user.permissions || []);
        return user;
      }
      throw new Error(res.data.message || 'OTP verification failed');
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'OTP verification failed');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    setPermissions([]);
    window.location.href = '/';
  };

  const hasPermission = (permissionName) => {
    return Array.isArray(permissions) && permissions.includes(permissionName);
  };

  return (
    <AuthContext.Provider value={{ user, permissions, loading, login, register, sendOTP, verifyOTP, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
