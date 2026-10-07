'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  cpf: string;
  role: string;
  internalRole: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  token: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const LocalAuthProvider = ({ children }: { children: React.NewNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setIsInitialized(true);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('http://localhost:3001/api/auth/local/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao realizar login');
    }

    const data = await response.json();
    setToken(data.token);
    setUser({ ...data.user, internalRole: data.user.role });
    setIsAuthenticated(true);

    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify({ ...data.user, internalRole: data.user.role }));
  };

  const register = async (userData: any) => {
    const response = await fetch('http://localhost:3001/api/auth/local/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao realizar cadastro');
    }

    // After success, user should login
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isInitialized, user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useLocalAuth = () => useContext(AuthContext);
