"use client";
// src/components/layout/PortalShell.tsx
// Sidebar navigation + top header. Responsive: sidebar collapses on mobile.

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Megaphone, BookOpen, FileText,
  LogOut, Menu, X, GraduationCap, ChevronRight, Bell, Users, DollarSign, Mail
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Role } from "@/data/mockData";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: Role[];
}

const NAV: NavItem[] = [
  { label: "Dashboard",    href: "/dashboard",                    icon: <LayoutDashboard size={18}/>, roles: ["admin","teacher","student"] },
  { label: "Announcements",href: "/admin/announcements",          icon: <Megaphone size={18}/>,       roles: ["admin"] },
  { label: "Announcements",href: "/student/announcements",        icon: <Bell size={18}/>,            roles: ["student"] },
  { label: "Homework",     href: "/teacher/homework",             icon: <BookOpen size={18}/>,        roles: ["teacher"] },
  { label: "Homework",     href: "/student/homework",             icon: <BookOpen size={18}/>,        roles: ["student"] },
  { label: "Report Cards", href: "/admin/report-cards",           icon: <img src="/assets/slogo.png" alt="" style={{ width: 18, height: 18, objectFit: "contain" }} />, roles: ["admin"] },
  { label: "Report Cards", href: "/teacher/report-cards",         icon: <img src="/assets/slogo.png" alt="" style={{ width: 18, height: 18, objectFit: "contain" }} />, roles: ["teacher"] },
  // HRM Module (Admin only)
  { label: "Employees",    href: "/admin/hrm/employees",          icon: <Users size={18}/>,           roles: ["admin"] },
  { label: "Payroll Configuration", href: "/admin/hrm/payroll-config", icon: <DollarSign size={18}/>, roles: ["admin"] },
  { label: "Payslips",     href: "/admin/hrm/payslips",           icon: <Mail size={18}/>,            roles: ["admin"] },
];

export default function PortalShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const userNav = user ? NAV.filter(n => n.roles.includes(user.role)) : [];
  const roleLabel = user?.role === "admin" ? "Administrator"
    : user?.role === "teacher" ? "Teaching Staff"
    : "Student";

  const roleColor = user?.role === "admin" ? "#C9A84C"
    : user?.role === "teacher" ? "#D4A843"
    : "#FFFFFF";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* ── Overlay (mobile) ── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            zIndex: 40, display: "none"
          }}
          className="mobile-overlay"
        />
      )}

      {/* ── Sidebar ── */}
      <aside style={{
        width: 260, background: "#1A2554", color: "var(--white)",
        display: "flex", flexDirection: "column",
        position: "fixed", inset: "0 auto 0 0", zIndex: 50,
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.25s ease",
        boxShadow: "var(--shadow-sidebar)",
      }} className="sidebar">
        {/* Logo */}
        <div style={{
          padding: "var(--sp-6) var(--sp-6) var(--sp-5)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", marginBottom: "var(--sp-2)" }}>
            <div style={{
              width: 40, height: 40, borderRadius: "var(--r-sm)",
              background: "#1E2B63", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
              border: "1.5px solid #C9A84C"
            }}>
              <img src="/assets/slogo.png" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", lineHeight: 1.2 }}>
                Narty Rock
              </div>
              <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.55)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Private School
              </div>
            </div>
          </div>
        </div>

        {/* User badge */}
        {user && (
          <div style={{
            padding: "var(--sp-4) var(--sp-6)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "#1E2B63",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 600, fontSize: "0.78rem", color: "#C9A84C",
                border: "1.5px solid rgba(201,168,76,0.4)",
              }}>
                {user.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "white" }}
                  className="truncate">{user.name}</div>
                <div style={{ fontSize: "0.7rem", color: roleColor, fontWeight: 500 }}>{roleLabel}</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "var(--sp-4) var(--sp-3)", overflowY: "auto" }}>
          <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em",
            textTransform: "uppercase", padding: "var(--sp-2) var(--sp-3)", marginBottom: "var(--sp-2)" }}>
            Navigation
          </div>
          {userNav.map((item, idx) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const isHrmSection = item.label === "Employees" || item.label === "Payroll Configuration" || item.label === "Payslips";
            const showHrmDivider = idx > 0 && isHrmSection && !userNav[idx-1].label.includes("Employee") && !userNav[idx-1].label.includes("Payroll");
            return (
              <div key={item.href}>
                {showHrmDivider && <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", margin: "var(--sp-3) 0" }} />}
                <div style={{ position: "relative" }}>
                  {active && <div style={{
                    position: "absolute", left: 0, top: 0, bottom: 0,
                    width: "3px", background: "#C9A84C", borderRadius: "0 3px 3px 0",
                  }} />}
                  <Link href={item.href} onClick={() => setOpen(false)}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: "var(--sp-3)",
                      padding: "var(--sp-3) var(--sp-3) var(--sp-3) var(--sp-3)",
                      marginBottom: "var(--sp-1)", borderRadius: "var(--r-sm)",
                      background: active ? "rgba(201,168,76,0.15)" : "transparent",
                      color: active ? "#C9A84C" : "rgba(255,255,255,0.6)",
                      transition: "all var(--t-fast)",
                      fontSize: "0.88rem", fontWeight: active ? 600 : 500,
                      cursor: "pointer",
                    }}
                      onMouseEnter={e => {
                        if (!active) {
                          e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                          e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                        }
                      }}
                      onMouseLeave={e => {
                        if (!active) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                        }
                      }}
                    >
                      {item.icon}
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {active && <ChevronRight size={14} style={{ color: "#C9A84C" }} />}
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: "var(--sp-4) var(--sp-3)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={logout} style={{
            display: "flex", alignItems: "center", gap: "var(--sp-3)",
            width: "100%", padding: "var(--sp-3) var(--sp-3)",
            borderRadius: "var(--r-sm)", background: "transparent",
            color: "rgba(255,255,255,0.5)", fontSize: "0.88rem",
            transition: "all var(--t-fast)",
          }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(192,57,43,0.2)", e.currentTarget.style.color = "#e74c3c")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent", e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div style={{ flex: 1, marginLeft: 260, display: "flex", flexDirection: "column", minHeight: "100vh" }}
        className="main-content">
        {/* Top bar */}
        <header style={{
          height: 64, background: "var(--white)", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", padding: "0 var(--sp-8)",
          position: "sticky", top: 0, zIndex: 30,
          boxShadow: "0 1px 8px rgba(26,58,42,0.06)",
        }}>
          <button onClick={() => setOpen(!open)} className="menu-btn" style={{
            display: "none", background: "transparent", padding: "var(--sp-2)",
            color: "#1A2554", marginRight: "var(--sp-4)",
          }}>
            {open ? <X size={22}/> : <Menu size={22}/>}
          </button>
          
          {/* Logo in header */}
          <div style={{
            width: 32, height: 32, borderRadius: "var(--r-sm)",
            background: "#1E2B63", display: "flex", alignItems: "center", justifyContent: "center",
            marginRight: "var(--sp-3)", flexShrink: 0,
            overflow: "hidden",
            border: "1px solid #C9A84C"
          }}>
            <img src="/assets/slogo.png" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          
          <div style={{ flex: 1 }}>
            <span style={{
              fontFamily: "var(--font-display)", fontSize: "1.1rem",
              color: "#1A2554", fontWeight: 600,
            }}>
              Narty Rock Private School
            </span>
            <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)", marginLeft: "var(--sp-3)" }}>
              Student & Staff Portal
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}>
            <div style={{
              padding: "var(--sp-1) var(--sp-3)", borderRadius: 99,
              background: "rgba(26,37,84,0.08)", fontSize: "0.75rem",
              fontWeight: 500, color: "#1A2554",
            }}>
              Academic Year 2026
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: "var(--sp-8)", maxWidth: 1200 }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar { width: 260px !important; }
          .main-content { margin-left: 0 !important; }
          .menu-btn { display: flex !important; }
          .mobile-overlay { display: block !important; }
        }
        @media (min-width: 769px) {
          .sidebar { transform: translateX(0) !important; }
        }
        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      `}</style>
    </div>
  );
}
