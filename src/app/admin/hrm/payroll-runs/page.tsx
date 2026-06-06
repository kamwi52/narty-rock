"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, ClipboardCheck, CreditCard, FileText, Play, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth";
import PortalShell from "@/components/layout/PortalShell";
import { Badge, Button, Card, EmptyState, Input, PageHeader, Select } from "@/components/ui";
import { employees, payrollRecords as initialRecords, PayrollRecord } from "@/data/mockData";

const STATUS_STEPS: PayrollRecord["status"][] = ["draft", "approved", "processed", "paid"];

export default function PayrollRunsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [workingDays, setWorkingDays] = useState(22);
  const [records, setRecords] = useState<PayrollRecord[]>(initialRecords);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin") router.replace("/login");
  }, [user, router]);

  useEffect(() => {
    setSelected([]);
    setMessage("");
    setError("");
  }, [month]);

  const monthRecords = records.filter((record) => record.month === month);
  const selectedRecords = monthRecords.filter((record) => selected.includes(record.id));
  const totals = useMemo(() => {
    return monthRecords.reduce(
      (sum, record) => ({
        gross: sum.gross + record.grossPay,
        tax: sum.tax + record.taxDeduction,
        net: sum.net + record.netPay,
      }),
      { gross: 0, tax: 0, net: 0 }
    );
  }, [monthRecords]);

  const nextStatus = selectedRecords.length > 0 ? nextPayrollStatus(selectedRecords[0].status) : null;
  const canAdvance = Boolean(
    nextStatus && selectedRecords.length > 0 && selectedRecords.every((record) => record.status === selectedRecords[0].status)
  );

  const months = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() + index - 3);
    return date.toISOString().slice(0, 7);
  });

  if (!user) return null;

  const generatePayroll = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/hrm/payroll-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-month",
          month,
          workingDays,
          processedBy: user.id,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate payroll");
      }

      setRecords((current) => [...data.generated, ...current]);
      setMessage(`Generated ${data.generated.length} payroll record(s). ${data.skipped.length} employee(s) skipped.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate payroll");
    } finally {
      setLoading(false);
    }
  };

  const advanceSelected = async () => {
    if (!nextStatus) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/hrm/payroll-records", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selected,
          status: nextStatus,
          processedBy: user.id,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update payroll records");
      }

      const updates = new Map<string, PayrollRecord>(data.updated.map((record: PayrollRecord) => [record.id, record]));
      setRecords((current) => current.map((record) => updates.get(record.id) || record));
      setSelected([]);
      setMessage(`${data.updated.length} record(s) moved to ${nextStatus}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update payroll records");
    } finally {
      setLoading(false);
    }
  };

  const toggleRecord = (id: string) => {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const toggleAll = () => {
    setSelected((current) => current.length === monthRecords.length ? [] : monthRecords.map((record) => record.id));
  };

  return (
    <PortalShell>
      <PageHeader
        title="Payroll Runs"
        subtitle="Generate monthly payroll, review totals, and move records through approval to paid."
        action={
          <Button icon={<Play size={16} />} onClick={generatePayroll} loading={loading}>
            Generate Payroll
          </Button>
        }
      />

      <Card style={{ marginBottom: "var(--sp-6)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "var(--sp-4)", alignItems: "end" }}>
          <Select
            label="Payroll Month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            options={months.map((item) => ({
              value: item,
              label: new Date(`${item}-01`).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
            }))}
          />
          <Input
            label="Working Days"
            type="number"
            min={1}
            max={31}
            value={workingDays}
            onChange={(event) => setWorkingDays(Number(event.target.value) || 22)}
          />
          <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={generatePayroll} loading={loading}>
            Recalculate Missing
          </Button>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "var(--sp-4)", marginBottom: "var(--sp-6)" }}>
        <Metric label="Records" value={monthRecords.length.toString()} icon={<FileText size={18} />} />
        <Metric label="Gross Pay" value={`ZMW ${totals.gross.toFixed(2)}`} icon={<ClipboardCheck size={18} />} />
        <Metric label="Tax" value={`ZMW ${totals.tax.toFixed(2)}`} icon={<CreditCard size={18} />} />
        <Metric label="Net Pay" value={`ZMW ${totals.net.toFixed(2)}`} icon={<CheckCircle size={18} />} />
      </div>

      {(message || error) && (
        <div
          style={{
            padding: "var(--sp-4)",
            borderRadius: "var(--r-sm)",
            marginBottom: "var(--sp-5)",
            background: error ? "rgba(192,57,43,0.1)" : "rgba(30,132,73,0.1)",
            color: error ? "var(--urgent)" : "var(--success)",
          }}
        >
          {error || message}
        </div>
      )}

      {monthRecords.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck size={48} />}
          title="No payroll records"
          body="Generate payroll for this month after employee salary structures are configured."
        />
      ) : (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-5)", gap: "var(--sp-4)" }}>
            <div>
              <h2 style={{ fontSize: "1.05rem" }}>Payroll Records</h2>
              <p style={{ fontSize: "0.85rem", color: "var(--ink-muted)" }}>
                Select records with the same status to advance the workflow.
              </p>
            </div>
            <div style={{ display: "flex", gap: "var(--sp-3)", alignItems: "center" }}>
              <Button variant="secondary" size="sm" onClick={toggleAll}>
                {selected.length === monthRecords.length ? "Clear" : "Select All"}
              </Button>
              <Button size="sm" disabled={!canAdvance || loading} onClick={advanceSelected} loading={loading}>
                Move to {nextStatus || "Next"}
              </Button>
            </div>
          </div>

          <div style={{ display: "grid", gap: "var(--sp-3)" }}>
            {monthRecords.map((record) => {
              const employee = employees.find((item) => item.id === record.employeeId);
              return (
                <div
                  key={record.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "max-content 1.2fr repeat(4, 1fr) auto",
                    gap: "var(--sp-4)",
                    alignItems: "center",
                    padding: "var(--sp-4)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r-sm)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(record.id)}
                    onChange={() => toggleRecord(record.id)}
                    style={{ width: 18, height: 18 }}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>{employee?.name || "Unknown employee"}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--ink-muted)" }}>
                      {record.daysWorked}/{record.workingDays} days worked
                    </div>
                  </div>
                  <PayrollAmount label="Gross" value={record.grossPay} />
                  <PayrollAmount label="Tax" value={record.taxDeduction} />
                  <PayrollAmount label="Deductions" value={record.deductionsTotal} />
                  <PayrollAmount label="Net" value={record.netPay} strong />
                  <Badge label={record.status} variant={statusVariant(record.status)} />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <style>{`
        @media (max-width: 900px) {
          main div[style*="repeat(4"] { grid-template-columns: 1fr 1fr !important; }
          main div[style*="1.2fr repeat"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </PortalShell>
  );
}

function nextPayrollStatus(status: PayrollRecord["status"]) {
  const currentIndex = STATUS_STEPS.indexOf(status);
  return STATUS_STEPS[currentIndex + 1] || null;
}

function statusVariant(status: PayrollRecord["status"]) {
  if (status === "paid") return "success";
  if (status === "processed") return "forest";
  if (status === "approved") return "gold";
  return "normal";
}

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card padding="var(--sp-4)">
      <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--sp-3)" }}>
        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--ink-muted)", textTransform: "uppercase", marginBottom: 4 }}>
            {label}
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>{value}</div>
        </div>
        <div style={{ color: "var(--forest)" }}>{icon}</div>
      </div>
    </Card>
  );
}

function PayrollAmount({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: "0.72rem", color: "var(--ink-muted)", textTransform: "uppercase", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontWeight: strong ? 700 : 600 }}>ZMW {value.toFixed(2)}</div>
    </div>
  );
}
