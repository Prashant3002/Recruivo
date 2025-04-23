"use client"

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import useAuth from '@/lib/hooks/useAuth';

// Define the shape of the context
interface AuthContextType {
  user: {
    _id: string;
    name: string;
    email: string;
    role: 'student' | 'recruiter' | 'admin';
    avatar?: string;
  } | null;
  loading: boolean;
  error: string | null;
  login: (email?: string, password?: string) => Promise<any>;
  directLogin: (email: string, password: string) => Promise<any>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'recruiter';
  }) => Promise<any>;
  logout: () => Promise<void>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook to use the auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const auth = useAuth();
  
  // Add safe defaults to ensure no undefined values
  const safeAuth: AuthContextType = {
    user: auth.user,
    loading: auth.loading,
    error: auth.error,
    login: auth.login || (async () => Promise.reject(new Error('Auth not initialized'))),
    register: auth.register || (async () => Promise.reject(new Error('Auth not initialized'))),
    logout: auth.logout || (async () => Promise.reject(new Error('Auth not initialized'))),
    directLogin: auth.directLogin || (async () => Promise.reject(new Error('Auth not initialized')))
  };

  // Check authentication status on initial load
  useEffect(() => {
    let isMounted = true;
    
    const checkAuthStatus = async () => {
      try {
        await auth.checkAuth();
      } catch (error) {
        console.error("Auth check failed:", error);
      }
      
      if (isMounted) {
        setInitialized(true);
      }
    };

    checkAuthStatus();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only run once

  // Show loading state until auth is checked
  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={safeAuth}>
      {children}
    </AuthContext.Provider>
  );
} 