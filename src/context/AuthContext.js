import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import client, { TOKEN_KEY, registerUnauthHandler } from '../api/client';
import { clearAllCache } from '../api/cache';

// Token refresh schedule: refresh 5 minutes before SANCTUM_TOKEN_EXPIRATION.
// If you set SANCTUM_TOKEN_EXPIRATION=10080 (7 days) in .env, refresh every ~6.9 days.
// Default here is 6 days (in ms) which is safe for a 7-day server-side expiry.
const REFRESH_INTERVAL_MS = 6 * 24 * 60 * 60 * 1000; // 6 days
const USER_KEY = 'dropstore_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Logout (also called by 401 interceptor) ───────────────────
  const logout = useCallback(async () => {
    try { await client.post('/auth/logout'); } catch (_) {}
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    await clearAllCache();
    setToken(null);
    setUser(null);
  }, []);

  // Register logout as the 401 handler so the axios interceptor can call it
  useEffect(() => {
    registerUnauthHandler(logout);
  }, [logout]);

  // ── Bootstrap: restore session from secure storage ────────────
  useEffect(() => {
    (async () => {
      try {
        const t = await SecureStore.getItemAsync(TOKEN_KEY);
        const u = await SecureStore.getItemAsync(USER_KEY);
        if (t && u) {
          setToken(t);
          setUser(JSON.parse(u));
        }
      } catch {
        // Corrupted storage — start fresh
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Proactive token refresh ────────────────────────────────────
  // Runs on a timer so the token is rotated before the server expires it.
  // Only active while the user is logged in.
  useEffect(() => {
    if (!token) return;
    const id = setInterval(async () => {
      try {
        const res = await client.post('/auth/refresh');
        const newToken = res.data.token;
        await SecureStore.setItemAsync(TOKEN_KEY, newToken);
        setToken(newToken);
      } catch {
        // Refresh failed — the 401 interceptor in client.js will handle cleanup
      }
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [token]);

  // ── Auth actions ───────────────────────────────────────────────
  const login = async (identifier, password) => {
    const res = await client.post('/auth/login', { identifier, password });
    const { token: tok, user: usr } = res.data;
    await SecureStore.setItemAsync(TOKEN_KEY, tok);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(usr));
    setToken(tok);
    setUser(usr);
    return usr;
  };

  const register = async (data) => {
    const res = await client.post('/auth/register', data);
    const { token: tok, user: usr } = res.data;
    await SecureStore.setItemAsync(TOKEN_KEY, tok);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(usr));
    setToken(tok);
    setUser(usr);
    return usr;
  };

  const refreshUser = async () => {
    const res = await client.get('/auth/me');
    const usr = res.data;
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(usr));
    setUser(usr);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

