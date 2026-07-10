"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "./api";
import type { TokenResponse, User } from "./types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  authModalOpen: boolean;
  authModalMode: "login" | "signup";
  openAuthModal: (mode?: "login" | "signup") => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  becomeHost: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");

  const refreshUser = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("airbnb_token") : null;
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api.get<User>("/api/auth/me");
      setUser(me);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        localStorage.removeItem("airbnb_token");
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const applyToken = (res: TokenResponse) => {
    localStorage.setItem("airbnb_token", res.access_token);
    setUser(res.user);
  };

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<TokenResponse>("/api/auth/login", { email, password });
    applyToken(res);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.post<TokenResponse>("/api/auth/signup", { name, email, password });
    applyToken(res);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("airbnb_token");
    setUser(null);
  }, []);

  const becomeHost = useCallback(async () => {
    const updated = await api.patch<User>("/api/auth/become-host");
    setUser(updated);
  }, []);

  const openAuthModal = useCallback((mode: "login" | "signup" = "login") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => setAuthModalOpen(false), []);

  const value = useMemo(
    () => ({
      user,
      loading,
      authModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal,
      login,
      signup,
      logout,
      becomeHost,
      refreshUser,
    }),
    [user, loading, authModalOpen, authModalMode, openAuthModal, closeAuthModal, login, signup, logout, becomeHost, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
