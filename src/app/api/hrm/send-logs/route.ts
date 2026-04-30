// src/app/api/hrm/send-logs/route.ts
// View payslip send logs and audit trail

import { NextRequest, NextResponse } from "next/server";
import { payslipSendLogs } from "@/data/mockData";

/**
 * GET /api/hrm/send-logs
 * Retrieve send logs with optional filtering
 * Query params: status, employeeId, month (optional filters)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const employeeId = searchParams.get("employeeId");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    let filtered = [...payslipSendLogs];

    // Apply filters
    if (status) {
      filtered = filtered.filter((log) => log.status === status);
    }

    if (employeeId) {
      filtered = filtered.filter((log) => log.employeeId === employeeId);
    }

    // Sort by most recent first
    filtered.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

    // Apply pagination
    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      data: paginated,
      count: paginated.length,
      total: filtered.length,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < filtered.length,
      },
    });
  } catch (error) {
    console.error("[API] GET /api/hrm/send-logs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/hrm/send-logs/summary
 * Get summary statistics for send logs
 */
export async function HEAD(request: NextRequest) {
  try {
    const total = payslipSendLogs.length;
    const successful = payslipSendLogs.filter((log) => log.status === "success").length;
    const failed = payslipSendLogs.filter((log) => log.status === "failed").length;
    const pending = payslipSendLogs.filter((log) => log.status === "pending").length;

    const successRate = total > 0 ? ((successful / total) * 100).toFixed(2) : "0";

    return NextResponse.json({
      summary: {
        total,
        successful,
        failed,
        pending,
        successRate: `${successRate}%`,
      },
      lastSent: payslipSendLogs.length > 0
        ? payslipSendLogs[payslipSendLogs.length - 1].sentAt
        : null,
    });
  } catch (error) {
    console.error("[API] HEAD /api/hrm/send-logs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
