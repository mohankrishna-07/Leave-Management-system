import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Synchronize auth state on application startup
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('employeeToken');
      if (token) {
        try {
          const response = await api.get('/api/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error("Token validation failed, logging out", error);
          localStorage.removeItem('employeeToken');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password, expectedRole) => {
    const response = await api.post('/api/auth/login', { email, password });
    if (expectedRole && response.data.role !== expectedRole) {
      throw new Error(`Access Denied. This account is registered as ${response.data.role}.`);
    }
    const { accessToken, ...userData } = response.data;
    localStorage.setItem('employeeToken', accessToken);
    setUser(userData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('employeeToken');
    setUser(null);
  };

  const updateProfileState = (updatedUser) => {
    setUser((prev) => ({
      ...prev,
      ...updatedUser,
    }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfileState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
