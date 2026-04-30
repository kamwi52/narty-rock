// src/app/api/hrm/payroll-records/route.ts
// Payroll records (monthly salary calculations) management API endpoints

import { NextRequest, NextResponse } from "next/server";
import { payrollRecords, PayrollRecord } from "@/data/mockData";

/**
 * GET /api/hrm/payroll-records
 * Retrieve payroll records
 * Query params: month, employeeId, status (optional filters)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const employeeId = searchParams.get("employeeId");
    const status = searchParams.get("status");

    let filtered = [...payrollRecords];

    if (month) {
      filtered = filtered.filter((pr) => pr.month === month);
    }

    if (employeeId) {
      filtered = filtered.filter((pr) => pr.employeeId === employeeId);
    }

    if (status) {
      filtered = filtered.filter((pr) => pr.status === status);
    }

    return NextResponse.json({
      data: filtered,
      count: filtered.length,
      filters: { month, employeeId, status },
    });
  } catch (error) {
    console.error("[API] GET /api/hrm/payroll-records error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/hrm/payroll-records
 * Create a new payroll record
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ["payrollCycleId", "employeeId", "month", "basePay"];
    for (const field of required) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json({ error: `Field '${field}' is required` }, { status: 400 });
      }
    }

    // Calculate totals if not provided
    const allowancesTotal = body.allowancesTotal || 0;
    const grossPay = (body.basePay || 0) + allowancesTotal;
    const deductionsTotal = body.deductionsTotal || 0;
    const taxDeduction = body.taxDeduction || (grossPay * 0.15); // Default 15% tax
    const netPay = grossPay - deductionsTotal - taxDeduction;

    const newRecord: PayrollRecord = {
      id: `pr${Date.now()}`,
      payrollCycleId: body.payrollCycleId,
      employeeId: body.employeeId,
      month: body.month,
      workingDays: body.workingDays || 22,
      daysWorked: body.daysWorked || 22,
      basePay: body.basePay,
      allowancesTotal,
      grossPay,
      deductionsTotal,
      taxDeduction,
      netPay,
      status: body.status || "draft",
      notes: body.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    payrollRecords.push(newRecord);

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error("[API] POST /api/hrm/payroll-records error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/hrm/payroll-records
 * Update a payroll record
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: "Record ID is required" }, { status: 400 });
    }

    const index = payrollRecords.findIndex((pr) => pr.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: "Payroll record not found" }, { status: 404 });
    }

    // Can only update draft records
    if (payrollRecords[index].status !== "draft") {
      return NextResponse.json(
        { error: "Cannot update non-draft payroll records" },
        { status: 400 }
      );
    }

    // Recalculate totals
    const basePay = body.basePay || payrollRecords[index].basePay;
    const allowancesTotal = body.allowancesTotal || payrollRecords[index].allowancesTotal;
    const grossPay = basePay + allowancesTotal;
    const deductionsTotal = body.deductionsTotal || payrollRecords[index].deductionsTotal;
    const taxDeduction = body.taxDeduction || (grossPay * 0.15);
    const netPay = grossPay - deductionsTotal - taxDeduction;

    const updated: PayrollRecord = {
      ...payrollRecords[index],
      ...body,
      id: payrollRecords[index].id,
      createdAt: payrollRecords[index].createdAt,
      grossPay,
      netPay,
      updatedAt: new Date().toISOString(),
    };

    payrollRecords[index] = updated;

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[API] PUT /api/hrm/payroll-records error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/hrm/payroll-records
 * Batch update payroll records (e.g., approve all, mark as processed)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.ids || !Array.isArray(body.ids)) {
      return NextResponse.json({ error: "Array of IDs is required" }, { status: 400 });
    }

    if (!body.status) {
      return NextResponse.json({ error: "New status is required" }, { status: 400 });
    }

    const updated: PayrollRecord[] = [];

    for (const id of body.ids) {
      const index = payrollRecords.findIndex((pr) => pr.id === id);
      if (index !== -1) {
        payrollRecords[index].status = body.status;
        payrollRecords[index].updatedAt = new Date().toISOString();
        updated.push(payrollRecords[index]);
      }
    }

    return NextResponse.json({
      message: `Updated ${updated.length} records`,
      updated,
    });
  } catch (error) {
    console.error("[API] PATCH /api/hrm/payroll-records error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
