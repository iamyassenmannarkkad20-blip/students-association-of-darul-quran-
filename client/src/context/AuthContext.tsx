import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../services/api';

export interface User {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'ORGANISATION_ADMIN' | 'STUDENT';
  fullName: string;
  profileSlug: string;
  classCode?: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (
    fullName: string,
    email: string,
    password: string,
    classCode: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await apiRequest('/auth/me');
      if (res.success && res.data) {
        setUser(res.data.user);
        setProfile(res.data.profile);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch {
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data) {
      setUser(res.data.user);
      await refreshUser();
      return { success: true, user: res.data.user };
    }

    return { success: false, error: res.error || 'Login failed.' };
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    classCode: string
  ) => {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password, classCode }),
    });

    if (res.success && res.data) {
      setUser(res.data.user);
      await refreshUser();
      return { success: true };
    }

    return { success: false, error: res.error || 'Registration failed.' };
  };

  const logout = async () => {
    await apiRequest('/auth/logout', { method: 'POST' });
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
