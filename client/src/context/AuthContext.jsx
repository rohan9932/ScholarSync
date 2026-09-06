import React, { createContext, useContext, useState, useEffect } from 'react';
import { authLogin, authRegister, authMe } from '../services/api.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('scholarsync_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check existing token and fetch profile on mount
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('scholarsync_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await authMe();
        if (data && data.user) {
          setUser(data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        logout();
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await authLogin({ email, password });
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('scholarsync_token', data.token);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Login failed. Please check your credentials.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (formData) => {
    setError(null);
    try {
      const data = await authRegister(formData);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('scholarsync_token', data.token);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Registration failed.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('scholarsync_token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const isTeacher = user?.role === 'TEACHER';
  const isStudent = user?.role === 'STUDENT';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated,
        isTeacher,
        isStudent,
        isLoading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
