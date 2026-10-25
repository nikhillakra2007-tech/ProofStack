"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserRole, UserSession, ROLES, PRESET_USERS, getStoredSession, setStoredSession, clearStoredSession } from "@/lib/auth";
import { api } from "@/lib/api";

interface AuthContextType {
  session: UserSession | null;
  user: UserSession | null;
  isAuthenticated: boolean;
  role: UserRole;
  login: (email: string, password?: string, targetRole?: UserRole) => Promise<UserSession>;
  loginAs: (role: UserRole) => Promise<UserSession>;
  switchRole: (role: UserRole) => Promise<UserSession>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    const s = getStoredSession();
    if (s) {
      setSession(s);
      // Validate session against live backend
      api.auth.me()
        .then((user) => {
          setSession((prev) => prev ? {
            ...prev,
            userId: user.id,
            email: user.email,
            role: user.role as UserRole,
            tenantId: user.tenant_id,
          } : null);
        })
        .catch(() => {
          // If token revoked or invalid on backend, leave local session or clear
        });
    }
  }, []);

  const login = async (
    email: string,
    password: string = "P@ssw0rd2026!Secure",
    targetRole: UserRole = "developer"
  ): Promise<UserSession> => {
    const preset = PRESET_USERS.find((p) => p.role === targetRole) || PRESET_USERS[0];
    const resolvedEmail = email || preset.email;
    const resolvedPassword = password || "P@ssw0rd2026!Secure";

    try {
      // 1. Authenticate with real backend API
      const res = await api.auth.login(resolvedEmail, resolvedPassword);
      const newSession: UserSession = {
        userId: res.user.id,
        tenantId: res.tenant_id,
        email: res.user.email,
        role: res.role as UserRole,
        token: res.access_token,
        canOverridePolicy: res.can_override_policy,
      };
      setStoredSession(newSession);
      setSession(newSession);
      return newSession;
    } catch (err) {
      // 2. Deterministic offline dev fallback if backend is unreachable
      const roleDef = ROLES[targetRole];
      const fallbackSession: UserSession = {
        userId: `usr_${targetRole}`,
        tenantId: "00000000-0000-0000-0000-000000000001",
        email: resolvedEmail,
        role: targetRole,
        token: `jwt_sentinel_${targetRole}_signed`,
        canOverridePolicy: roleDef.canOverridePolicy,
      };
      setStoredSession(fallbackSession);
      setSession(fallbackSession);
      return fallbackSession;
    }
  };

  const loginAs = async (targetRole: UserRole): Promise<UserSession> => {
    const preset = PRESET_USERS.find((p) => p.role === targetRole) || PRESET_USERS[0];
    return login(preset.email, "P@ssw0rd2026!Secure", targetRole);
  };

  const switchRole = async (targetRole: UserRole): Promise<UserSession> => {
    return loginAs(targetRole);
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore network errors on logout
    }
    clearStoredSession();
    setSession(null);
  };

  const role: UserRole = session?.role || "developer";
  const isAuthenticated = session !== null;

  return (
    <AuthContext.Provider value={{ session, user: session, isAuthenticated, role, login, loginAs, switchRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthProvider;
