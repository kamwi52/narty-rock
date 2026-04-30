"use client";
// src/app/admin/hrm/payslips/page.tsx
// Payslip Management: Generate PDFs and send via email

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText, Send, RefreshCw, CheckCircle, AlertCircle,
  Eye, Download, Mail, X, Check, Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import PortalShell from "@/components/layout/PortalShell";
import { Card, Badge, Button, Select, PageHeader, EmptyState } from "@/components/ui";
import {
  payrollRecords,
  payslips,
  payslipSendLogs,
  employees,
  PayrollRecord,
  Payslip,
  PayslipSendLog,
} from "@/data/mockData";

type ProcessStep = "select" | "generate" | "send" | "complete";

interface GeneratedPayslip extends Payslip {
  employeeName: string;
  generateError?: string;
}

interface SendResult {
  payslipId: string;
  employeeId: string;
  success: boolean;
  messageId?: string;
  error?: string;
  sentAt?: string;
}

export default function PayslipsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [month, setMonth] = useState(new Date().toISOString().split("T")[0].substring(0, 7));
  const [step, setStep] = useState<ProcessStep>("select");
  const [loading, setLoading] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [generatedPayslips, setGeneratedPayslips] = useState<GeneratedPayslip[]>([]);
  const [sendResults, setSendResults] = useState<SendResult[]>([]);
  const [error, setError] = useState<string>("");
  const [sendLogs, setSendLogs] = useState<PayslipSendLog[]>([...payslipSendLogs]);

  useEffect(() => {
    if (!user || user.role !== "admin") router.replace("/login");
  }, [user, router]);

  if (!user) return null;

  // Get payroll records for selected month
  const monthRecords = payrollRecords.filter((pr) => pr.month === month && pr.status === "draft");

  const handleSelectRecord = (recordId: string) => {
    setSelectedRecords((prev) =>
      prev.includes(recordId) ? prev.filter((id) => id !== recordId) : [...prev, recordId]
    );
  };

  const handleGeneratePayslips = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/hrm/payslips/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payrollRecordIds: selectedRecords }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate payslips");
      }

      // Map payslips with employee names
      const generated = data.generated.map((ps: Payslip) => ({
        ...ps,
        employeeName: employees.find((e) => e.id === ps.employeeId)?.name || "Unknown",
      }));

      setGeneratedPayslips(generated);
      setStep("send");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate payslips");
    } finally {
      setLoading(false);
    }
  };

  const handleSendPayslips = async () => {
    setLoading(true);
    setError("");

    try {
      const payslipIds = generatedPayslips.map((ps) => ps.id);

      const response = await fetch("/api/hrm/payslips/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payslipIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send payslips");
      }

      setSendResults(data.results);
      setSendLogs((prev) => [...data.logs || [], ...prev]);
      setStep("complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send payslips");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("select");
    setSelectedRecords([]);
    setGeneratedPayslips([]);
    setSendResults([]);
    setError("");
  };

  const successCount = sendResults.filter((r) => r.success).length;
  const failureCount = sendResults.filter((r) => !r.success).length;

  // Get upcoming months
  const months = [];
  for (let i = -2; i <= 2; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() + i);
    months.push(d.toISOString().split("T")[0].substring(0, 7));
  }

  return (
    <PortalShell>
      <PageHeader
        title="Payslip Management"
        subtitle="Generate and distribute payslips to employees via email."
      />

      {/* Step 1: Select Month & Records */}
      {step === "select" && (
        <>
          <Card style={{ marginBottom: "var(--sp-6)" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "var(--sp-5)" }}>
              Step 1: Select Payroll Period
            </h3>

            <Select
              label="Month"
              options={months.map((m) => ({
                value: m,
                label: new Date(m).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                }),
              }))}
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                setSelectedRecords([]);
              }}
            />

            <div style={{ marginTop: "var(--sp-6)" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "var(--sp-4)" }}>
                Payroll Records for {new Date(month).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
              </h4>

              {monthRecords.length === 0 ? (
                <EmptyState
                  icon={<FileText size={40} />}
                  title="No payroll records"
                  body="Create payroll records for this month first."
                />
              ) : (
                <div style={{ display: "grid", gap: "var(--sp-3)" }}>
                  {monthRecords.map((record) => (
                    <Card key={record.id} hover padding="var(--sp-4)">
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "max-content 1fr auto",
                          gap: "var(--sp-4)",
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRecords.includes(record.id)}
                          onChange={() => handleSelectRecord(record.id)}
                          style={{ width: "18px", height: "18px", cursor: "pointer" }}
                        />
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            {employees.find((e) => e.id === record.employeeId)?.name}
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "var(--ink-muted)" }}>
                            Gross: ZMW {record.grossPay.toFixed(2)} • Net: ZMW {record.netPay.toFixed(2)}
                          </div>
                        </div>
                        <Badge label={record.status} variant="success" />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "var(--sp-4)", justifyContent: "flex-end", marginTop: "var(--sp-6)" }}>
              <div style={{ fontSize: "0.9rem", color: "var(--ink-muted)" }}>
                Selected: {selectedRecords.length} of {monthRecords.length}
              </div>
              <Button
                icon={<FileText size={16} />}
                disabled={selectedRecords.length === 0 || loading}
                onClick={handleGeneratePayslips}
                loading={loading}
              >
                Generate Payslips ({selectedRecords.length})
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* Step 2: Generate Payslips */}
      {step === "generate" && (
        <Card style={{ marginBottom: "var(--sp-6)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-4)", marginBottom: "var(--sp-5)" }}>
            <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 600 }}>Generating Payslips...</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--ink-muted)" }}>
                Processing {selectedRecords.length} payroll records
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Send Payslips */}
      {step === "send" && (
        <>
          <Card style={{ marginBottom: "var(--sp-6)" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "var(--sp-5)" }}>
              Step 2: Send Payslips via Email
            </h3>

            <div style={{ background: "#f9f9f9", padding: "var(--sp-4)", borderRadius: "var(--r-sm)", marginBottom: "var(--sp-5)" }}>
              <p style={{ fontSize: "0.9rem", color: "var(--ink-muted)", margin: 0 }}>
                ✓ Generated {generatedPayslips.length} PDF payslips ready to send
              </p>
              <p style={{ fontSize: "0.9rem", color: "var(--ink-muted)", margin: "8px 0 0 0" }}>
                Payslips will be emailed to {generatedPayslips.length} employee(s) with Gmail integration
              </p>
            </div>

            <div style={{ marginBottom: "var(--sp-6)" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "var(--sp-4)" }}>
                Payslips to Send
              </h4>
              <div style={{ display: "grid", gap: "var(--sp-3)", maxHeight: "300px", overflowY: "auto" }}>
                {generatedPayslips.map((ps) => (
                  <Card key={ps.id} padding="var(--sp-3)">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "var(--sp-4)", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{ps.employeeName}</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--ink-muted)" }}>
                          {ps.month} • {ps.pdfUrl ? "PDF Generated" : "Error"}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "var(--sp-2)" }}>
                        {ps.pdfUrl && (
                          <a
                            href={ps.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--forest)", cursor: "pointer" }}
                          >
                            <Download size={18} />
                          </a>
                        )}
                        {ps.pdfUrl ? (
                          <CheckCircle size={18} color="var(--success)" />
                        ) : (
                          <AlertCircle size={18} color="var(--urgent)" />
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {error && (
              <div
                style={{
                  background: "rgba(192,57,43,0.1)",
                  color: "var(--urgent)",
                  padding: "var(--sp-4)",
                  borderRadius: "var(--r-sm)",
                  marginBottom: "var(--sp-5)",
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "var(--sp-4)", justifyContent: "flex-end" }}>
              <Button variant="secondary" onClick={handleReset} disabled={loading}>
                Back
              </Button>
              <Button
                icon={<Mail size={16} />}
                disabled={generatedPayslips.length === 0 || loading}
                onClick={handleSendPayslips}
                loading={loading}
              >
                Send All Payslips
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* Step 4: Complete */}
      {step === "complete" && (
        <>
          <Card style={{ marginBottom: "var(--sp-6)", background: "linear-gradient(135deg, rgba(30,132,73,0.05), rgba(26,58,42,0.05))" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-4)", marginBottom: "var(--sp-5)" }}>
              <CheckCircle size={32} color="var(--success)" />
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 600 }}>Payslip Distribution Complete</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--ink-muted)", margin: "4px 0 0 0" }}>
                  {successCount} sent successfully, {failureCount} failed
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--sp-4)", marginBottom: "var(--sp-6)" }}>
              <div style={{ background: "white", padding: "var(--sp-4)", borderRadius: "var(--r-sm)" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--ink-muted)", marginBottom: "4px" }}>TOTAL SENT</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--forest)" }}>
                  {successCount + failureCount}
                </div>
              </div>
              <div style={{ background: "white", padding: "var(--sp-4)", borderRadius: "var(--r-sm)" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--ink-muted)", marginBottom: "4px" }}>SUCCESS</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--success)" }}>{successCount}</div>
              </div>
              <div style={{ background: "white", padding: "var(--sp-4)", borderRadius: "var(--r-sm)" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--ink-muted)", marginBottom: "4px" }}>FAILED</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--urgent)" }}>{failureCount}</div>
              </div>
            </div>

            {failureCount > 0 && (
              <div style={{ marginBottom: "var(--sp-6)" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "var(--sp-3)" }}>Failed Sends</h4>
                <div style={{ display: "grid", gap: "var(--sp-2)" }}>
                  {sendResults
                    .filter((r) => !r.success)
                    .map((result) => (
                      <div
                        key={result.payslipId}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto",
                          gap: "var(--sp-4)",
                          alignItems: "center",
                          background: "rgba(192,57,43,0.05)",
                          padding: "var(--sp-3)",
                          borderRadius: "var(--r-sm)",
                          borderLeft: "3px solid var(--urgent)",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                            {employees.find((e) => e.id === result.employeeId)?.name}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "var(--urgent)" }}>{result.error}</div>
                        </div>
                        <AlertCircle size={18} color="var(--urgent)" />
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "var(--sp-4)", justifyContent: "flex-end" }}>
              <Button onClick={handleReset}>Start New Batch</Button>
            </div>
          </Card>
        </>
      )}

      {/* Send Logs History */}
      {sendLogs.length > 0 && step === "select" && (
        <Card style={{ marginTop: "var(--sp-6)" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "var(--sp-4)" }}>
            Recent Send History
          </h3>
          <div style={{ display: "grid", gap: "var(--sp-3)", maxHeight: "300px", overflowY: "auto" }}>
            {sendLogs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "var(--sp-4)",
                  alignItems: "center",
                  padding: "var(--sp-3)",
                  background: "#f9f9f9",
                  borderRadius: "var(--r-sm)",
                  borderLeft: `3px solid ${log.status === "success" ? "var(--success)" : "var(--urgent)"}`,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{log.recipientEmail}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--ink-muted)" }}>
                    {new Date(log.sentAt).toLocaleString()}
                  </div>
                </div>
                <Badge
                  label={log.status}
                  variant={log.status === "success" ? "success" : "urgent"}
                />
              </div>
            ))}
          </div>
        </Card>
      )}
    </PortalShell>
  );
}
