import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState({
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken')
  });

  useEffect(() => {
    const initAuth = async () => {
      if (tokens.accessToken) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data.user);
        } catch (error) {
          // Token might be expired, try to refresh
          if (tokens.refreshToken) {
            try {
              const response = await api.post('/auth/refresh', {
                refreshToken: tokens.refreshToken
              });
              const newTokens = response.data.tokens;
              setTokens(newTokens);
              localStorage.setItem('accessToken', newTokens.accessToken);
              localStorage.setItem('refreshToken', newTokens.refreshToken);
              
              // Retry getting user info
              const userResponse = await api.get('/auth/me');
              setUser(userResponse.data.user);
            } catch (refreshError) {
              // Refresh failed, clear tokens
              console.error('Token refresh failed:', refreshError);
              logout();
            }
          } else {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [tokens.accessToken, tokens.refreshToken]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: userData, tokens: newTokens } = response.data;
      
      setUser(userData);
      setTokens(newTokens);
      localStorage.setItem('accessToken', newTokens.accessToken);
      localStorage.setItem('refreshToken', newTokens.refreshToken);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { user: newUser, tokens: newTokens } = response.data;
      
      setUser(newUser);
      setTokens(newTokens);
      localStorage.setItem('accessToken', newTokens.accessToken);
      localStorage.setItem('refreshToken', newTokens.refreshToken);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      if (tokens.refreshToken) {
        await api.post('/auth/logout', { refreshToken: tokens.refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setTokens({ accessToken: null, refreshToken: null });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  const value = {
    user,
    tokens,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

