import * as SecureStore from 'expo-secure-store';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { login, AuthSession, validateSession } from '@/lib/api';

const sessionKey = 'ibag-one.session';

type AuthContextValue = {
  session: AuthSession | null;
  isRestoring: boolean;
  signIn: (username: string, password: string, remember: boolean) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    let active = true;
    void SecureStore.getItemAsync(sessionKey)
      .then(async (stored) => {
        if (!stored) return;
        const saved = JSON.parse(stored) as AuthSession;
        await validateSession(saved.access_token);
        if (active) setSession(saved);
      })
      .catch(() => SecureStore.deleteItemAsync(sessionKey))
      .finally(() => { if (active) setIsRestoring(false); });
    return () => { active = false; };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    isRestoring,
    async signIn(username, password, remember) {
      const nextSession = await login(username, password);
      setSession(nextSession);
      if (remember) await SecureStore.setItemAsync(sessionKey, JSON.stringify(nextSession));
      else await SecureStore.deleteItemAsync(sessionKey);
    },
    async signOut() {
      setSession(null);
      await SecureStore.deleteItemAsync(sessionKey);
    },
  }), [isRestoring, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return value;
}
