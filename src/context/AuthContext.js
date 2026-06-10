import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import client, { TOKEN_KEY, registerUnauthHandler } from '../api/client';
import { clearAllCache } from '../api/cache';

const REFRESH_INTERVAL_MS = 6 * 24 * 60 * 60 * 1000; // 6 days
const USER_KEY = 'dropstore_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Safe SecureStore helpers to prevent iOS Simulator crash ──
  const safeSetItem = async (key, value) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.warn(`[Auth] SecureStore.setItem failed for ${key}:`, e.message);
    }
  };

  const safeGetItem = async (key) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.warn(`[Auth] SecureStore.getItem failed for ${key}:`, e.message);
      return null;
    }
  };

  const safeDeleteItem = async (key) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.warn(`[Auth] SecureStore.deleteItem failed for ${key}:`, e.message);
    }
  };

  // ── Logout ───────────────────
  const logout = useCallback(async () => {
    try { 
      await client.post('/auth/logout'); 
    } catch (_) {}
    
    delete client.defaults.headers.common['Authorization'];
    
    await safeDeleteItem(TOKEN_KEY);
    await safeDeleteItem(USER_KEY);
    
    try { await clearAllCache(); } catch (_) {}
    
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    registerUnauthHandler(logout);
  }, [logout]);

  // ── Bootstrap: restore session ────────────
  useEffect(() => {
    (async () => {
      try {
        const t = await safeGetItem(TOKEN_KEY);
        const u = await safeGetItem(USER_KEY);
        
        if (t && u) {
          client.defaults.headers.common['Authorization'] = `Bearer ${t}`;
          setToken(t);
          try {
            setUser(JSON.parse(u));
          } catch {
            await safeDeleteItem(USER_KEY);
          }
        }
      } catch (e) {
        console.warn('[DropStore Auth] Bootstrap error:', e);
        await safeDeleteItem(TOKEN_KEY);
        await safeDeleteItem(USER_KEY);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Token refresh ────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    const id = setInterval(async () => {
      try {
        const res = await client.post('/auth/refresh');
        const newToken = res.data.token;
        
        client.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        await safeSetItem(TOKEN_KEY, newToken);
        setToken(newToken);
      } catch {
        // 401 interceptor handles logout
      }
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [token]);

  // ── Auth actions ───────────────────────────────────────────────
  const login = async (emailOrUsername, password) => {
    try {
      const res = await client.post('/auth/login', { 
        identifier: emailOrUsername, 
        email: emailOrUsername,
        password 
      });
      
      const { token: tok, user: usr } = res.data;
      
      if (tok && usr) {
        client.defaults.headers.common['Authorization'] = `Bearer ${tok}`;
        
        await safeSetItem(TOKEN_KEY, tok);
        await safeSetItem(USER_KEY, JSON.stringify(usr));
        
        setToken(tok);
        setUser(usr);
        return usr;
      } else {
        throw new Error("Malformed login response from server.");
      }
    } catch (e) {
      console.log('LOGIN ERROR:', e?.response?.status, e?.response?.data, e?.message);
      throw e; // Let LoginScreen show Alert
    }
  };

  const register = async (data) => {
    try {
      const res = await client.post('/auth/register', data);
      const { token: tok, user: usr } = res.data;
      
      if (tok && usr) {
        client.defaults.headers.common['Authorization'] = `Bearer ${tok}`;
        await safeSetItem(TOKEN_KEY, tok);
        await safeSetItem(USER_KEY, JSON.stringify(usr));
        setToken(tok);
        setUser(usr);
        return usr;
      } else {
        throw new Error("Malformed registration response from server.");
      }
    } catch (e) {
      console.log('REGISTER ERROR:', e?.response?.status, e?.response?.data, e?.message);
      throw e;
    }
  };

  const refreshUser = async () => {
    try {
      const res = await client.get('/auth/me');
      const usr = res.data;
      await safeSetItem(USER_KEY, JSON.stringify(usr));
      setUser(usr);
    } catch (e) {
      console.log('Refresh user error:', e?.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);