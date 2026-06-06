// src/app/api/hrm/payroll-records/route.ts
// Payroll records (monthly salary calculations) management API endpoints

import { NextRequest, NextResponse } from "next/server";
import {
  employees,
  payrollCycles,
  payrollRecords,
  payrollStructures,
  PayrollRecord,
} from "@/data/mockData";

const PAYROLL_STATUSES = ["draft", "approved", "processed", "paid"] as const;
const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ["approved"],
  approved: ["processed"],
  processed: ["paid"],
  paid: [],
};

function currentStructureFor(employeeId: string, month: string) {
  return payrollStructures.find((structure) => {
    if (structure.employeeId !== employeeId) return false;
    const startsBeforeMonth = structure.effectiveFrom <= `${month}-31`;
    const notEnded = !structure.effectiveTo || structure.effectiveTo >= `${month}-01`;
    return startsBeforeMonth && notEnded;
  });
}

function sumValues(values: Record<string, number | undefined>) {
  return Object.values(values).reduce<number>((total, value) => total + (value || 0), 0);
}

function createRecordFromStructure(args: {
  payrollCycleId: string;
  employeeId: string;
  month: string;
  workingDays: number;
  daysWorked: number;
  processedBy?: string;
}): PayrollRecord | null {
  const structure = currentStructureFor(args.employeeId, args.month);
  if (!structure) return null;

  const attendanceRatio = args.workingDays > 0 ? args.daysWorked / args.workingDays : 1;
  const basePay = Number((structure.basePay * attendanceRatio).toFixed(2));
  const allowancesTotal = Number((sumValues(structure.allowances) * attendanceRatio).toFixed(2));
  const deductionsTotal = sumValues(structure.deductions);
  const grossPay = Number((basePay + allowancesTotal).toFixed(2));
  const taxDeduction = Number((grossPay * structure.taxRate).toFixed(2));
  const netPay = Number((grossPay - deductionsTotal - taxDeduction).toFixed(2));
  const now = new Date().toISOString();

  return {
    id: `pr${Date.now()}${Math.random().toString(16).slice(2)}`,
    payrollCycleId: args.payrollCycleId,
    employeeId: args.employeeId,
    month: args.month,
    workingDays: args.workingDays,
    daysWorked: args.daysWorked,
    basePay,
    allowancesTotal,
    grossPay,
    deductionsTotal,
    taxDeduction,
    netPay,
    status: "draft",
    processedBy: args.processedBy,
    createdAt: now,
    updatedAt: now,
  };
}

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

    if (body.action === "generate-month") {
      if (!/^\d{4}-\d{2}$/.test(body.month || "")) {
        return NextResponse.json({ error: "Month must use YYYY-MM format" }, { status: 400 });
      }

      const workingDays = Number(body.workingDays || 22);
      const daysWorkedByEmployee = body.daysWorkedByEmployee || {};
      if (workingDays < 1 || workingDays > 31) {
        return NextResponse.json({ error: "Working days must be between 1 and 31" }, { status: 400 });
      }

      let cycle = payrollCycles.find((existingCycle) => existingCycle.month === body.month);
      if (cycle && ["completed", "archived"].includes(cycle.status)) {
        return NextResponse.json({ error: "This payroll month is locked" }, { status: 400 });
      }

      if (!cycle) {
        const now = new Date().toISOString();
        cycle = {
          id: `cycle${Date.now()}`,
          month: body.month,
          status: "draft",
          processedBy: body.processedBy || "system",
          totalEmployees: 0,
          totalGrossPay: 0,
          totalNetPay: 0,
          createdAt: now,
          updatedAt: now,
        };
        payrollCycles.push(cycle);
      }

      const generated: PayrollRecord[] = [];
      const skipped: string[] = [];

      for (const employee of employees.filter((item) => item.status === "active")) {
        const alreadyExists = payrollRecords.some(
          (record) => record.employeeId === employee.id && record.month === body.month
        );
        if (alreadyExists) {
          skipped.push(employee.id);
          continue;
        }

        const daysWorked = Number(daysWorkedByEmployee[employee.id] || workingDays);
        const record = createRecordFromStructure({
          payrollCycleId: cycle.id,
          employeeId: employee.id,
          month: body.month,
          workingDays,
          daysWorked: Math.min(daysWorked, workingDays),
          processedBy: body.processedBy,
        });

        if (record) {
          payrollRecords.push(record);
          generated.push(record);
        } else {
          skipped.push(employee.id);
        }
      }

      const cycleRecords = payrollRecords.filter((record) => record.payrollCycleId === cycle.id);
      cycle.totalEmployees = cycleRecords.length;
      cycle.totalGrossPay = Number(cycleRecords.reduce((total, record) => total + record.grossPay, 0).toFixed(2));
      cycle.totalNetPay = Number(cycleRecords.reduce((total, record) => total + record.netPay, 0).toFixed(2));
      cycle.updatedAt = new Date().toISOString();

      return NextResponse.json({ cycle, generated, skipped }, { status: 201 });
    }

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

    if (!body.status || !PAYROLL_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "New status is required" }, { status: 400 });
    }

    const updated: PayrollRecord[] = [];

    for (const id of body.ids) {
      const index = payrollRecords.findIndex((pr) => pr.id === id);
      if (index !== -1) {
        const currentStatus = payrollRecords[index].status;
        if (!VALID_TRANSITIONS[currentStatus]?.includes(body.status)) {
          continue;
        }
        payrollRecords[index].status = body.status;
        payrollRecords[index].processedBy = body.processedBy || payrollRecords[index].processedBy;
        payrollRecords[index].updatedAt = new Date().toISOString();
        updated.push(payrollRecords[index]);
      }
    }

    const touchedCycleIds = Array.from(new Set(updated.map((record) => record.payrollCycleId)));
    for (const cycleId of touchedCycleIds) {
      const cycle = payrollCycles.find((item) => item.id === cycleId);
      const cycleRecords = payrollRecords.filter((record) => record.payrollCycleId === cycleId);
      if (cycle && cycleRecords.length > 0) {
        if (cycleRecords.every((record) => record.status === "paid")) {
          cycle.status = "completed";
          cycle.processedAt = new Date().toISOString();
        } else if (cycleRecords.some((record) => record.status === "processed" || record.status === "paid")) {
          cycle.status = "processing";
        }
        cycle.updatedAt = new Date().toISOString();
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
