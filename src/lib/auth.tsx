"use client";
// src/lib/auth.tsx
// Simple mock auth with React context. Replace with NextAuth in production.

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, MOCK_SESSIONS } from "@/data/mockData";

interface AuthContextValue {
  user: User | null;
  login: (sessionKey: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: () => {},
  logout: () => {},
});

const SESSION_KEY = "nrps_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved && MOCK_SESSIONS[saved]) {
      setUser(MOCK_SESSIONS[saved]);
    }
  }, []);

  const login = (key: string) => {
    const found = MOCK_SESSIONS[key];
    if (found) {
      setUser(found);
      localStorage.setItem(SESSION_KEY, key);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
