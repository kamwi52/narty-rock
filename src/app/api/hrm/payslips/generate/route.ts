// src/app/api/hrm/payslips/generate/route.ts
// Generate payslips as PDFs from payroll records

import { NextRequest, NextResponse } from "next/server";
import {
  payrollRecords,
  payrollStructures,
  employees,
  payslips,
  Payslip,
} from "@/data/mockData";
import { generatePayslipPDF } from "@/lib/pdf-generator";
import * as fs from "fs";
import * as path from "path";

/**
 * POST /api/hrm/payslips/generate
 * Generate payslips for specified payroll records
 * Body: { payrollRecordIds: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.payrollRecordIds || !Array.isArray(body.payrollRecordIds)) {
      return NextResponse.json(
        { error: "Array of payrollRecordIds is required" },
        { status: 400 }
      );
    }

    const generated: Payslip[] = [];
    const errors: Array<{ recordId: string; error: string }> = [];

    // NOTE: The production filesystem on Netlify is read-only. 
    // /tmp is available for temporary storage during the request lifecycle.
    const pdfDir = path.join("/tmp", "payslips");

    // Only attempt directory creation in non-production environments 
    // or handle gracefully in /tmp
    if (typeof window === 'undefined' && !fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    for (const recordId of body.payrollRecordIds) {
      try {
        const record = payrollRecords.find((pr) => pr.id === recordId);
        if (!record) {
          errors.push({ recordId, error: "Payroll record not found" });
          continue;
        }

        const employee = employees.find((e) => e.id === record.employeeId);
        if (!employee) {
          errors.push({ recordId, error: "Employee not found" });
          continue;
        }

        const structure = payrollStructures.find(
          (ps) =>
            ps.employeeId === record.employeeId &&
            (!ps.effectiveTo || ps.effectiveTo > record.month)
        );

        if (!structure) {
          errors.push({ recordId, error: "Payroll structure not found" });
          continue;
        }

        // Generate PDF
        const pdfBuffer = await generatePayslipPDF({
          employee,
          payrollStructure: structure,
          payrollRecord: record,
          schoolName: "Narty Rock Private School",
          bankDetails: {
            bankName: "ZamBank",
            accountNumber: "1234567890",
          },
        });

        // Save PDF to file system
        const filename = `payslip_${employee.id}_${record.month}.pdf`;
        // Using a timestamped or unique filename prevents collisions in /tmp
        const uniqueFilename = `${Date.now()}_${filename}`;
        const filepath = path.join(pdfDir, uniqueFilename);
        
        fs.writeFileSync(filepath, pdfBuffer);

        // Create payslip record
        const payslip: Payslip = {
          id: `ps${Date.now()}${Math.random().toString(36).substring(7)}`,
          payrollRecordId: recordId,
          employeeId: record.employeeId,
          month: record.month,
          generatedAt: new Date().toISOString(),
          sentViaEmail: false,
        };

        payslips.push(payslip);
        generated.push(payslip);

        // Mark payroll record as processed
        record.status = "processed";
        record.updatedAt = new Date().toISOString();
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        errors.push({ recordId, error: errorMsg });
      }
    }

    return NextResponse.json({
      message: `Generated ${generated.length} payslips`,
      generated,
      errors: errors.length > 0 ? errors : undefined,
      successCount: generated.length,
      errorCount: errors.length,
    });
  } catch (error) {
    console.error("[API] POST /api/hrm/payslips/generate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/hrm/payslips/generate
 * Get generation status/history
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const employeeId = searchParams.get("employeeId");

    let filtered = [...payslips];

    if (month) {
      filtered = filtered.filter((ps) => ps.month === month);
    }

    if (employeeId) {
      filtered = filtered.filter((ps) => ps.employeeId === employeeId);
    }

    return NextResponse.json({
      data: filtered,
      count: filtered.length,
    });
  } catch (error) {
    console.error("[API] GET /api/hrm/payslips/generate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
