"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/lib/theme";
import { ROLES, TENANT_UUID } from "@/lib/roles";
import { UserRole } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

const roleIcons: Record<UserRole, React.ReactNode> = {
  super_admin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  admin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  developer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  auditor: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
};

const roleDescriptions: Record<UserRole, { title: string; desc: string; route: string }> = {
  super_admin: { title: "Super Admin", desc: "Full control plane access", route: "/cockpit/TASK9142" },
  admin: { title: "Admin", desc: "Management & budget oversight", route: "/control-plane" },
  developer: { title: "Lead Developer", desc: "Studio, patches & DAST scans", route: "/studio" },
  auditor: { title: "Security Auditor", desc: "Ledger verification & audit", route: "/ledger" },
};

export default function LoginPage() {
  const router = useRouter();
  const { loginAs, setSessionData } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [selectedRole, setSelectedRole] = useState<UserRole>("super_admin");
  const [email, setEmail] = useState<string>(ROLES.super_admin.email);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRbacModalOpen, setIsRbacModalOpen] = useState<boolean>(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(ROLES[role].email);
  };

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const def = ROLES[selectedRole];
      setSessionData({
        userId: `usr_${def.role}`,
        tenantId: def.tenantUuid,
        email: email,
        role: def.role,
        token: `jwt_rs256_${def.role}_token`,
        canOverridePolicy: def.canOverridePolicy,
      });
      router.push("/");
    }, 600);
  };

  return (
    <div className="login-page">
      <div className="login-bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="login-grid">
        <motion.div
          className="login-brand-panel"
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="login-brand-header">
            <div className="login-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <div>
              <span className="login-brand-name">ProofStack</span>
              <span className="login-brand-tag">Autonomous DevSecOps</span>
            </div>
          </div>

          <div className="login-hero">
            <span className="login-eyebrow">Cockpit Access</span>
            <h1 className="login-title">
              Verify.<br />Protect.<br />Prove.
            </h1>
            <p className="login-subtitle">
              Autonomous verification engine that tests every patch against
              correctness, performance, and security gates — sealed on a
              tamper-evident hash chain.
            </p>
          </div>

          <div className="login-chain-visual" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="chain-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.12, duration: 0.5 }}
              >
                <div className="chain-block-header">
                  <span>BLOCK #{i}</span>
                  <span className="chain-block-status">VERIFIED</span>
                </div>
                <div className="chain-block-hash">
                  {["8f4b238e89c1…", "318cb92931ea…", "45a89df0123b…", "e89012389012…"][i]}
                </div>
              </motion.div>
            ))}
            <div className="chain-line" />
          </div>

          <p className="login-chain-caption">SHA-256 hash chain · every verdict is append-only</p>
        </motion.div>

        <motion.div
          className="login-form-panel"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="login-top-bar">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => router.push("/home")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Public Site
            </button>
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {resolvedTheme === "light" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4.5 h-4.5">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4.5 h-4.5">
                  <circle cx="12" cy="12" r="4" />
                  <line x1="12" y1="2" x2="12" y2="4" />
                  <line x1="12" y1="20" x2="12" y2="22" />
                  <line x1="4.9" y1="4.9" x2="6.3" y2="6.3" />
                  <line x1="17.7" y1="17.7" x2="19.1" y2="19.1" />
                  <line x1="2" y1="12" x2="4" y2="12" />
                  <line x1="20" y1="12" x2="22" y2="12" />
                  <line x1="4.9" y1="19.1" x2="6.3" y2="17.7" />
                  <line x1="17.7" y1="6.3" x2="19.1" y2="4.9" />
                </svg>
              )}
            </button>
          </div>

          <div className="login-form-content">
            <div className="login-badges">
              <span className="badge-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Judge Access
              </span>
              <button
                type="button"
                className="badge-outline"
                onClick={() => setIsRbacModalOpen(true)}
              >
                RBAC Matrix ↗
              </button>
            </div>

            <h2 className="login-heading">Sign in</h2>
            <p className="login-desc">
              Select a verified role to authenticate instantly with dedicated workspaces.
            </p>

            <form onSubmit={handleAuthenticate}>
              <div className="role-list">
                {(Object.keys(roleDescriptions) as UserRole[]).map((role, i) => (
                  <motion.div
                    key={role}
                    className={`role-card ${selectedRole === role ? "role-card-active" : ""}`}
                    onClick={() => handleRoleSelect(role)}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="role-radio">
                      {selectedRole === role && (
                        <motion.div
                          layoutId="roleRadio"
                          className="role-radio-dot"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </div>
                    <div className="role-icon">{roleIcons[role]}</div>
                    <div className="role-info">
                      <div className="role-name">{roleDescriptions[role].title}</div>
                      <div className="role-desc">{roleDescriptions[role].desc}</div>
                    </div>
                    <div className="role-route">{roleDescriptions[role].route}</div>
                  </motion.div>
                ))}
              </div>

              <div className="login-fields">
                <div className="field-group">
                  <label>TENANT BOUNDARY (UUID)</label>
                  <div className="input-readonly">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>{ROLES[selectedRole].tenantUuid}</span>
                  </div>
                </div>

                <div className="field-row">
                  <div className="field-group">
                    <label htmlFor="principal-email">EMAIL</label>
                    <div className="input-wrapper">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <input
                        id="principal-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="field-group">
                    <label>ROLE</label>
                    <div className="input-readonly">
                      <span>{roleDescriptions[selectedRole].title}</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <motion.button
                type="submit"
                className="btn-authenticate"
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <span className="loading-spinner">Authenticating…</span>
                ) : (
                  <>
                    Authenticate
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </motion.button>
            </form>

            <div className="login-notice">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span><b>Locked Decision D13:</b> Cross-tenant access returns HTTP 404.</span>
            </div>
          </div>

          <div className="login-footer">
            <span>ProofStack v1.0</span>
            <span>Nemotron-3 Super 120B · Nebius Token Factory</span>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isRbacModalOpen && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsRbacModalOpen(false)}
          >
            <motion.div
              className="modal-card"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <span className="modal-eyebrow">Enterprise Governance</span>
                  <h3 className="modal-title">4-Tier RBAC Matrix</h3>
                </div>
                <button className="modal-close" onClick={() => setIsRbacModalOpen(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="modal-table-wrap">
                <table className="rbac-table">
                  <thead>
                    <tr>
                      <th>Capability</th>
                      <th>Super Admin</th>
                      <th>Admin</th>
                      <th>Developer</th>
                      <th>Auditor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><b>Tenant Scope</b></td>
                      <td><span className="chip-brand">Global Root</span></td>
                      <td><span className="chip-default">Operations</span></td>
                      <td><span className="chip-default">Sandbox</span></td>
                      <td><span className="chip-default">Compliance</span></td>
                    </tr>
                    <tr>
                      <td><b>Studio &amp; Code</b></td>
                      <td className="text-pass">✓ Full execution</td>
                      <td className="text-pass">✓ Full execution</td>
                      <td className="text-pass">✓ Full execution</td>
                      <td className="text-fail">✗ View-only</td>
                    </tr>
                    <tr>
                      <td><b>DAST Scans</b></td>
                      <td className="text-pass">✓ Active scans</td>
                      <td className="text-pass">✓ Active scans</td>
                      <td className="text-pass">✓ Active scans</td>
                      <td className="text-fail">✗ View-only</td>
                    </tr>
                    <tr>
                      <td><b>Policy Override</b></td>
                      <td className="text-pass">✓ Enabled</td>
                      <td className="text-fail">✗ Locked</td>
                      <td className="text-fail">✗ Locked</td>
                      <td className="text-fail">✗ Locked</td>
                    </tr>
                    <tr>
                      <td><b>Token Budget</b></td>
                      <td className="mono">120,000 / Unlimited</td>
                      <td className="mono">50,000 / Manage</td>
                      <td className="mono">80,000 / Task</td>
                      <td className="mono">30,000 / Audit</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
