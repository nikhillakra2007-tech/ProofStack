"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserRole, UserSession, ROLES, PRESET_USERS, getStoredSession, setStoredSession, clearStoredSession } from "@/lib/auth";

interface AuthContextType {
  session: UserSession | null;
  user: UserSession | null;
  isAuthenticated: boolean;
  role: UserRole;
  login: (email: string, role?: UserRole) => UserSession;
  loginAs: (role: UserRole) => UserSession;
  switchRole: (role: UserRole) => UserSession;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    const s = getStoredSession();
    if (s) {
      setSession(s);
    }
  }, []);

  const login = (email: string, targetRole: UserRole = "developer"): UserSession => {
    const preset = PRESET_USERS.find((p) => p.role === targetRole) || PRESET_USERS[0];
    const roleDef = ROLES[targetRole];
    const newSession: UserSession = {
      userId: `usr_${targetRole}`,
      tenantId: "00000000-0000-0000-0000-000000000001",
      email: email || preset.email,
      role: targetRole,
      token: `jwt_sentinel_${targetRole}_signed`,
      canOverridePolicy: roleDef.canOverridePolicy,
    };
    setStoredSession(newSession);
    setSession(newSession);
    return newSession;
  };

  const loginAs = (targetRole: UserRole): UserSession => {
    return login("", targetRole);
  };

  const switchRole = (targetRole: UserRole): UserSession => {
    return login("", targetRole);
  };

  const logout = () => {
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
