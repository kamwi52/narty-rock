// src/lib/pdf-generator.ts
// Server-side PDF generation for payslips using PDFKit.
// This file should only be used in API routes (server-side).

import PDFDocument from "pdfkit";
import { Readable } from "stream";
import { PayrollRecord, Employee, PayrollStructure } from "@/data/mockData";

interface PayslipGenerationInput {
  employee: Employee;
  payrollStructure: PayrollStructure;
  payrollRecord: PayrollRecord;
  schoolName?: string;
  schoolLogo?: string; // Base64 or URL
  bankDetails?: {
    bankName: string;
    accountNumber: string;
  };
}

/**
 * Generate a professional payslip PDF as a Buffer
 * Returns a Buffer containing the PDF data
 */
export async function generatePayslipPDF(
  input: PayslipGenerationInput
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        bufferPages: true,
      });

      const buffers: Buffer[] = [];

      doc.on("data", (chunk) => {
        buffers.push(chunk);
      });

      doc.on("end", () => {
        resolve(Buffer.concat(buffers));
      });

      doc.on("error", reject);

      // ──────────────────────────────────────────────────────────────────────────
      // Header
      // ──────────────────────────────────────────────────────────────────────────
      doc.fontSize(14).font("Helvetica-Bold").text(input.schoolName || "Narty Rock Private School", 40, 40);

      doc.fontSize(10).font("Helvetica").fillColor("#666").text("Payslip", 40, 60);

      // Right side: Document details
      const rightX = 400;
      doc
        .fontSize(9)
        .font("Helvetica")
        .text(`Month: ${input.payrollRecord.month}`, rightX, 50, { align: "right" })
        .text(`Payslip ID: ${input.payrollRecord.id}`, rightX, 65, { align: "right" })
        .text(`Date: ${new Date(input.payrollRecord.createdAt).toLocaleDateString()}`, rightX, 80, {
          align: "right",
        });

      // ──────────────────────────────────────────────────────────────────────────
      // Employee & Period Information
      // ──────────────────────────────────────────────────────────────────────────
      doc
        .moveTo(40, 100)
        .lineTo(555, 100)
        .stroke("#ddd");

      doc.fontSize(11).font("Helvetica-Bold").fillColor("#000").text("Employee Information", 40, 110);

      const employeeInfoY = 130;
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#333")
        .text(`Name: ${input.employee.name}`, 40, employeeInfoY)
        .text(`Employee ID: ${input.employee.id}`, 40, employeeInfoY + 15)
        .text(`Role: ${input.employee.role}`, 40, employeeInfoY + 30)
        .text(`Department: ${input.employee.department}`, 40, employeeInfoY + 45);

      doc
        .text(`Email: ${input.employee.email}`, rightX, employeeInfoY)
        .text(`Phone: ${input.employee.phone}`, rightX, employeeInfoY + 15)
        .text(`Tax ID: ${input.employee.taxId || "N/A"}`, rightX, employeeInfoY + 30)
        .text(`Joining Date: ${input.employee.joiningDate}`, rightX, employeeInfoY + 45);

      // ──────────────────────────────────────────────────────────────────────────
      // Earnings Section
      // ──────────────────────────────────────────────────────────────────────────
      const earningsY = 235;
      doc
        .moveTo(40, earningsY - 10)
        .lineTo(555, earningsY - 10)
        .stroke("#ddd");

      doc.fontSize(11).font("Helvetica-Bold").text("Earnings", 40, earningsY);

      // Table headers
      const tableTop = earningsY + 20;
      const col1 = 40;
      const col2 = 400;

      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor("#333")
        .text("Description", col1, tableTop)
        .text("Amount", col2, tableTop, { align: "right" });

      doc.strokeColor("#eee").moveTo(col1, tableTop + 15).lineTo(555, tableTop + 15).stroke();

      // Earnings rows
      let row = tableTop + 20;
      const earnings = [
        {
          label: "Base Salary",
          value: input.payrollRecord.basePay,
        },
      ];

      // Add allowances
      if (input.payrollRecord.allowancesTotal > 0) {
        earnings.push({
          label: "Allowances (Housing, Transport, etc.)",
          value: input.payrollRecord.allowancesTotal,
        });
      }

      doc.font("Helvetica").fillColor("#333");
      earnings.forEach((item) => {
        doc.text(item.label, col1, row);
        doc.text(formatCurrency(item.value, input.payrollStructure.currency), col2, row, {
          align: "right",
        });
        row += 15;
      });

      // Gross pay (highlighted)
      doc
        .moveTo(40, row)
        .lineTo(555, row)
        .stroke("#ddd");
      row += 10;
      doc
        .font("Helvetica-Bold")
        .fillColor("#000")
        .text("GROSS PAY", col1, row)
        .text(formatCurrency(input.payrollRecord.grossPay, input.payrollStructure.currency), col2, row, {
          align: "right",
        });

      // ──────────────────────────────────────────────────────────────────────────
      // Deductions Section
      // ──────────────────────────────────────────────────────────────────────────
      row += 25;
      doc
        .moveTo(40, row)
        .lineTo(555, row)
        .stroke("#ddd");

      row += 10;
      doc.fontSize(11).font("Helvetica-Bold").fillColor("#333").text("Deductions", 40, row);

      row += 20;
      doc.fontSize(9).font("Helvetica-Bold").fillColor("#555").text("Description", col1, row).text("Amount", col2, row, {
        align: "right",
      });

      doc.strokeColor("#eee").moveTo(col1, row + 15).lineTo(555, row + 15).stroke();

      row += 20;
      const deductions = [
        {
          label: "Income Tax",
          value: input.payrollRecord.taxDeduction,
        },
        {
          label: "Pension & Social Security",
          value: input.payrollRecord.deductionsTotal - input.payrollRecord.taxDeduction,
        },
      ];

      doc.font("Helvetica").fillColor("#333");
      deductions.forEach((item) => {
        if (item.value > 0) {
          doc.text(item.label, col1, row);
          doc.text(formatCurrency(item.value, input.payrollStructure.currency), col2, row, {
            align: "right",
          });
          row += 15;
        }
      });

      // Total deductions
      doc
        .moveTo(40, row)
        .lineTo(555, row)
        .stroke("#ddd");
      row += 10;
      doc
        .font("Helvetica-Bold")
        .fillColor("#333")
        .text("TOTAL DEDUCTIONS", col1, row)
        .text(formatCurrency(input.payrollRecord.deductionsTotal + input.payrollRecord.taxDeduction, input.payrollStructure.currency), col2, row, {
          align: "right",
        });

      // ──────────────────────────────────────────────────────────────────────────
      // Net Pay Section (Highlighted Box)
      // ──────────────────────────────────────────────────────────────────────────
      row += 25;
      doc
        .rect(40, row - 5, 515, 30)
        .fillColor("#f0f4f8")
        .fill();

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#003366")
        .text("NET PAY (Amount to Bank)", col1, row + 5)
        .text(formatCurrency(input.payrollRecord.netPay, input.payrollStructure.currency), col2, row + 5, {
          align: "right",
        });

      // ──────────────────────────────────────────────────────────────────────────
      // Bank Details
      // ──────────────────────────────────────────────────────────────────────────
      if (input.bankDetails) {
        row += 50;
        doc.fontSize(9).font("Helvetica-Bold").fillColor("#333").text("Bank Details", 40, row);
        row += 15;
        doc
          .font("Helvetica")
          .text(`Bank: ${input.bankDetails.bankName}`, 40, row)
          .text(`Account: ${input.bankDetails.accountNumber}`, 40, row + 15);
      }

      // ──────────────────────────────────────────────────────────────────────────
      // Footer
      // ──────────────────────────────────────────────────────────────────────────
      const footerY = 750;
      doc
        .moveTo(40, footerY)
        .lineTo(555, footerY)
        .stroke("#ddd");

      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#666")
        .text("This is a computer-generated payslip. No signature is required.", 40, footerY + 10);

      doc.text(
        `Generated on ${new Date().toLocaleString()} | Confidential - For Employee Use Only`,
        40,
        footerY + 25
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Format currency with proper locale formatting
 */
function formatCurrency(amount: number, currency: string = "ZMW"): string {
  const symbols: Record<string, string> = {
    ZMW: "ZMW ",
    USD: "US$",
    GBP: "£",
  };

  const symbol = symbols[currency] || currency + " ";
  return symbol + amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Convert Buffer to base64 for embedding in HTML or other uses
 */
export function bufferToBase64(buffer: Buffer): string {
  return buffer.toString("base64");
}

/**
 * Create a data URL for PDF preview in browser
 */
export function createPDFDataURL(pdfBuffer: Buffer): string {
  return `data:application/pdf;base64,${bufferToBase64(pdfBuffer)}`;
}
