import React, { createContext, useState } from 'react';
import authApi from '../api/authApi';

export const AuthContext = createContext(null);

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getInitialAuthState() {
  if (typeof window === 'undefined') {
    return { user: null, token: null };
  }
  try {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) return { user: null, token: null };

    const payload = decodeJwt(storedToken);
    if (!payload) return { user: null, token: null };

    return {
      user: { email: payload.sub, role: payload.role },
      token: storedToken
    };
  } catch {
    return { user: null, token: null };
  }
}

export const AuthProvider = ({ children }) => {
  const initial = getInitialAuthState();
  const [user, setUser] = useState(initial.user);
  const [token, setToken] = useState(initial.token);

  const login = async (email, password) => {
    const jwt = await authApi.login(email, password);
    const payload = decodeJwt(jwt);
    if (!payload) throw new Error('Invalid token');

    localStorage.setItem('token', jwt);
    setToken(jwt);
    setUser({ email: payload.sub, role: payload.role });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    isStaff: user?.role === 'STAFF',
    isCustomer: user?.role === 'CUSTOMER'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Giúp Fast Refresh nhận diện đây là file component chính
export default AuthProvider;
