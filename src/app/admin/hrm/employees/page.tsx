"use client";
// src/app/admin/hrm/employees/page.tsx
// Employee Management: Add, edit, view, deactivate teacher profiles

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, Edit2, Trash2, X, Eye, EyeOff, Check } from "lucide-react";
import { useAuth } from "@/lib/auth";
import PortalShell from "@/components/layout/PortalShell";
import { Card, Badge, Button, Input, Select, PageHeader, EmptyState } from "@/components/ui";
import { employees as initialEmployees, Employee } from "@/data/mockData";

type EmployeeForm = Omit<Employee, "id" | "createdAt" | "updatedAt">;

const DEPARTMENTS = [
  "Administration",
  "Science",
  "Languages",
  "Mathematics",
  "Social Studies",
  "Arts",
  "Physical Education",
];

const ROLES = ["Teacher", "Support Staff", "Administrative", "Management"];

export default function HRMEmployeesPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EmployeeForm>({
    name: "",
    email: "",
    phone: "",
    role: "Teacher",
    department: "Administration",
    joiningDate: new Date().toISOString().split("T")[0],
    status: "active",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("active");

  // Authorization check
  useEffect(() => {
    if (!user || user.role !== "admin") router.replace("/login");
  }, [user, router]);

  if (!user) return null;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = "Name is required";
    if (!formData.email.trim()) e.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Valid email is required";
    if (!formData.phone.trim()) e.phone = "Phone is required";
    if (!formData.joiningDate) e.joiningDate = "Joining date is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      if (editingId) {
        // Update existing
        const response = await fetch("/api/hrm/employees", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            ...formData,
          }),
        });

        if (response.ok) {
          const updated = await response.json();
          setEmployees((prev) =>
            prev.map((e) => (e.id === editingId ? updated : e))
          );
          resetForm();
        }
      } else {
        // Create new
        const response = await fetch("/api/hrm/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const newEmployee = await response.json();
          setEmployees((prev) => [...prev, newEmployee]);
          resetForm();
        }
      }
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Failed to save" });
    }
  };

  const handleEdit = (emp: Employee) => {
    const { id, createdAt, updatedAt, ...rest } = emp;
    setFormData(rest);
    setEditingId(id);
    setShowForm(true);
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("Deactivate this employee?")) return;

    try {
      const response = await fetch("/api/hrm/employees", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setEmployees((prev) =>
          prev.map((e) =>
            e.id === id ? { ...e, status: "inactive" as const } : e
          )
        );
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to deactivate");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "Teacher",
      department: "Administration",
      joiningDate: new Date().toISOString().split("T")[0],
      status: "active",
    });
    setEditingId(null);
    setShowForm(false);
    setErrors({});
  };

  const filtered = employees.filter((e) =>
    filterStatus === "all" ? true : e.status === filterStatus
  );

  const statusBadgeColor = (status: string) => {
    if (status === "active") return "success";
    if (status === "on-leave") return "high";
    return "normal";
  };

  return (
    <PortalShell>
      <PageHeader
        title="Employee Management"
        subtitle="Manage teacher and staff profiles, roles, and employment details."
        action={
          <Button icon={<Plus size={16} />} onClick={() => { resetForm(); setShowForm(true); }}>
            Add Employee
          </Button>
        }
      />

      {/* Filters */}
      <div style={{ display: "flex", gap: "var(--sp-4)", marginBottom: "var(--sp-6)" }}>
        {(["all", "active", "inactive"] as const).map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? "primary" : "secondary"}
            size="sm"
            onClick={() => setFilterStatus(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} ({filtered.filter(e => e.status === (status === "all" ? e.status : status)).length})
          </Button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <Card style={{ marginBottom: "var(--sp-6)", border: "2px solid var(--forest)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-5)" }}>
            <h2 style={{ fontSize: "1.05rem" }}>{editingId ? "Edit Employee" : "New Employee"}</h2>
            <button onClick={resetForm} style={{ background: "transparent", color: "var(--ink-muted)", padding: 4 }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-4)", marginBottom: "var(--sp-4)" }}>
            <Input
              label="Full Name *"
              placeholder="e.g. Mr. Phiri"
              value={formData.name}
              onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
              error={errors.name}
            />
            <Input
              label="Email Address *"
              placeholder="e.g. phiri@school.edu.zm"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
              error={errors.email}
            />
            <Input
              label="Phone Number *"
              placeholder="e.g. +260 971 123 456"
              value={formData.phone}
              onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
              error={errors.phone}
            />
            <Select
              label="Role *"
              options={ROLES.map((r) => ({ value: r, label: r }))}
              value={formData.role}
              onChange={(e) => setFormData((f) => ({ ...f, role: e.target.value }))}
            />
            <Select
              label="Department *"
              options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
              value={formData.department}
              onChange={(e) => setFormData((f) => ({ ...f, department: e.target.value }))}
            />
            <Input
              label="Joining Date *"
              type="date"
              value={formData.joiningDate}
              onChange={(e) => setFormData((f) => ({ ...f, joiningDate: e.target.value }))}
              error={errors.joiningDate}
            />
            <Input
              label="Tax ID"
              placeholder="e.g. TAX-2020-MP"
              value={formData.taxId || ""}
              onChange={(e) => setFormData((f) => ({ ...f, taxId: e.target.value }))}
            />
            <Input
              label="Bank Account"
              placeholder="Account number"
              value={formData.bankAccount || ""}
              onChange={(e) => setFormData((f) => ({ ...f, bankAccount: e.target.value }))}
            />
          </div>

          {errors.submit && (
            <div style={{ background: "rgba(192,57,43,0.1)", color: "var(--urgent)", padding: "var(--sp-3)", borderRadius: "var(--r-sm)", marginBottom: "var(--sp-4)", fontSize: "0.9rem" }}>
              {errors.submit}
            </div>
          )}

          <div style={{ display: "flex", gap: "var(--sp-4)", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={resetForm}>Cancel</Button>
            <Button icon={<Check size={16} />} onClick={handleSave}>{editingId ? "Update" : "Save"}</Button>
          </div>
        </Card>
      )}

      {/* Employee List */}
      {filtered.length === 0 ? (
        <EmptyState icon={<Users size={48} />} title="No employees" body="No employees found. Add one to get started." />
      ) : (
        <div style={{ display: "grid", gap: "var(--sp-4)" }}>
          {filtered.map((emp) => (
            <Card key={emp.id} hover padding="var(--sp-5)">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: "var(--sp-4)", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: "4px" }}>{emp.name}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--ink-muted)" }}>{emp.role} • {emp.department}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", color: "var(--ink-muted)" }}>Email</div>
                  <div style={{ fontSize: "0.9rem" }}>{emp.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", color: "var(--ink-muted)" }}>Phone</div>
                  <div style={{ fontSize: "0.9rem" }}>{emp.phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", color: "var(--ink-muted)" }}>{emp.status === "on-leave" ? "Status" : "Joined"}</div>
                  {emp.status === "on-leave" ? (
                    <Badge label="On Leave" variant="high" />
                  ) : emp.status === "active" ? (
                    <Badge label="Active" variant="success" />
                  ) : (
                    <Badge label="Inactive" variant="normal" />
                  )}
                </div>
                <div style={{ display: "flex", gap: "var(--sp-2)" }}>
                  <button
                    onClick={() => handleEdit(emp)}
                    style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--forest)", fontSize: "1rem" }}
                  >
                    <Edit2 size={18} />
                  </button>
                  {emp.status === "active" && (
                    <button
                      onClick={() => handleDeactivate(emp.id)}
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--urgent)", fontSize: "1rem" }}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PortalShell>
  );
}
