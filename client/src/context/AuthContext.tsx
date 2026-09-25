import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../services/api';

export interface AssignedSubWing {
  id: string;
  code: string;
  name: string;
  leadership_role: string;
}

export interface User {
  id: string;
  email: string;
  username?: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'ORGANISATION_ADMIN' | 'STUDENT';
  fullName: string;
  profileSlug: string;
  classCode?: string | null;
  assignedSubWings?: AssignedSubWing[];
  assignedClassUnion?: any | null;
}

interface AuthContextType {
  user: User | null;
  profile: any | null;
  assignedSubWings: AssignedSubWing[];
  assignedClassUnion: any | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (
    fullName: string,
    email: string,
    password: string,
    classCode: string,
    username?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [assignedSubWings, setAssignedSubWings] = useState<AssignedSubWing[]>([]);
  const [assignedClassUnion, setAssignedClassUnion] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await apiRequest('/auth/me');
      if (res.success && res.data) {
        setUser(res.data.user);
        setProfile(res.data.profile);
        setAssignedSubWings(res.data.assignedSubWings || res.data.user?.assignedSubWings || []);
        setAssignedClassUnion(res.data.assignedClassUnion || res.data.user?.assignedClassUnion || null);
      } else {
        setUser(null);
        setProfile(null);
        setAssignedSubWings([]);
        setAssignedClassUnion(null);
      }
    } catch {
      setUser(null);
      setProfile(null);
      setAssignedSubWings([]);
      setAssignedClassUnion(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (identifier: string, password: string) => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
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
    classCode: string,
    username?: string
  ) => {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password, classCode, username }),
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
    <AuthContext.Provider value={{ user, profile, assignedSubWings, assignedClassUnion, loading, login, register, logout, refreshUser }}>
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
