// src/app/api/hrm/payslips/send/route.ts
// Send payslips to employees via email

import { NextRequest, NextResponse } from "next/server";
import {
  payslips,
  payslipSendLogs,
  employees,
  PayslipSendLog,
} from "@/data/mockData";
import {
  sendPayslipEmail,
  sendBulkPayslips,
  getEmailConfigFromEnv,
  validateEmailConfig,
} from "@/lib/gmail-integration";
import * as fs from "fs";
import * as path from "path";

/**
 * POST /api/hrm/payslips/send
 * Send payslips to employees via email
 * Body: { payslipIds: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.payslipIds || !Array.isArray(body.payslipIds)) {
      return NextResponse.json(
        { error: "Array of payslipIds is required" },
        { status: 400 }
      );
    }

    // Get email configuration from environment
    const emailConfig = getEmailConfigFromEnv();

    // Validate email config
    const validation = validateEmailConfig(emailConfig);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Email configuration is incomplete",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const results: Array<{
      payslipId: string;
      employeeId: string;
      success: boolean;
      messageId?: string;
      error?: string;
      sentAt?: string;
    }> = [];

    for (const payslipId of body.payslipIds) {
      try {
        const payslip = payslips.find((ps) => ps.id === payslipId);
        if (!payslip) {
          results.push({
            payslipId,
            employeeId: "",
            success: false,
            error: "Payslip not found",
          });
          continue;
        }

        const employee = employees.find((e) => e.id === payslip.employeeId);
        if (!employee) {
          results.push({
            payslipId,
            employeeId: payslip.employeeId,
            success: false,
            error: "Employee not found",
          });
          continue;
        }

        // Read PDF file
        if (!payslip.pdfUrl) {
          results.push({
            payslipId,
            employeeId: payslip.employeeId,
            success: false,
            error: "PDF URL not found",
          });
          continue;
        }

        const pdfPath = path.join(process.cwd(), "public", payslip.pdfUrl);
        if (!fs.existsSync(pdfPath)) {
          results.push({
            payslipId,
            employeeId: payslip.employeeId,
            success: false,
            error: "PDF file not found on disk",
          });
          continue;
        }

        const pdfBuffer = fs.readFileSync(pdfPath);

        // Send email
        const emailResult = await sendPayslipEmail(
          {
            recipientEmail: employee.email,
            recipientName: employee.name,
            employeeId: employee.id,
            month: payslip.month,
            pdfAttachment: pdfBuffer,
            pdfFileName: `Payslip_${employee.name}_${payslip.month}.pdf`,
          },
          emailConfig
        );

        // Create send log
        const sendLog: PayslipSendLog = {
          id: `log${Date.now()}${Math.random().toString(36).substring(7)}`,
          payslipId,
          employeeId: employee.id,
          recipientEmail: employee.email,
          sentAt: emailResult.timestamp,
          status: emailResult.success ? "success" : "failed",
          messageId: emailResult.messageId,
          errorMessage: emailResult.error,
          attemptCount: 1,
          lastAttemptAt: emailResult.timestamp,
        };

        payslipSendLogs.push(sendLog);

        // Update payslip record
        if (emailResult.success) {
          payslip.sentViaEmail = true;
          payslip.sentAt = emailResult.timestamp;
        }

        results.push({
          payslipId,
          employeeId: employee.id,
          success: emailResult.success,
          messageId: emailResult.messageId,
          error: emailResult.error,
          sentAt: emailResult.timestamp,
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        results.push({
          payslipId,
          employeeId: "",
          success: false,
          error: errorMsg,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      message: `Sent payslips: ${successCount} success, ${failureCount} failed`,
      results,
      summary: {
        totalRequested: body.payslipIds.length,
        successCount,
        failureCount,
      },
    });
  } catch (error) {
    console.error("[API] POST /api/hrm/payslips/send error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/hrm/payslips/send
 * Get send logs
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const payslipId = searchParams.get("payslipId");
    const employeeId = searchParams.get("employeeId");
    const status = searchParams.get("status");

    let filtered = [...payslipSendLogs];

    if (payslipId) {
      filtered = filtered.filter((log) => log.payslipId === payslipId);
    }

    if (employeeId) {
      filtered = filtered.filter((log) => log.employeeId === employeeId);
    }

    if (status) {
      filtered = filtered.filter((log) => log.status === status);
    }

    return NextResponse.json({
      data: filtered,
      count: filtered.length,
    });
  } catch (error) {
    console.error("[API] GET /api/hrm/payslips/send error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
