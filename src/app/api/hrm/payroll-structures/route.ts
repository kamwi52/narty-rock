// src/app/api/hrm/payroll-structures/route.ts
// Payroll structure (salary configuration) management API endpoints

import { NextRequest, NextResponse } from "next/server";
import { payrollStructures, PayrollStructure } from "@/data/mockData";

/**
 * GET /api/hrm/payroll-structures
 * Retrieve payroll structures
 * Query params: employeeId (optional - get current structure for employee)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    if (employeeId) {
      // Get current active structure for employee
      const structure = payrollStructures.find(
        (ps) => ps.employeeId === employeeId && (!ps.effectiveTo || ps.effectiveTo > new Date().toISOString().split("T")[0])
      );

      if (!structure) {
        return NextResponse.json({ error: "No active payroll structure found for this employee" }, { status: 404 });
      }

      return NextResponse.json(structure);
    }

    return NextResponse.json({
      data: payrollStructures,
      count: payrollStructures.length,
    });
  } catch (error) {
    console.error("[API] GET /api/hrm/payroll-structures error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/hrm/payroll-structures
 * Create a new payroll structure
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ["employeeId", "basePay", "taxRate", "effectiveFrom"];
    for (const field of required) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json({ error: `Field '${field}' is required` }, { status: 400 });
      }
    }

    // If creating new structure for employee, mark old one as inactive
    const oldStructure = payrollStructures.find(
      (ps) => ps.employeeId === body.employeeId && !ps.effectiveTo
    );

    if (oldStructure) {
      oldStructure.effectiveTo = new Date().toISOString().split("T")[0];
    }

    const newStructure: PayrollStructure = {
      id: `ps${Date.now()}`,
      employeeId: body.employeeId,
      basePay: body.basePay,
      allowances: body.allowances || {},
      deductions: body.deductions || {},
      taxBracket: body.taxBracket || "Standard",
      taxRate: body.taxRate,
      currency: body.currency || "ZMW",
      effectiveFrom: body.effectiveFrom,
      effectiveTo: body.effectiveTo || null,
      notes: body.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    payrollStructures.push(newStructure);

    return NextResponse.json(newStructure, { status: 201 });
  } catch (error) {
    console.error("[API] POST /api/hrm/payroll-structures error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/hrm/payroll-structures
 * Update a payroll structure
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: "Structure ID is required" }, { status: 400 });
    }

    const index = payrollStructures.findIndex((ps) => ps.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: "Payroll structure not found" }, { status: 404 });
    }

    // Only allow updates to notes and dates for historical records
    const updated: PayrollStructure = {
      ...payrollStructures[index],
      notes: body.notes || payrollStructures[index].notes,
      effectiveTo: body.effectiveTo || payrollStructures[index].effectiveTo,
      updatedAt: new Date().toISOString(),
    };

    payrollStructures[index] = updated;

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[API] PUT /api/hrm/payroll-structures error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
