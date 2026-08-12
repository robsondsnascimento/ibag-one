import * as SecureStore from 'expo-secure-store';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { login, AuthSession, validateSession } from '@/lib/api';

const sessionKey = 'ibag-one.session';

async function getStoredSession() {
  if (Platform.OS === 'web') {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(sessionKey);
  }
  return SecureStore.getItemAsync(sessionKey);
}

async function storeSession(value: string) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.localStorage.setItem(sessionKey, value);
    return;
  }
  await SecureStore.setItemAsync(sessionKey, value);
}

async function removeStoredSession() {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.localStorage.removeItem(sessionKey);
    return;
  }
  await SecureStore.deleteItemAsync(sessionKey);
}

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
    void getStoredSession()
      .then(async (stored) => {
        if (!stored) return;
        const saved = JSON.parse(stored) as AuthSession;
        await validateSession(saved.access_token);
        if (active) setSession(saved);
      })
      .catch(() => removeStoredSession())
      .finally(() => { if (active) setIsRestoring(false); });
    return () => { active = false; };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    isRestoring,
    async signIn(username, password, remember) {
      const nextSession = await login(username, password);
      setSession(nextSession);
      if (remember) await storeSession(JSON.stringify(nextSession));
      else await removeStoredSession();
    },
    async signOut() {
      setSession(null);
      await removeStoredSession();
    },
  }), [isRestoring, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return value;
}
