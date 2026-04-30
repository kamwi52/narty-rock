// src/components/features/report-cards/ReportCardPrint.tsx
// The printable/downloadable report card. Formatted like a real school report.
// CSS print rules strip everything except this component.

import React from "react";
import { ReportCard, computeGrade } from "@/data/mockData";

interface Props {
  card: ReportCard;
}

export default function ReportCardPrint({ card }: Props) {
  const avg = card.grades.length
    ? Math.round(card.grades.reduce((a, b) => a + b.total, 0) / card.grades.length)
    : 0;
  const { grade: overallGrade } = computeGrade(avg);
  const attPct = card.attendance.total > 0
    ? Math.round((card.attendance.present / card.attendance.total) * 100)
    : 0;

  const gradeColor = (g: string) =>
    g.startsWith("A") ? "#1e5631" : g === "F" ? "#922b21" : g.startsWith("B") ? "#1a3a2a" : "#5d4037";

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .report-card-print, .report-card-print * { visibility: visible !important; }
          .report-card-print { position: fixed; inset: 0; background: white; }
          @page { size: A4 portrait; margin: 15mm; }
        }
      `}</style>

      <div className="report-card-print" style={{
        background: "white", maxWidth: 760, margin: "0 auto",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        border: "2px solid #1a3a2a", borderRadius: 8,
        overflow: "hidden", boxShadow: "0 8px 32px rgba(26,58,42,0.12)",
      }}>
        {/* ── Header ── */}
        <div style={{
          background: "linear-gradient(135deg, #1a3a2a 0%, #2d5a40 100%)",
          padding: "28px 36px", color: "white",
          display: "flex", alignItems: "center", gap: 20,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 12,
            background: "#c9a84c", display: "flex",
            alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#1a3a2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.5rem", fontWeight: 700, marginBottom: 4 }}>
              Narty Rock Private School
            </div>
            <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.65)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Excellence · Integrity · Innovation
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "#c9a84c", fontFamily: "'Playfair Display', Georgia, serif" }}>
              ACADEMIC REPORT
            </div>
            <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
              {card.term} · {card.year}
            </div>
          </div>
        </div>

        {/* Gold line */}
        <div style={{ height: 4, background: "linear-gradient(90deg, #c9a84c, #e8c97a, #c9a84c)" }} />

        {/* ── Student details band ── */}
        <div style={{
          background: "#f5f9f6", padding: "18px 36px",
          display: "flex", gap: 32, flexWrap: "wrap",
          borderBottom: "1px solid #dde8e1",
        }}>
          {[
            ["Full Name", card.studentName],
            ["Class", card.className],
            ["Term", card.term],
            ["Academic Year", card.year],
          ].map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#5a8a6a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
                {label}
              </div>
              <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "#1a3a2a" }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: "28px 36px" }}>
          {/* ── Grades table ── */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#5a8a6a", marginBottom: 12 }}>
              Academic Performance
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.87rem" }}>
              <thead>
                <tr style={{ background: "#1a3a2a", color: "white" }}>
                  {["Subject", "CA 1 /20", "CA 2 /20", "Exam /60", "Total /100", "Grade", "Remarks", "Teacher"].map(h => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: "0.78rem", letterSpacing: "0.04em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {card.grades.map((g, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f9fbf9" }}>
                    <td style={{ padding: "9px 12px", fontWeight: 500 }}>{g.subject}</td>
                    <td style={{ padding: "9px 12px", textAlign: "center" }}>{g.ca1}</td>
                    <td style={{ padding: "9px 12px", textAlign: "center" }}>{g.ca2}</td>
                    <td style={{ padding: "9px 12px", textAlign: "center" }}>{g.exam}</td>
                    <td style={{ padding: "9px 12px", textAlign: "center", fontWeight: 700 }}>{g.total}</td>
                    <td style={{ padding: "9px 12px", textAlign: "center" }}>
                      <span style={{
                        fontWeight: 800, fontSize: "0.9rem",
                        color: gradeColor(g.grade),
                      }}>{g.grade}</span>
                    </td>
                    <td style={{ padding: "9px 12px", color: "#5a5a5a" }}>{g.remarks}</td>
                    <td style={{ padding: "9px 12px", color: "#9a9a9a", fontSize: "0.78rem" }}>{g.teacherInitials}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "#edf4ef", borderTop: "2px solid #1a3a2a" }}>
                  <td colSpan={4} style={{ padding: "10px 12px", fontWeight: 700, fontSize: "0.85rem" }}>
                    Overall Average
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 800, fontSize: "1rem", color: "#1a3a2a" }}>
                    {avg}/100
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    <span style={{ fontWeight: 800, fontSize: "1rem", color: gradeColor(overallGrade) }}>{overallGrade}</span>
                  </td>
                  <td colSpan={2} style={{ padding: "10px 12px", color: "#5a8a6a", fontSize: "0.82rem" }}>
                    {computeGrade(avg).remarks}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* ── Grading key + Attendance side by side ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            <div style={{ background: "#f5f9f6", borderRadius: 8, padding: "16px 18px" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#5a8a6a", marginBottom: 10 }}>
                Grading Key
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px", fontSize: "0.78rem" }}>
                {[["A+ (90–100)", "Outstanding"], ["A (80–89)", "Excellent"], ["B+ (75–79)", "Very Good"],
                  ["B (70–74)", "Good"], ["C (55–69)", "Satisfactory"], ["D (45–54)", "Pass"], ["F (<45)", "Fail"]].map(([g, r]) => (
                  <div key={g} style={{ display: "flex", justifyContent: "space-between", color: "#3a3a3a", paddingBottom: 2 }}>
                    <span style={{ fontWeight: 600 }}>{g}</span>
                    <span style={{ color: "#5a5a5a" }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "#f5f9f6", borderRadius: 8, padding: "16px 18px" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#5a8a6a", marginBottom: 10 }}>
                Attendance
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: 6 }}>
                  <span>Days Present</span>
                  <span style={{ fontWeight: 700 }}>{card.attendance.present} / {card.attendance.total}</span>
                </div>
                <div style={{ height: 8, background: "#dde8e1", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${attPct}%`, background: attPct >= 80 ? "#1e8449" : attPct >= 60 ? "#d68910" : "#c0392b", borderRadius: 99 }} />
                </div>
                <div style={{ fontSize: "0.78rem", color: "#5a5a5a", marginTop: 6 }}>{attPct}% attendance rate</div>
              </div>
              {card.nextTermBegins && (
                <div style={{ fontSize: "0.82rem", color: "#3a3a3a", marginTop: 12 }}>
                  <span style={{ fontWeight: 600 }}>Next Term Begins:</span> {card.nextTermBegins}
                </div>
              )}
            </div>
          </div>

          {/* ── Remarks ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
            <div style={{ border: "1.5px solid #dde8e1", borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#5a8a6a", marginBottom: 6 }}>
                Class Teacher's Remark
              </div>
              <p style={{ fontSize: "0.85rem", color: "#3a3a3a", lineHeight: 1.6 }}>
                {card.classTeacherRemark || "—"}
              </p>
            </div>
            <div style={{ border: "1.5px solid #dde8e1", borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#5a8a6a", marginBottom: 6 }}>
                Head Teacher's Remark
              </div>
              <p style={{ fontSize: "0.85rem", color: "#3a3a3a", lineHeight: 1.6 }}>
                {card.headRemark || "—"}
              </p>
            </div>
          </div>

          {/* ── Signature block ── */}
          <div style={{ borderTop: "2px solid #1a3a2a", paddingTop: 20, display: "flex", gap: 40, justifyContent: "space-around" }}>
            {["Class Teacher", "Head of School", "Parent / Guardian"].map(sig => (
              <div key={sig} style={{ textAlign: "center", flex: 1 }}>
                <div style={{ height: 36, borderBottom: "1.5px solid #aac5b2", marginBottom: 6 }} />
                <div style={{ fontSize: "0.72rem", color: "#5a5a5a", fontWeight: 600, letterSpacing: "0.04em" }}>{sig}</div>
              </div>
            ))}
          </div>

          {/* ── Footer ── */}
          <div style={{ marginTop: 20, textAlign: "center", fontSize: "0.7rem", color: "#9a9a9a" }}>
            Narty Rock Private School · Official Academic Report · {card.term} {card.year}
          </div>
        </div>
      </div>
    </>
  );
}
