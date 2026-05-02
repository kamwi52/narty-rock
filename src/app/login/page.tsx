"use client";
// src/app/login/page.tsx
// Full-page login with role selector. Styled as a premium school portal entry.

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, BookOpen, Users } from "lucide-react";
import { useAuth } from "@/lib/auth";

const DEMO_ACCOUNTS = [
  {
    key: "admin",
    role: "Administrator",
    name: "Mr. Carlos",
    icon: <Shield size={20} />,
    accent: "#C9A84C",
    bg: "rgba(201,168,76,0.1)",
    description: "Full portal access — manage announcements, report cards & staff",
  },
  {
    key: "teacher_math",
    role: "Teacher — Mathematics",
    name: "Teacher Fein",
    icon: <BookOpen size={20} />,
    accent: "#D4A843",
    bg: "rgba(212,168,67,0.1)",
    description: "Post homework, enter student grades and generate report cards",
  },
  {
    key: "student_10a",
    role: "Student — Grade 1",
    name: "Thandeka Dube",
    icon: <Users size={20} />,
    accent: "#FFFFFF",
    bg: "rgba(255,255,255,0.1)",
    description: "View homework assignments, announcements and your report cards",
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState<string>("admin");

  const handleEnter = () => {
    login(selected);
    router.push("/dashboard");
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#1A2554",
      display: "flex", flexDirection: "column",
      position: "relative", overflow: "hidden",
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    }}>
      {/* Background pattern */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(201,168,76,0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(30,43,99,0.4) 0%, transparent 50%)
        `,
        pointerEvents: "none",
      }} />

      {/* Content */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "var(--sp-8)", position: "relative", zIndex: 1,
      }}>
        <div style={{ width: "100%", maxWidth: 460 }}>
          {/* Logo block */}
          <div style={{ textAlign: "center", marginBottom: "var(--sp-10)" }}>
            <div style={{
              width: 72, height: 72, borderRadius: 16,
              background: "#1E2B63", display: "inline-flex",
              alignItems: "center", justifyContent: "center",
              marginBottom: "var(--sp-5)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              position: "relative",
              overflow: "hidden",
              border: "2px solid #C9A84C"
            }}>
              {/* School Logo Placeholder */}
              <img src="/assets/slogo.png" alt="Logo"  style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <h1 style={{
              fontFamily: "var(--font-display)", color: "white",
              fontSize: "2rem", marginBottom: "var(--sp-2)", lineHeight: 1.2,
            }}>
              Narty Rock<br />
              <span style={{ color: "#C9A84C", fontStyle: "italic" }}>Private School</span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.88rem" }}>
              Student & Staff Portal — Academic Year 2026
            </p>
          </div>

          {/* Login card */}
          <div style={{
            background: "var(--white)", borderRadius: "var(--r-lg)",
            padding: "var(--sp-8)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
          }}>
            <h2 style={{ fontSize: "1.15rem", marginBottom: "var(--sp-2)" }}>Sign In to Portal</h2>
            <p style={{ fontSize: "0.83rem", color: "var(--ink-muted)", marginBottom: "var(--sp-6)" }}>
              Select a demo account to explore the portal
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)", marginBottom: "var(--sp-6)" }}>
              {DEMO_ACCOUNTS.map(acc => (
                <div
                  key={acc.key}
                  onClick={() => setSelected(acc.key)}
                  style={{
                    border: `2px solid ${selected === acc.key ? acc.accent : "var(--border)"}`,
                    borderRadius: "var(--r-md)", padding: "var(--sp-4)",
                    cursor: "pointer", transition: "all var(--t-fast)",
                    background: selected === acc.key ? acc.bg : "transparent",
                    display: "flex", alignItems: "flex-start", gap: "var(--sp-3)",
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: "var(--r-sm)",
                    background: acc.bg, display: "flex", alignItems: "center",
                    justifyContent: "center", color: acc.accent, flexShrink: 0,
                    border: `1px solid ${acc.accent}30`,
                  }}>
                    {acc.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: 2 }}>{acc.name}</div>
                    <div style={{ fontSize: "0.77rem", color: acc.accent, fontWeight: 500, marginBottom: 4 }}>{acc.role}</div>
                    <div style={{ fontSize: "0.76rem", color: "var(--ink-muted)", lineHeight: 1.4 }}>{acc.description}</div>
                  </div>
                  {selected === acc.key && (
                    <div style={{
                      marginLeft: "auto", width: 20, height: 20, borderRadius: "50%",
                      background: acc.accent, display: "flex", alignItems: "center",
                      justifyContent: "center", flexShrink: 0,
                    }}>
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleEnter}
              style={{
                width: "100%", padding: "var(--sp-4)",
                background: "#C9A84C", color: "#1A2554", border: "none",
                borderRadius: "var(--r-sm)", fontSize: "0.95rem", fontWeight: 600,
                cursor: "pointer", transition: "background var(--t-fast)",
                fontFamily: "var(--font-body)",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#D4A843"}
              onMouseLeave={e => e.currentTarget.style.background = "#C9A84C"}
            >
              Enter Portal →
            </button>

            <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--ink-subtle)", marginTop: "var(--sp-5)" }}>
              This is a demonstration portal. No real credentials required.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center", padding: "var(--sp-5)",
        color: "rgba(255,255,255,0.3)", fontSize: "0.75rem", position: "relative", zIndex: 1,
      }}>
        © 2026 Narty Rock Private School. All rights reserved.
      </div>
    </div>
  );
}
