"use client";
// src/app/student/announcements/page.tsx
// Student/Parent view: read school announcements, filter by priority.

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, Pin } from "lucide-react";
import { useAuth } from "@/lib/auth";
import PortalShell from "@/components/layout/PortalShell";
import { Card, Badge, PageHeader, EmptyState } from "@/components/ui";
import { announcements } from "@/data/mockData";

type Filter = "all" | "urgent" | "high" | "normal";

export default function StudentAnnouncementsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);
  if (!user) return null;

  const filtered = [...announcements]
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.date.localeCompare(a.date);
    })
    .filter(a => filter === "all" || a.priority === filter);

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "urgent", label: "Urgent" },
    { key: "high", label: "High" },
    { key: "normal", label: "Normal" },
  ];

  return (
    <PortalShell>
      <PageHeader
        title="Announcements"
        subtitle="Stay updated with the latest news and notices from Narty Rock Private School."
      />

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "var(--sp-2)", marginBottom: "var(--sp-6)", flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            style={{
              padding: "var(--sp-2) var(--sp-4)", borderRadius: 99, border: "1.5px solid",
              fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
              fontFamily: "var(--font-body)",
              borderColor: filter === t.key ? "var(--forest)" : "var(--border)",
              background: filter === t.key ? "var(--forest)" : "var(--white)",
              color: filter === t.key ? "white" : "var(--ink-muted)",
              transition: "all var(--t-fast)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Megaphone size={48} />} title="No announcements" body="Check back later for school notices." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
          {filtered.map(ann => (
            <Card key={ann.id} style={{
              borderLeft: ann.priority === "urgent" ? "4px solid var(--urgent)"
                : ann.priority === "high" ? "4px solid var(--high)"
                : "4px solid var(--border)",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--sp-4)" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "var(--r-sm)", flexShrink: 0,
                  background: ann.priority === "urgent" ? "rgba(192,57,43,0.08)"
                    : ann.priority === "high" ? "rgba(214,137,16,0.08)" : "rgba(26,58,42,0.07)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: ann.priority === "urgent" ? "var(--urgent)" : ann.priority === "high" ? "var(--high)" : "var(--forest)",
                }}>
                  <Megaphone size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-2)", alignItems: "center", marginBottom: "var(--sp-2)" }}>
                    <h3 style={{ fontSize: "1rem", fontFamily: "var(--font-display)" }}>{ann.title}</h3>
                    <Badge
                      label={ann.priority}
                      variant={ann.priority === "urgent" ? "urgent" : ann.priority === "high" ? "high" : "normal"}
                    />
                    {ann.pinned && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.72rem", color: "var(--gold)", fontWeight: 600 }}>
                        <Pin size={12} /> Pinned
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "0.88rem", color: "var(--ink-muted)", lineHeight: 1.7, marginBottom: "var(--sp-3)" }}>
                    {ann.body}
                  </p>
                  <div style={{ fontSize: "0.76rem", color: "var(--ink-subtle)" }}>
                    {ann.author} · {formatDate(ann.date)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PortalShell>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
