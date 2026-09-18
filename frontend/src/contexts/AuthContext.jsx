import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import liveSyncService from '../services/liveSyncService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('safecircle_user');

      if (storedToken) {
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
          } catch (e) {}
        }

        try {
          const userData = await authService.getMe(storedToken);
          setUser(userData);
          setToken(storedToken);
          localStorage.setItem('safecircle_user', JSON.stringify(userData));
          liveSyncService.connect(storedToken);
        } catch (error) {
          console.warn("Stored session validation failed:", error.message);
          if (error.status === 401 || (error.message && error.message.toLowerCase().includes('token'))) {
            localStorage.removeItem('token');
            localStorage.removeItem('safecircle_user');
            setUser(null);
            setToken(null);
          } else {
            if (storedUser) {
              try {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
              } catch (e) {
                localStorage.removeItem('token');
                localStorage.removeItem('safecircle_user');
                setUser(null);
                setToken(null);
              }
            } else {
              localStorage.removeItem('token');
              setToken(null);
              setUser(null);
            }
          }
        }
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('safecircle_user');
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, otp) => {
    const data = await authService.login(email, password, otp);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('safecircle_user', JSON.stringify(data.user));
    liveSyncService.connect(data.token);
    return data;
  };

  const register = async (name, email, password, verificationToken) => {
    const data = await authService.register(name, email, password, verificationToken);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('safecircle_user', JSON.stringify(data.user));
    liveSyncService.connect(data.token);
    return data;
  };

  const sendOtp = async (email, purpose = 'REGISTER') => {
    return await authService.sendOtp(email, purpose);
  };

  const verifyOtp = async (email, otp, purpose = 'REGISTER') => {
    return await authService.verifyOtp(email, otp, purpose);
  };

  const forgotPassword = async (email) => {
    return await authService.forgotPassword(email);
  };

  const resetPassword = async (email, newPassword, verificationToken) => {
    return await authService.resetPassword(email, newPassword, verificationToken);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.warn("Logout error:", e);
    }
    liveSyncService.disconnect();
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('safecircle_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        loading,
        login,
        register,
        sendOtp,
        verifyOtp,
        forgotPassword,
        resetPassword,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
