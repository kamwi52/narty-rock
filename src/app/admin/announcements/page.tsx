"use client";
// src/app/admin/announcements/page.tsx
// Admin: publish, pin, and remove school-wide announcements.

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, Pin, Trash2, Plus, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import PortalShell from "@/components/layout/PortalShell";
import { Card, Badge, Button, Input, Select, Textarea, PageHeader, EmptyState } from "@/components/ui";
import { announcements as initialAnnouncements, Announcement } from "@/data/mockData";

type Priority = "normal" | "high" | "urgent";

export default function AdminAnnouncementsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Announcement[]>(initialAnnouncements);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", priority: "normal" as Priority });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user || user.role !== "admin") router.replace("/login");
  }, [user, router]);

  if (!user) return null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.body.trim()) e.body = "Body text is required";
    return e;
  };

  const handlePost = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const newAnn: Announcement = {
      id: `a${Date.now()}`,
      title: form.title.trim(),
      body: form.body.trim(),
      author: user.name,
      date: new Date().toISOString().split("T")[0],
      priority: form.priority,
      pinned: false,
    };
    setItems(prev => [newAnn, ...prev]);
    setForm({ title: "", body: "", priority: "normal" });
    setErrors({});
    setShowForm(false);
  };

  const togglePin = (id: string) => setItems(prev =>
    prev.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a)
  );

  const remove = (id: string) => setItems(prev => prev.filter(a => a.id !== id));

  const priorityBadge = (p: Priority) =>
    p === "urgent" ? "urgent" : p === "high" ? "high" : "normal";

  const sorted = [...items].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.date.localeCompare(a.date);
  });

  return (
    <PortalShell>
      <PageHeader
        title="Announcements"
        subtitle="Publish and manage school-wide announcements visible to all staff, students and parents."
        action={
          <Button icon={<Plus size={16} />} onClick={() => setShowForm(true)}>
            New Announcement
          </Button>
        }
      />

      {/* New announcement form */}
      {showForm && (
        <Card style={{ marginBottom: "var(--sp-6)", border: "2px solid var(--forest)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--sp-5)" }}>
            <h2 style={{ fontSize: "1.05rem" }}>New Announcement</h2>
            <button onClick={() => setShowForm(false)} style={{ background: "transparent", color: "var(--ink-muted)", padding: 4 }}>
              <X size={18} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
            <Input
              label="Title *"
              placeholder="e.g. Term 2 Examination Timetable"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              error={errors.title}
            />
            <Textarea
              label="Announcement Body *"
              placeholder="Write the full announcement text here…"
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              style={{ minHeight: 120 }}
            />
            {errors.body && <span style={{ fontSize: "0.75rem", color: "var(--urgent)" }}>{errors.body}</span>}
            <Select
              label="Priority Level"
              value={form.priority}
              onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}
              options={[
                { value: "normal", label: "Normal" },
                { value: "high", label: "High" },
                { value: "urgent", label: "Urgent" },
              ]}
            />
            <div style={{ display: "flex", gap: "var(--sp-3)", justifyContent: "flex-end" }}>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handlePost}>Publish Announcement</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Announcements list */}
      {sorted.length === 0 ? (
        <EmptyState
          icon={<Megaphone size={48} />}
          title="No announcements yet"
          body="Click 'New Announcement' to publish your first school-wide notice."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
          {sorted.map(ann => (
            <Card key={ann.id} style={{
              borderLeft: ann.pinned ? "4px solid var(--gold)" : "4px solid transparent",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--sp-4)" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "var(--r-sm)", flexShrink: 0,
                  background: ann.priority === "urgent" ? "rgba(192,57,43,0.1)"
                    : ann.priority === "high" ? "rgba(214,137,16,0.1)" : "rgba(26,58,42,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: ann.priority === "urgent" ? "var(--urgent)" : ann.priority === "high" ? "var(--high)" : "var(--forest)",
                }}>
                  <Megaphone size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)", flexWrap: "wrap", marginBottom: "var(--sp-2)" }}>
                    <h3 style={{ fontSize: "1rem", fontFamily: "var(--font-display)" }}>{ann.title}</h3>
                    <Badge label={ann.priority} variant={priorityBadge(ann.priority)} />
                    {ann.pinned && <Badge label="Pinned" variant="gold" />}
                  </div>
                  <p style={{ fontSize: "0.87rem", color: "var(--ink-muted)", lineHeight: 1.6, marginBottom: "var(--sp-3)" }}>
                    {ann.body}
                  </p>
                  <div style={{ fontSize: "0.76rem", color: "var(--ink-subtle)" }}>
                    Posted by {ann.author} · {formatDate(ann.date)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "var(--sp-2)", flexShrink: 0 }}>
                  <button
                    title={ann.pinned ? "Unpin" : "Pin to top"}
                    onClick={() => togglePin(ann.id)}
                    style={{
                      background: ann.pinned ? "rgba(201,168,76,0.15)" : "transparent",
                      border: "1px solid var(--border)", borderRadius: "var(--r-sm)",
                      padding: "var(--sp-2)", cursor: "pointer", color: ann.pinned ? "var(--gold)" : "var(--ink-muted)",
                    }}
                  >
                    <Pin size={15} />
                  </button>
                  <button
                    title="Delete"
                    onClick={() => remove(ann.id)}
                    style={{
                      background: "transparent", border: "1px solid var(--border)",
                      borderRadius: "var(--r-sm)", padding: "var(--sp-2)",
                      cursor: "pointer", color: "var(--ink-muted)",
                      transition: "all var(--t-fast)",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(192,57,43,0.08)"; e.currentTarget.style.color = "var(--urgent)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ink-muted)"; }}
                  >
                    <Trash2 size={15} />
                  </button>
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
