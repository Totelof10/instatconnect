import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore user from stored token
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      api.get('/auth/users/me/')
        .then(({ data }) => setCurrentUser(data))
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback((userData, accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    setCurrentUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout/', { refresh: localStorage.getItem('refresh_token') });
    } catch { /* ignore */ }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setCurrentUser(null);
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    const { data } = await api.get('/auth/users/me/');
    setCurrentUser(data);
    return data;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, logout, refreshCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
