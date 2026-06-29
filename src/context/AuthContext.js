import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client, { TOKEN_KEY, registerUnauthHandler } from '../api/client';
import { clearAllCache } from '../api/cache';

// Token refresh: 6 days (safe for 7-day server-side expiry)
const REFRESH_INTERVAL_MS = 6 * 24 * 60 * 60 * 1000;

// TOKEN → SecureStore (short string, safe under 2048-byte iOS limit)
// USER  → AsyncStorage (no size limit — user JSON can be several KB)
const USER_KEY = 'dropstore_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Logout ────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try { await client.post('/auth/logout'); } catch (_) {}
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    await AsyncStorage.removeItem(USER_KEY).catch(() => {});
    await clearAllCache();
    setToken(null);
    setUser(null);
  }, []);

  // Register logout as the 401 handler
  useEffect(() => {
    registerUnauthHandler(logout);
  }, [logout]);

  // ── Bootstrap: restore session ────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const t = await SecureStore.getItemAsync(TOKEN_KEY).catch(() => null);
        const u = await AsyncStorage.getItem(USER_KEY).catch(() => null);
        if (t && u) {
          setToken(t);
          setUser(JSON.parse(u));
        }
      } catch {
        // Corrupted storage — start fresh
        await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
        await AsyncStorage.removeItem(USER_KEY).catch(() => {});
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Proactive token refresh ────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    const id = setInterval(async () => {
      try {
        const res = await client.post('/auth/refresh');
        const newToken = res.data.token;
        await SecureStore.setItemAsync(TOKEN_KEY, newToken);
        setToken(newToken);
      } catch {
        // 401 interceptor handles cleanup
      }
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [token]);

  // ── Auth actions ───────────────────────────────────────────────
  const login = async (identifier, password) => {
    const res = await client.post('/auth/login', { identifier, password });
    const { token: tok, user: usr } = res.data;
    await SecureStore.setItemAsync(TOKEN_KEY, tok);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(usr));
    setToken(tok);
    setUser(usr);
    return usr;
  };

  const register = async (data) => {
    const res = await client.post('/auth/register', data);
    const { token: tok, user: usr } = res.data;
    await SecureStore.setItemAsync(TOKEN_KEY, tok);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(usr));
    setToken(tok);
    setUser(usr);
    return usr;
  };

  const refreshUser = async () => {
    const res = await client.get('/auth/me');
    const usr = res.data;
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(usr));
    setUser(usr);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
