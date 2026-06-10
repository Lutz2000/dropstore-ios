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

  // ── Logout (also called by 401 interceptor) ───────────────────
  const logout = useCallback(async () => {
    try { 
      await client.post('/auth/logout'); 
    } catch (_) {}
    
    // Clear token out of default Axios instances
    delete client.defaults.headers.common['Authorization'];
    
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
          // CRITICAL FIX: Re-attach the auth header to axios on app launch
          client.defaults.headers.common['Authorization'] = `Bearer ${t}`;
          setToken(t);
          setUser(JSON.parse(u));
        }
      } catch (e) {
        console.warn('[DropStore Auth] Corrupted storage — resetting fresh.', e);
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
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
        
        // Sync header configuration changes
        client.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        await SecureStore.setItemAsync(TOKEN_KEY, newToken);
        setToken(newToken);
      } catch {
        // Refresh failed — the 401 interceptor in client.js handles cleanup
      }
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [token]);

  // ── Auth actions ───────────────────────────────────────────────
  const login = async (emailOrUsername, password) => {
    // CRITICAL FIX: Accepts standard string identifier inputs cleanly
    const res = await client.post('/auth/login', { 
      identifier: emailOrUsername, 
      email: emailOrUsername, // Backup payload entry to support both backend setups safely
      password 
    });
    
    const { token: tok, user: usr } = res.data;
    
    if (tok && usr) {
      // CRITICAL FIX: Immediately mount token to axios to stop 401 instant logouts
      client.defaults.headers.common['Authorization'] = `Bearer ${tok}`;
      
      await SecureStore.setItemAsync(TOKEN_KEY, tok);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(usr));
      setToken(tok);
      setUser(usr);
      return usr;
    } else {
      throw new Error("Malformed login structure received from backend.");
    }
  };

  const register = async (data) => {
    const res = await client.post('/auth/register', data);
    const { token: tok, user: usr } = res.data;
    
    if (tok && usr) {
      client.defaults.headers.common['Authorization'] = `Bearer ${tok}`;
      await SecureStore.setItemAsync(TOKEN_KEY, tok);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(usr));
      setToken(tok);
      setUser(usr);
      return usr;
    } else {
      throw new Error("Malformed registration structure received from backend.");
    }
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