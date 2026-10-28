"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserRole, UserSession } from "@/lib/types";
import { getStoredSession, setStoredSession, clearStoredSession, JUDGE_PRESETS } from "@/lib/auth";
import { ROLES, TeamMember, TEAM_MEMBERS, DEFAULT_MEMBER_BY_ROLE, getTeamMemberById } from "@/lib/roles";

interface AuthContextType {
  session: UserSession | null;
  activeMember: TeamMember;
  allMembers: TeamMember[];
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
  switchMember: (memberId: string) => UserSession;
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

  const activeMember: TeamMember = session?.memberId
    ? getTeamMemberById(session.memberId)
    : getTeamMemberById(DEFAULT_MEMBER_BY_ROLE[role] || "nitin-pandey");

  const loginAs = (targetRole: UserRole): UserSession => {
    const defaultMemberId = DEFAULT_MEMBER_BY_ROLE[targetRole] || "nitin-pandey";
    const member = getTeamMemberById(defaultMemberId);
    const def = ROLES[targetRole] || ROLES.developer;
    const newSession: UserSession = {
      userId: `usr_${member.id}`,
      memberId: member.id,
      name: member.name,
      avatar: member.avatar,
      tenantId: def.tenantUuid,
      email: member.email,
      role: targetRole,
      token: `jwt_rs256_${targetRole}_token`,
      canOverridePolicy: targetRole === "super_admin",
    };
    setStoredSession(newSession);
    setSession(newSession);
    return newSession;
  };

  const switchMember = (memberId: string): UserSession => {
    const member = getTeamMemberById(memberId);
    // Security check: Non-admin sessions can only switch between peer profiles of the exact same role
    if (session && session.role !== "super_admin" && session.role !== "admin" && member.role !== session.role) {
      console.warn("[AuthSecurity] Cross-role privilege escalation attempt blocked for non-admin session.");
      return session;
    }
    const def = ROLES[member.role] || ROLES.developer;
    const newSession: UserSession = {
      userId: `usr_${member.id}`,
      memberId: member.id,
      name: member.name,
      avatar: member.avatar,
      tenantId: def.tenantUuid,
      email: member.email,
      role: member.role,
      token: `jwt_rs256_${member.role}_token`,
      canOverridePolicy: member.role === "super_admin",
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
        activeMember,
        allMembers: TEAM_MEMBERS,
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
        switchMember,
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
