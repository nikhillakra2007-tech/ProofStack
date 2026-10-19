"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserRole, UserSession } from "@/lib/types";
import { getStoredSession, setStoredSession, clearStoredSession, JUDGE_PRESETS } from "@/lib/auth";
import { ROLES } from "@/lib/roles";

interface AuthContextType {
  session: UserSession | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  role: UserRole;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isDeveloper: boolean;
  isAuditor: boolean;
  canExecuteCode: boolean;
  canOverridePolicy: boolean;
  loginAs: (role: UserRole) => UserSession;
  setSessionData: (session: UserSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const s = getStoredSession();
    setSession(s);
    setIsInitialized(true);

    // If no session and trying to view a protected page, redirect to /login
    // /home, /login, and / (for unauthenticated public landing) are public
    if (!s && pathname !== "/login" && pathname !== "/home" && pathname !== "/") {
      router.push("/login");
    }
  }, [pathname, router]);

  const role: UserRole = session?.role || "developer";
  const isAuthenticated = session !== null;

  const loginAs = (targetRole: UserRole): UserSession => {
    const preset = JUDGE_PRESETS.find((p) => p.role === targetRole) || JUDGE_PRESETS[0];
    const def = ROLES[targetRole] || ROLES.developer;
    const newSession: UserSession = {
      userId: `usr_${preset.role}`,
      tenantId: def.tenantUuid,
      email: preset.email,
      role: preset.role,
      token: `jwt_rs256_${preset.role}_token`,
      canOverridePolicy: preset.canOverridePolicy,
    };
    setStoredSession(newSession);
    setSession(newSession);
    return newSession;
  };

  const setSessionData = (newSession: UserSession) => {
    setStoredSession(newSession);
    setSession(newSession);
  };

  const logout = () => {
    clearStoredSession();
    setSession(null);
    router.push("/login");
  };

  const isSuperAdmin = role === "super_admin";
  const isAdmin = role === "admin" || role === "super_admin";
  const isDeveloper = role === "developer";
  const isAuditor = role === "auditor";
  const canExecuteCode = role === "super_admin" || role === "admin" || role === "developer";
  const canOverridePolicy = session?.canOverridePolicy ?? (role === "super_admin");

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated,
        isInitialized,
        role,
        isSuperAdmin,
        isAdmin,
        isDeveloper,
        isAuditor,
        canExecuteCode,
        canOverridePolicy,
        loginAs,
        setSessionData,
        logout,
      }}
    >
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
