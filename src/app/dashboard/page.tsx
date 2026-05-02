"use client";
// src/app/dashboard/page.tsx
// Role-aware dashboard: different stat cards and quick actions per role.

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Megaphone, BookOpen, FileText, TrendingUp, Users, Calendar, ArrowRight, DollarSign } from "lucide-react";
import { useAuth } from "@/lib/auth";
import PortalShell from "@/components/layout/PortalShell";
import { Card, Badge } from "@/components/ui";
import { announcements, homework, reportCards, employees } from "@/data/mockData";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return null;

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const pinned = announcements.filter(a => a.pinned);
  const urgentAnn = announcements.filter(a => a.priority === "urgent");
  const firstName = user.name.split(" ")[0];

  return (
    <PortalShell>
      {/* Welcome Hero */}
      <div style={{
        background: "linear-gradient(135deg, #1A2554 0%, #1E2B63 100%)",
        borderRadius: "var(--r-lg)", padding: "var(--sp-8) var(--sp-8)",
        marginBottom: "var(--sp-8)", position: "relative", overflow: "hidden",
        color: "white", display: "flex", alignItems: "center", justifyContent: "space-between",
        minHeight: 160,
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "url('data:image/svg+xml,%3Csvg width=%2760%27 height=%2760%27 viewBox=%270 0 60 60%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27none%27 fill-rule=%27evenodd%27%3E%3Cg fill=%27%23ffffff%27 fill-opacity=%270.02%27%3E%3Cpath d=%27M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", right: -60, top: -40,
          width: 240, height: 240, borderRadius: "50%",
          background: "rgba(201,168,76,0.08)",
          zIndex: 0,
        }} />
        <div style={{
          position: "relative", zIndex: 1, flex: 1,
        }}>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.76rem", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0, marginBottom: "var(--sp-2)" }}>
            {today}
          </p>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "2.1rem",
            color: "white", margin: 0, fontWeight: 700, lineHeight: 1.2, marginBottom: "var(--sp-3)",
          }}>
            Welcome back, {user.name}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.95rem", margin: 0, lineHeight: 1.6, maxWidth: "70%" }}>
            {user.role === "admin" && <>🔐 You have full administrative access to the portal.</>}
            {user.role === "teacher" && <>📚 Teaching staff dashboard — {user.subject || "All Subjects"}</>}
            {user.role === "student" && <>🎓 Student portal — {user.classId || ""}</>}
          </p>
        </div>
        <div style={{
          position: "relative", zIndex: 1, textAlign: "center", marginLeft: "var(--sp-8)",
        }}>
          <div style={{
            background: "rgba(201,168,76,0.15)", borderRadius: "var(--r-lg)",
            padding: "var(--sp-6) var(--sp-8)", backdropFilter: "blur(10px)",
            border: "1px solid rgba(201,168,76,0.2)",
          }}>
            <div style={{ fontSize: "2.2rem", fontWeight: 700, color: "#C9A84C", marginBottom: "var(--sp-1)" }}>
              {announcements.length}
            </div>
            <div style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.7)", fontWeight: 500, letterSpacing: "0.04em" }}>
              Pending Items
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "var(--sp-5)", marginBottom: "var(--sp-8)",
      }}>
        {(user.role === "admin" || user.role === "student") && (
          <StatCard
            href={user.role === "admin" ? "/admin/announcements" : "/student/announcements"}
            icon={<Megaphone size={22} />}
            label="Announcements"
            value={announcements.length}
            sub={`${urgentAnn.length} urgent`}
            color="#C9A84C"
          />
        )}
        {(user.role === "teacher" || user.role === "student") && (
          <StatCard
            href={user.role === "teacher" ? "/teacher/homework" : "/student/homework"}
            icon={<BookOpen size={22} />}
            label="Homework Tasks"
            value={homework.length}
            sub="Active assignments"
            color="#D4A843"
          />
        )}
        {(user.role === "admin" || user.role === "teacher") && (
          <StatCard
            href={user.role === "admin" ? "/admin/report-cards" : "/teacher/report-cards"}
            icon={<FileText size={22} />}
            label="Report Cards"
            value={reportCards.length}
            sub="Generated this term"
            color="#1E2B63"
          />
        )}
        {user.role === "admin" && (
          <StatCard
            href="/admin/hrm/employees"
            icon={<Users size={22} />}
            label="Total Employees"
            value={employees.length}
            sub="Active staff members"
            color="#1A2554"
          />
        )}
        <StatCard
          href="/dashboard"
          icon={<Calendar size={22} />}
          label="Term 2, 2026"
          value="Week 3"
          sub="Exams in 4 weeks"
          color="#1A2554"
        />
      </div>

      {/* Content grid */}
      <div className="dashboard-grid" 
           style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-6)" }}>
        {/* Latest announcements */}
        <Card style={{ gridColumn: "span 1" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--sp-5)" }}>
            <h2 style={{ fontSize: "1.05rem" }}>Latest Announcements</h2>
            <Link href={user.role === "admin" ? "/admin/announcements" : "/student/announcements"}>
              <span style={{ fontSize: "0.8rem", color: "#1A2554", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                View all <ArrowRight size={14} />
              </span>
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
            {announcements.slice(0, 3).map(ann => (
              <div key={ann.id} style={{
                display: "flex", gap: "var(--sp-3)", paddingBottom: "var(--sp-4)",
                borderBottom: "1px solid var(--border)",
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 7,
                  background: ann.priority === "urgent" ? "#C9A84C" : ann.priority === "high" ? "#D4A843" : "var(--border)",
                }} />
                <div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 500, marginBottom: 2 }}>{ann.title}</div>
                  <div style={{ fontSize: "0.76rem", color: "var(--ink-muted)" }}>{formatDate(ann.date)}</div>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <Badge
                    label={ann.priority}
                    variant={ann.priority === "urgent" ? "urgent" : ann.priority === "high" ? "high" : "normal"}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick actions */}
        <Card>
          <h2 style={{ fontSize: "1.05rem", marginBottom: "var(--sp-5)" }}>Quick Actions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
            {user.role === "admin" && <>
              <QuickAction href="/admin/announcements" icon={<Megaphone size={18} />} label="Post Announcement" color="#C9A84C" />
              <QuickAction href="/admin/report-cards" icon={<FileText size={18} />} label="Generate Report Card" color="#1A2554" />
              <QuickAction href="/admin/hrm/employees" icon={<Users size={18} />} label="Manage Employees" color="#1E2B63" /> 
              <QuickAction href="/admin/hrm/payslips" icon={<DollarSign size={18} />} label="Process Payroll" color="#1A2554" />
            </>}
            {user.role === "teacher" && <>
              <QuickAction href="/teacher/homework" icon={<BookOpen size={18} />} label="Post Homework" color="#D4A843" />
              <QuickAction href="/teacher/report-cards" icon={<FileText size={18} />} label="Enter Student Grades" color="#1A2554" />
            </>}
            {user.role === "student" && <>
              <QuickAction href="/student/homework" icon={<BookOpen size={18} />} label="View My Homework" color="#D4A843" />
              <QuickAction href="/student/announcements" icon={<Megaphone size={18} />} label="View Announcements" color="#1A2554" />
            </>}
          </div>
        </Card>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </PortalShell>
  );
}

function StatCard({ href, icon, label, value, sub, color }: {
  href: string; icon: React.ReactNode; label: string; value: number | string; sub: string; color: string;
}) {
  return (
    <Link href={href}>
      <Card hover style={{
        cursor: "pointer", borderTop: `3px solid ${color}`,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--sp-4)" }}>
          <div />
          <div style={{
            width: 56, height: 56, borderRadius: "var(--r-md)",
            background: `${color}12`, color, display: "flex",
            alignItems: "center", justifyContent: "center",
            flexShrink: 0, fontSize: "1.8rem",
          }}>
            {icon}
          </div>
        </div>
        <div style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "var(--font-display)", color, lineHeight: 1, marginBottom: "var(--sp-2)" }}>
          {value}
        </div>
        <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--ink)", marginBottom: "var(--sp-1)" }}>{label}</div>
        <div style={{ fontSize: "0.72rem", color: "var(--ink-muted)", fontWeight: 500 }}>{sub}</div>
      </Card>
    </Link>
  );
}

function QuickAction({ href, icon, label, color }: { href: string; icon: React.ReactNode; label: string; color: string }) {
  return (
    <Link href={href}>
      <div style={{
        display: "flex", alignItems: "center", gap: "var(--sp-4)",
        padding: "var(--sp-4) var(--sp-5)", borderRadius: "var(--r-md)",
        background: "#1A2554", cursor: "pointer",
        transition: "all var(--t-fast)", fontSize: "0.88rem", fontWeight: 600,
        color: "white", border: "none",
      }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "#1E2B63";
          e.currentTarget.style.transform = "translateX(4px)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "#1A2554";
          e.currentTarget.style.transform = "translateX(0)";
        }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: "var(--r-sm)",
          background: color, display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", flexShrink: 0,
        }}>
          {icon}
        </div>
        <span style={{ flex: 1 }}>{label}</span>
        <ArrowRight size={16} style={{ color: color, opacity: 0.7 }} />
      </div>
    </Link>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
