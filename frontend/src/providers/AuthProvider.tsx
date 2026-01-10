'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, AuthSession, initAuthSession } from '@/lib/auth';

interface AuthContextType {
  session: AuthSession;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession>({ token: null, user: null });
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = async () => {
    const currentSession = await auth();
    setSession(currentSession);
  };

  useEffect(() => {
    // Initialize auth session from localStorage on mount
    initAuthSession();

    // Load initial session
    refreshSession().finally(() => setIsLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading, refreshSession }}>
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
