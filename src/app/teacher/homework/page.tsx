"use client";
// src/app/teacher/homework/page.tsx
// Teachers post homework by class + subject; existing tasks shown below.

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, Trash2, X, CalendarDays } from "lucide-react";
import { useAuth } from "@/lib/auth";
import PortalShell from "@/components/layout/PortalShell";
import { Card, Badge, Button, Input, Select, Textarea, PageHeader, EmptyState } from "@/components/ui";
import { homework as initialHW, HomeworkAssignment, CLASSES, SUBJECTS } from "@/data/mockData";

export default function TeacherHomeworkPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<HomeworkAssignment[]>(initialHW);
  const [showForm, setShowForm] = useState(false);
  const [filterClass, setFilterClass] = useState("all");
  const [form, setForm] = useState({
    title: "", description: "", subject: SUBJECTS[0],
    classId: CLASSES[0], dueDate: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user || user.role !== "teacher") router.replace("/login");
  }, [user, router]);
  if (!user) return null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title required";
    if (!form.description.trim()) e.description = "Description required";
    if (!form.dueDate) e.dueDate = "Due date required";
    return e;
  };

  const handlePost = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const newHW: HomeworkAssignment = {
      id: `h${Date.now()}`,
      ...form,
      postedBy: user.name,
      postedAt: new Date().toISOString().split("T")[0],
    };
    setItems(prev => [newHW, ...prev]);
    setForm({ title: "", description: "", subject: SUBJECTS[0], classId: CLASSES[0], dueDate: "" });
    setErrors({});
    setShowForm(false);
  };

  const displayed = filterClass === "all" ? items : items.filter(h => h.classId === filterClass);

  const daysUntil = (due: string) => {
    const diff = Math.ceil((new Date(due).getTime() - Date.now()) / 86400000);
    return diff;
  };

  return (
    <PortalShell>
      <PageHeader
        title="Homework Publisher"
        subtitle="Post and manage homework assignments by class and subject."
        action={<Button icon={<Plus size={16} />} onClick={() => setShowForm(true)}>Post Homework</Button>}
      />

      {/* Post form */}
      {showForm && (
        <Card style={{ marginBottom: "var(--sp-6)", border: "2px solid var(--gold)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-5)" }}>
            <h2 style={{ fontSize: "1.05rem" }}>New Homework Assignment</h2>
            <button onClick={() => setShowForm(false)} style={{ background: "transparent", color: "var(--ink-muted)" }}>
              <X size={18} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-4)" }}>
            <div style={{ gridColumn: "span 2" }}>
              <Input
                label="Assignment Title *"
                placeholder="e.g. Quadratic Equations — Exercise 7B"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                error={errors.title}
              />
            </div>
            <Select
              label="Subject"
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              options={SUBJECTS.map(s => ({ value: s, label: s }))}
            />
            <Select
              label="Class"
              value={form.classId}
              onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}
              options={CLASSES.map(c => ({ value: c, label: `Form ${c}` }))}
            />
            <div style={{ gridColumn: "span 2" }}>
              <Textarea
                label="Assignment Description *"
                placeholder="Describe the task clearly, including page numbers, expected format, and any specific instructions…"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                style={{ minHeight: 120 }}
              />
              {errors.description && <span style={{ fontSize: "0.75rem", color: "var(--urgent)" }}>{errors.description}</span>}
            </div>
            <Input
              label="Due Date *"
              type="date"
              value={form.dueDate}
              onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              error={errors.dueDate}
            />
            <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--sp-3)" }}>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handlePost}>Post Assignment</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filter bar */}
      <div style={{ display: "flex", gap: "var(--sp-2)", marginBottom: "var(--sp-6)", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: "0.82rem", color: "var(--ink-muted)", fontWeight: 500 }}>Filter by class:</span>
        {["all", ...CLASSES].map(c => (
          <button key={c}
            onClick={() => setFilterClass(c)}
            style={{
              padding: "4px 14px", borderRadius: 99,
              border: `1.5px solid ${filterClass === c ? "var(--gold)" : "var(--border)"}`,
              background: filterClass === c ? "rgba(201,168,76,0.12)" : "var(--white)",
              color: filterClass === c ? "#a07c2e" : "var(--ink-muted)",
              fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
              fontFamily: "var(--font-body)", transition: "all var(--t-fast)",
            }}>
            {c === "all" ? "All Classes" : `Form ${c}`}
          </button>
        ))}
      </div>

      {/* Homework list */}
      {displayed.length === 0 ? (
        <EmptyState icon={<BookOpen size={48} />} title="No assignments found" body="Post a homework assignment to get started." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
          {displayed.map(hw => {
            const days = daysUntil(hw.dueDate);
            const dueColor = days < 0 ? "var(--urgent)" : days <= 2 ? "var(--high)" : "var(--success)";
            return (
              <Card key={hw.id}>
                <div style={{ display: "flex", gap: "var(--sp-4)", alignItems: "flex-start" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "var(--r-sm)", flexShrink: 0,
                    background: "rgba(201,168,76,0.1)", display: "flex", alignItems: "center",
                    justifyContent: "center", color: "var(--gold)",
                  }}>
                    <BookOpen size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
                      <h3 style={{ fontSize: "0.95rem", fontFamily: "var(--font-display)" }}>{hw.title}</h3>
                      <Badge label={hw.subject} variant="forest" />
                      <Badge label={`Form ${hw.classId}`} variant="gold" />
                    </div>
                    <p style={{ fontSize: "0.86rem", color: "var(--ink-muted)", lineHeight: 1.6, marginBottom: "var(--sp-3)" }}>
                      {hw.description}
                    </p>
                    <div style={{ display: "flex", gap: "var(--sp-5)", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.77rem", color: "var(--ink-subtle)" }}>
                        Posted by {hw.postedBy} · {formatDate(hw.postedAt)}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.77rem", color: dueColor, fontWeight: 600 }}>
                        <CalendarDays size={13} />
                        Due {formatDate(hw.dueDate)}
                        {days >= 0 ? ` (${days} day${days !== 1 ? "s" : ""})` : " (Overdue)"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setItems(prev => prev.filter(h => h.id !== hw.id))}
                    style={{
                      background: "transparent", border: "1px solid var(--border)",
                      borderRadius: "var(--r-sm)", padding: "var(--sp-2)",
                      cursor: "pointer", color: "var(--ink-muted)", flexShrink: 0,
                      transition: "all var(--t-fast)",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(192,57,43,0.08)"; e.currentTarget.style.color = "var(--urgent)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ink-muted)"; }}
                  >
                    <Trash2 size={15} />
                  </button>
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
