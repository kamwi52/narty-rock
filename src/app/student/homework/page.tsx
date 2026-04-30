"use client";
// src/app/student/homework/page.tsx
// Students see homework for their class, sorted by due date.

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, CalendarDays, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import PortalShell from "@/components/layout/PortalShell";
import { Card, Badge, PageHeader, EmptyState } from "@/components/ui";
import { homework } from "@/data/mockData";

export default function StudentHomeworkPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [filterSubject, setFilterSubject] = useState("all");

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);
  if (!user) return null;

  const myClass = user.classId || "";
  const myHW = homework
    .filter(h => h.classId === myClass)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const subjects = ["all", ...Array.from(new Set(myHW.map(h => h.subject)))];
  const displayed = filterSubject === "all" ? myHW : myHW.filter(h => h.subject === filterSubject);

  const daysUntil = (due: string) => Math.ceil((new Date(due).getTime() - Date.now()) / 86400000);

  return (
    <PortalShell>
      <PageHeader
        title="My Homework"
        subtitle={`Showing assignments for ${myClass ? `Form ${myClass}` : "your class"}. Sorted by due date.`}
      />

      {/* Subject filter */}
      <div style={{ display: "flex", gap: "var(--sp-2)", marginBottom: "var(--sp-6)", flexWrap: "wrap" }}>
        {subjects.map(s => (
          <button key={s}
            onClick={() => setFilterSubject(s)}
            style={{
              padding: "4px 14px", borderRadius: 99, fontFamily: "var(--font-body)",
              border: `1.5px solid ${filterSubject === s ? "var(--forest)" : "var(--border)"}`,
              background: filterSubject === s ? "var(--forest)" : "var(--white)",
              color: filterSubject === s ? "white" : "var(--ink-muted)",
              fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
              transition: "all var(--t-fast)",
            }}>
            {s === "all" ? "All Subjects" : s}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={48} />}
          title="No homework assignments"
          body={myClass ? "Great — no assignments yet! Check back later." : "Your class information isn't set. Please contact your teacher."}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
          {displayed.map(hw => {
            const days = daysUntil(hw.dueDate);
            const isOverdue = days < 0;
            const isDueSoon = days <= 2 && days >= 0;
            const dueColor = isOverdue ? "var(--urgent)" : isDueSoon ? "var(--high)" : "var(--success)";
            const dueBg = isOverdue ? "rgba(192,57,43,0.08)" : isDueSoon ? "rgba(214,137,16,0.08)" : "rgba(30,132,73,0.06)";

            return (
              <Card key={hw.id} hover style={{ borderLeft: `4px solid ${dueColor}` }}>
                <div style={{ display: "flex", gap: "var(--sp-4)", alignItems: "flex-start" }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "var(--r-sm)", flexShrink: 0,
                    background: "rgba(201,168,76,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)",
                  }}>
                    <BookOpen size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-2)", marginBottom: "var(--sp-2)", alignItems: "center" }}>
                      <h3 style={{ fontSize: "0.95rem", fontFamily: "var(--font-display)" }}>{hw.title}</h3>
                      <Badge label={hw.subject} variant="forest" />
                    </div>
                    <p style={{ fontSize: "0.87rem", color: "var(--ink-muted)", lineHeight: 1.65, marginBottom: "var(--sp-4)" }}>
                      {hw.description}
                    </p>
                    <div style={{ display: "flex", gap: "var(--sp-4)", flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: "0.77rem", color: "var(--ink-subtle)" }}>
                        Set by {hw.postedBy} · {formatDate(hw.postedAt)}
                      </span>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "4px 12px",
                        borderRadius: 99, background: dueBg, color: dueColor,
                        fontSize: "0.77rem", fontWeight: 700,
                      }}>
                        {isOverdue ? <Clock size={13} /> : <CalendarDays size={13} />}
                        {isOverdue
                          ? `Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""}`
                          : isDueSoon
                          ? `Due in ${days} day${days !== 1 ? "s" : ""} — ${formatDate(hw.dueDate)}`
                          : `Due ${formatDate(hw.dueDate)}`}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </PortalShell>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
