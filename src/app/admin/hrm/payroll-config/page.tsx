"use client";
// src/app/admin/hrm/payroll-config/page.tsx
// Payroll Configuration: Set salary structures and allowances

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, Plus, Edit2, X, Check } from "lucide-react";
import { useAuth } from "@/lib/auth";
import PortalShell from "@/components/layout/PortalShell";
import { Card, Badge, Button, Input, Select, PageHeader, EmptyState } from "@/components/ui";
import { employees, payrollStructures as initialStructures, PayrollStructure, Employee } from "@/data/mockData";

interface PayrollForm {
  employeeId: string;
  basePay: number;
  housing: number;
  transport: number;
  meal: number;
  responsibility: number;
  pension: number;
  healthInsurance: number;
  unionFees: number;
  taxRate: number;
  taxBracket: string;
  notes: string;
}

const TAX_BRACKETS = ["Standard", "Exempt", "Special"];

export default function PayrollConfigPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [structures, setStructures] = useState<PayrollStructure[]>(initialStructures);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PayrollForm>({
    employeeId: employees[0]?.id || "",
    basePay: 4000,
    housing: 800,
    transport: 400,
    meal: 300,
    responsibility: 150,
    pension: 400,
    healthInsurance: 150,
    unionFees: 50,
    taxRate: 0.15,
    taxBracket: "Standard",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user || user.role !== "admin") router.replace("/login");
  }, [user, router]);

  if (!user) return null;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.employeeId) e.employeeId = "Employee is required";
    if (formData.basePay <= 0) e.basePay = "Base pay must be greater than 0";
    if (formData.taxRate < 0 || formData.taxRate > 1) e.taxRate = "Tax rate must be between 0 and 1";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const payload = {
        employeeId: formData.employeeId,
        basePay: formData.basePay,
        allowances: {
          housing: formData.housing,
          transport: formData.transport,
          meal: formData.meal,
          responsibility: formData.responsibility,
        },
        deductions: {
          pension: formData.pension,
          healthInsurance: formData.healthInsurance,
          unionFees: formData.unionFees,
        },
        taxRate: formData.taxRate,
        taxBracket: formData.taxBracket,
        notes: formData.notes,
        effectiveFrom: new Date().toISOString().split("T")[0],
      };

      const response = await fetch("/api/hrm/payroll-structures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newStructure = await response.json();
        setStructures((prev) => [newStructure, ...prev]);
        resetForm();
      } else {
        const error = await response.json();
        setErrors({ submit: error.error });
      }
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Failed to save" });
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: employees[0]?.id || "",
      basePay: 4000,
      housing: 800,
      transport: 400,
      meal: 300,
      responsibility: 150,
      pension: 400,
      healthInsurance: 150,
      unionFees: 50,
      taxRate: 0.15,
      taxBracket: "Standard",
      notes: "",
    });
    setEditingId(null);
    setShowForm(false);
    setErrors({});
  };

  // Get active structures
  const today = new Date().toISOString().split("T")[0];
  const activeStructures = structures.filter((s) => !s.effectiveTo || s.effectiveTo > today);

  // Helper to get employee name
  const getEmployeeName = (id: string) => employees.find((e) => e.id === id)?.name || "Unknown";

  // Calculate totals
  const getTotals = (data: PayrollForm) => {
    const allowancesTotal = data.housing + data.transport + data.meal + data.responsibility;
    const deductionsTotal = data.pension + data.healthInsurance + data.unionFees;
    const grossPay = data.basePay + allowancesTotal;
    const taxDeduction = grossPay * data.taxRate;
    const netPay = grossPay - deductionsTotal - taxDeduction;

    return { allowancesTotal, deductionsTotal, grossPay, taxDeduction, netPay };
  };

  const totals = getTotals(formData);

  return (
    <PortalShell>
      <PageHeader
        title="Payroll Configuration"
        subtitle="Set up salary structures, allowances, and deductions for each employee."
        action={
          <Button icon={<Plus size={16} />} onClick={() => { resetForm(); setShowForm(true); }}>
            Add Structure
          </Button>
        }
      />

      {/* Form */}
      {showForm && (
        <Card style={{ marginBottom: "var(--sp-6)", border: "2px solid var(--forest)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-5)" }}>
            <h2 style={{ fontSize: "1.05rem" }}>New Payroll Structure</h2>
            <button onClick={resetForm} style={{ background: "transparent", color: "var(--ink-muted)", padding: 4 }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ background: "#f9f9f9", padding: "var(--sp-5)", borderRadius: "var(--r-sm)", marginBottom: "var(--sp-5)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--sp-4)" }}>
              <div>
                <div style={{ fontSize: "0.9rem", color: "var(--ink-muted)", marginBottom: "4px" }}>GROSS PAY</div>
                <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--forest)" }}>ZMW {totals.grossPay.toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.9rem", color: "var(--ink-muted)", marginBottom: "4px" }}>DEDUCTIONS</div>
                <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--urgent)" }}>ZMW {(totals.deductionsTotal + totals.taxDeduction).toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.9rem", color: "var(--ink-muted)", marginBottom: "4px" }}>NET PAY</div>
                <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#003366" }}>ZMW {totals.netPay.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <Select
            label="Employee *"
            options={employees.filter(e => e.status === 'active').map((e) => ({ value: e.id, label: e.name }))}
            value={formData.employeeId}
            onChange={(e) => setFormData((f) => ({ ...f, employeeId: e.target.value }))}
          />

          <h3 style={{ fontSize: "1rem", fontWeight: 600, marginTop: "var(--sp-6)", marginBottom: "var(--sp-4)" }}>Basic Salary</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--sp-4)", marginBottom: "var(--sp-5)" }}>
            <Input
              label="Base Pay (Monthly) *"
              type="number"
              value={formData.basePay}
              onChange={(e) => setFormData((f) => ({ ...f, basePay: parseFloat(e.target.value) || 0 }))}
              error={errors.basePay}
            />
          </div>

          <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "var(--sp-4)" }}>Allowances</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-4)", marginBottom: "var(--sp-5)" }}>
            <Input
              label="Housing Allowance"
              type="number"
              value={formData.housing}
              onChange={(e) => setFormData((f) => ({ ...f, housing: parseFloat(e.target.value) || 0 }))}
            />
            <Input
              label="Transport Allowance"
              type="number"
              value={formData.transport}
              onChange={(e) => setFormData((f) => ({ ...f, transport: parseFloat(e.target.value) || 0 }))}
            />
            <Input
              label="Meal Allowance"
              type="number"
              value={formData.meal}
              onChange={(e) => setFormData((f) => ({ ...f, meal: parseFloat(e.target.value) || 0 }))}
            />
            <Input
              label="Responsibility Allowance"
              type="number"
              value={formData.responsibility}
              onChange={(e) => setFormData((f) => ({ ...f, responsibility: parseFloat(e.target.value) || 0 }))}
            />
          </div>

          <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "var(--sp-4)" }}>Deductions</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-4)", marginBottom: "var(--sp-5)" }}>
            <Input
              label="Pension Contribution"
              type="number"
              value={formData.pension}
              onChange={(e) => setFormData((f) => ({ ...f, pension: parseFloat(e.target.value) || 0 }))}
            />
            <Input
              label="Health Insurance"
              type="number"
              value={formData.healthInsurance}
              onChange={(e) => setFormData((f) => ({ ...f, healthInsurance: parseFloat(e.target.value) || 0 }))}
            />
            <Input
              label="Union Fees"
              type="number"
              value={formData.unionFees}
              onChange={(e) => setFormData((f) => ({ ...f, unionFees: parseFloat(e.target.value) || 0 }))}
            />
          </div>

          <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "var(--sp-4)" }}>Tax Configuration</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-4)", marginBottom: "var(--sp-5)" }}>
            <Select
              label="Tax Bracket"
              options={TAX_BRACKETS.map((b) => ({ value: b, label: b }))}
              value={formData.taxBracket}
              onChange={(e) => setFormData((f) => ({ ...f, taxBracket: e.target.value }))}
            />
            <Input
              label="Tax Rate (0-1, e.g. 0.15 for 15%)"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.taxRate}
              onChange={(e) => setFormData((f) => ({ ...f, taxRate: parseFloat(e.target.value) || 0 }))}
              error={errors.taxRate}
            />
          </div>

          {errors.submit && (
            <div style={{ background: "rgba(192,57,43,0.1)", color: "var(--urgent)", padding: "var(--sp-3)", borderRadius: "var(--r-sm)", marginBottom: "var(--sp-4)", fontSize: "0.9rem" }}>
              {errors.submit}
            </div>
          )}

          <div style={{ display: "flex", gap: "var(--sp-4)", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={resetForm}>Cancel</Button>
            <Button icon={<Check size={16} />} onClick={handleSave}>Save Structure</Button>
          </div>
        </Card>
      )}

      {/* Structures List */}
      {activeStructures.length === 0 ? (
        <EmptyState icon={<DollarSign size={48} />} title="No payroll structures" body="Add a payroll structure to get started." />
      ) : (
        <div style={{ display: "grid", gap: "var(--sp-4)" }}>
          {activeStructures.map((structure) => (
            <Card key={structure.id} padding="var(--sp-5)">
              <div style={{ display: "grid", gridTemplateColumns: "max-content 1fr auto", gap: "var(--sp-6)", alignItems: "flex-start" }}>
                {/* Employee Info */}
                <div>
                  <div style={{ fontWeight: 600, marginBottom: "8px", minWidth: "150px" }}>{getEmployeeName(structure.employeeId)}</div>
                  <Badge label={structure.taxBracket} variant="gold" />
                </div>

                {/* Salary Breakdown */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "var(--sp-4)" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--ink-muted)", textTransform: "uppercase", marginBottom: "4px" }}>Base</div>
                    <div style={{ fontSize: "1rem", fontWeight: 600 }}>ZMW {structure.basePay}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--ink-muted)", textTransform: "uppercase", marginBottom: "4px" }}>Allowances</div>
                    <div style={{ fontSize: "1rem", fontWeight: 600 }}>
                      ZMW {Object.values(structure.allowances || {}).reduce((a, b) => (a || 0) + (b || 0), 0)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--ink-muted)", textTransform: "uppercase", marginBottom: "4px" }}>Gross</div>
                    <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--forest)" }}>
                      ZMW {(structure.basePay + Object.values(structure.allowances || {}).reduce((a, b) => (a || 0) + (b || 0), 0)).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--ink-muted)", textTransform: "uppercase", marginBottom: "4px" }}>Deductions</div>
                    <div style={{ fontSize: "1rem", fontWeight: 600 }}>
                      ZMW {Object.values(structure.deductions || {}).reduce((a, b) => (a || 0) + (b || 0), 0)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--ink-muted)", textTransform: "uppercase", marginBottom: "4px" }}>Tax Rate</div>
                    <div style={{ fontSize: "1rem", fontWeight: 600 }}>{(structure.taxRate * 100).toFixed(1)}%</div>
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
