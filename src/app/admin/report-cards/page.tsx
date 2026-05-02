"use client";
// src/app/admin/report-cards/page.tsx
// Report card generator: fill in student details + grades, preview, print/download.

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FileText, Plus, Printer, Eye, ChevronDown, ChevronUp, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import PortalShell from "@/components/layout/PortalShell";
import { Card, Badge, Button, Input, Select, Textarea, PageHeader, EmptyState, Divider } from "@/components/ui";
import {
  reportCards as initialCards, ReportCard, SubjectGrade,
  CLASSES, SUBJECTS, TERMS, computeGrade,
} from "@/data/mockData";
import ReportCardPrint from "@/components/features/report-cards/ReportCardPrint";

const YEARS = ["2025", "2026", "2027"];

type Step = "list" | "create" | "preview";

export default function AdminReportCardsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cards, setCards] = useState<ReportCard[]>(initialCards);
  const [step, setStep] = useState<Step>("list");
  const [activeCard, setActiveCard] = useState<ReportCard | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Form state
  const [form, setForm] = useState({
    studentName: "",
    classId: CLASSES[2],
    className: CLASSES[2],
    term: TERMS[0],
    year: "2026",
    attendancePresent: "",
    attendanceTotal: "",
    classTeacherRemark: "",
    headRemark: "",
    nextTermBegins: "",
  });
  const [grades, setGrades] = useState<Omit<SubjectGrade, "total" | "grade" | "remarks">[]>([
    { subject: SUBJECTS[0], ca1: 0, ca2: 0, exam: 0, teacherInitials: "" },
  ]);

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "teacher")) router.replace("/login");
  }, [user, router]);
  if (!user) return null;

  const addSubject = () => setGrades(prev => [
    ...prev, { subject: SUBJECTS[0], ca1: 0, ca2: 0, exam: 0, teacherInitials: "" },
  ]);

  const removeSubject = (i: number) => setGrades(prev => prev.filter((_, idx) => idx !== i));

  const updateGrade = (i: number, field: string, value: string | number) =>
    setGrades(prev => prev.map((g, idx) => idx === i ? { ...g, [field]: value } : g));

  const handleGenerate = () => {
    if (!form.studentName.trim()) return alert("Student name is required");
    const fullGrades: SubjectGrade[] = grades.map(g => {
      const total = (Number(g.ca1) || 0) + (Number(g.ca2) || 0) + (Number(g.exam) || 0);
      const { grade, remarks } = computeGrade(total);
      return { ...g, total, grade, remarks };
    });
    const newCard: ReportCard = {
      id: `r${Date.now()}`,
      studentId: `s${Date.now()}`,
      studentName: form.studentName,
      classId: form.classId,
      className: form.className || form.classId,
      term: form.term,
      year: form.year,
      grades: fullGrades,
      attendance: {
        present: Number(form.attendancePresent) || 0,
        total: Number(form.attendanceTotal) || 60,
      },
      classTeacherRemark: form.classTeacherRemark,
      headRemark: form.headRemark,
      nextTermBegins: form.nextTermBegins,
    };
    setCards(prev => [newCard, ...prev]);
    setActiveCard(newCard);
    setStep("preview");
  };

  const handlePrint = () => {
    window.print();
  };

  // ── PREVIEW MODE ──
  if (step === "preview" && activeCard) {
    return (
      <PortalShell>
        <div className="no-print" style={{ marginBottom: "var(--sp-6)", display: "flex", gap: "var(--sp-3)", flexWrap: "wrap" }}>
          <Button variant="secondary" onClick={() => setStep("list")}>← Back to list</Button>
          <Button icon={<Printer size={16} />} onClick={handlePrint}>Print / Save PDF</Button>
        </div>
        <div ref={printRef}>
          <ReportCardPrint card={activeCard} />
        </div>
      </PortalShell>
    );
  }

  // ── CREATE FORM ──
  if (step === "create") {
    return (
      <PortalShell>
        <PageHeader
          title="Generate Report Card"
          subtitle="Fill in student details and subject grades. Totals and letter grades are computed automatically."
          action={<Button variant="secondary" onClick={() => setStep("list")}>← Back</Button>}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-8)" }}>
          {/* Student info */}
          <div style={{ gridColumn: "span 2" }}>
            <Card>
              <h2 style={{ fontSize: "1rem", marginBottom: "var(--sp-5)" }}>Student Information</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--sp-4)" }}>
                <div style={{ gridColumn: "span 3" }}>
                  <Input label="Student Full Name *" value={form.studentName}
                    onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))}
                    placeholder="e.g. Thandeka Dube" />
                </div>
                <Select label="Class" value={form.classId}
                  onChange={e => setForm(f => ({ ...f, classId: e.target.value, className: e.target.value }))}
                  options={CLASSES.map(c => ({ value: c, label: c }))} />
                <Select label="Term" value={form.term}
                  onChange={e => setForm(f => ({ ...f, term: e.target.value }))}
                  options={TERMS.map(t => ({ value: t, label: t }))} />
                <Select label="Year" value={form.year}
                  onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                  options={YEARS.map(y => ({ value: y, label: y }))} />
                <Input label="Days Present" type="number" value={form.attendancePresent}
                  onChange={e => setForm(f => ({ ...f, attendancePresent: e.target.value }))}
                  placeholder="e.g. 58" />
                <Input label="Total School Days" type="number" value={form.attendanceTotal}
                  onChange={e => setForm(f => ({ ...f, attendanceTotal: e.target.value }))}
                  placeholder="e.g. 60" />
                <Input label="Next Term Begins" value={form.nextTermBegins}
                  onChange={e => setForm(f => ({ ...f, nextTermBegins: e.target.value }))}
                  placeholder="e.g. 5 May 2026" />
              </div>
            </Card>
          </div>

          {/* Grades table */}
          <div style={{ gridColumn: "span 2" }}>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-5)" }}>
                <h2 style={{ fontSize: "1rem" }}>Subject Grades</h2>
                <Button size="sm" variant="secondary" icon={<Plus size={14} />} onClick={addSubject}>Add Subject</Button>
              </div>
              {/* Header */}
              <div style={{
                display: "grid", gridTemplateColumns: "2fr 80px 80px 100px 100px 36px",
                gap: "var(--sp-2)", padding: "var(--sp-2) 0",
                fontSize: "0.72rem", fontWeight: 700, color: "var(--ink-muted)",
                textTransform: "uppercase", letterSpacing: "0.06em",
                borderBottom: "2px solid var(--border)", marginBottom: "var(--sp-3)",
              }}>
                <span>Subject</span><span>CA 1 /20</span><span>CA 2 /20</span>
                <span>Exam /60</span><span>Teacher</span><span />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2)" }}>
                {grades.map((g, i) => {
                  const total = (Number(g.ca1)||0) + (Number(g.ca2)||0) + (Number(g.exam)||0);
                  const { grade } = computeGrade(total);
                  return (
                    <div key={i} style={{
                      display: "grid", gridTemplateColumns: "2fr 80px 80px 100px 100px 36px",
                      gap: "var(--sp-2)", alignItems: "center",
                    }}>
                      <select
                        value={g.subject}
                        onChange={e => updateGrade(i, "subject", e.target.value)}
                        style={{ border: "1.5px solid var(--border)", borderRadius: "var(--r-sm)", padding: "8px 10px", fontSize: "0.85rem", fontFamily: "var(--font-body)" }}
                      >
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {(["ca1", "ca2", "exam"] as const).map(field => (
                        <input key={field} type="number" min={0} max={field === "exam" ? 60 : 20}
                          value={g[field] || ""}
                          onChange={e => updateGrade(i, field, e.target.value)}
                          style={{ border: "1.5px solid var(--border)", borderRadius: "var(--r-sm)", padding: "8px 10px", fontSize: "0.85rem", width: "100%", fontFamily: "var(--font-body)" }} />
                      ))}
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)" }}>
                        <input
                          value={g.teacherInitials}
                          onChange={e => updateGrade(i, "teacherInitials", e.target.value)}
                          placeholder="P.P"
                          maxLength={5}
                          style={{ border: "1.5px solid var(--border)", borderRadius: "var(--r-sm)", padding: "8px 8px", fontSize: "0.82rem", width: "60px", fontFamily: "var(--font-body)" }}
                        />
                        <span style={{
                          fontSize: "0.78rem", fontWeight: 700,
                          color: grade === "F" ? "var(--urgent)" : grade.startsWith("A") ? "var(--success)" : "var(--ink)",
                          minWidth: 30,
                        }}>{total > 0 ? `${grade}` : ""}</span>
                      </div>
                      <button onClick={() => removeSubject(i)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--ink-subtle)", display: "flex", alignItems: "center" }}>
                        <X size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Remarks */}
          <div style={{ gridColumn: "span 2" }}>
            <Card>
              <h2 style={{ fontSize: "1rem", marginBottom: "var(--sp-5)" }}>Remarks</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-4)" }}>
                <Textarea label="Class Teacher's Remark"
                  value={form.classTeacherRemark}
                  onChange={e => setForm(f => ({ ...f, classTeacherRemark: e.target.value }))}
                  placeholder="e.g. A diligent and hardworking student…" />
                <Textarea label="Head Teacher's Remark"
                  value={form.headRemark}
                  onChange={e => setForm(f => ({ ...f, headRemark: e.target.value }))}
                  placeholder="e.g. A commendable performance…" />
              </div>
            </Card>
          </div>

          <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end", gap: "var(--sp-3)" }}>
            <Button variant="secondary" onClick={() => setStep("list")}>Cancel</Button>
            <Button icon={<Eye size={16} />} onClick={handleGenerate}>Generate & Preview</Button>
          </div>
        </div>
      </PortalShell>
    );
  }

  // ── LIST ──
  return (
    <PortalShell>
      <PageHeader
        title="Report Cards"
        subtitle="Generate, preview and print student report cards for each term."
        action={<Button icon={<Plus size={16} />} onClick={() => setStep("create")}>New Report Card</Button>}
      />
      {cards.length === 0 ? (
        <EmptyState icon={<FileText size={48} />} title="No report cards yet" body="Click 'New Report Card' to create the first one." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "var(--sp-5)" }}>
          {cards.map(card => {
            const avg = card.grades.length ? Math.round(card.grades.reduce((a, b) => a + b.total, 0) / card.grades.length) : 0;
            const { grade } = computeGrade(avg);
            return (
              <Card key={card.id} hover onClick={() => { setActiveCard(card); setStep("preview"); }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--sp-4)" }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "var(--r-sm)",
                    background: "rgba(26,58,42,0.08)", display: "flex",
                    alignItems: "center", justifyContent: "center", color: "var(--forest)",
                  }}> 
                    <img src="/assets/slogo.png" alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </div>
                  <Badge label={grade} variant={grade.startsWith("A") ? "success" : grade === "F" ? "urgent" : "forest"} />
                </div>
                <h3 style={{ fontSize: "1rem", fontFamily: "var(--font-display)", marginBottom: "var(--sp-1)" }}>
                  {card.studentName}
                </h3>
                <p style={{ fontSize: "0.82rem", color: "var(--ink-muted)", marginBottom: "var(--sp-3)" }}>
                  {card.className} · {card.term} {card.year}
                </p>
                <div style={{ display: "flex", gap: "var(--sp-4)", fontSize: "0.78rem", color: "var(--ink-subtle)" }}>
                  <span>{card.grades.length} subjects</span>
                  <span>Avg: {avg}/100</span>
                  <span>Att: {card.attendance.present}/{card.attendance.total}</span>
                </div>
                <div style={{
                  marginTop: "var(--sp-4)", padding: "var(--sp-2) var(--sp-3)",
                  background: "var(--cream)", borderRadius: "var(--r-sm)",
                  fontSize: "0.78rem", color: "var(--forest)", fontWeight: 600, textAlign: "center",
                }}>
                  Click to preview & print →
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </PortalShell>
  );
}
