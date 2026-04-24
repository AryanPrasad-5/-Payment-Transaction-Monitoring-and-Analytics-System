import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing token on mount
    const savedToken = Cookies.get('dashboard_auth_token');
    const savedUser = Cookies.get('dashboard_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user cookie", e);
      }
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    // Expire in 1 day matching backend JWT. Secure only in production to allow localhost testing
    const isProd = import.meta.env.PROD;
    Cookies.set('dashboard_auth_token', newToken, { expires: 1, secure: isProd, sameSite: 'strict' });
    Cookies.set('dashboard_user', JSON.stringify(newUser), { expires: 1, secure: isProd, sameSite: 'strict' });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    Cookies.remove('dashboard_auth_token');
    Cookies.remove('dashboard_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
