import {
  getEmailConfigFromEnv,
  sendPayslipEmail as sendConfiguredPayslipEmail,
  validateEmailConfig,
} from "./gmail-integration";

/**
 * Compatibility wrapper for payslip delivery.
 * Uses the installed nodemailer-backed Gmail/SMTP integration.
 */

interface SendPayslipParams {
  to: string;
  employeeName: string;
  month: string;
  pdfBuffer: Buffer;
  fileName: string;
  employeeId?: string;
}

export async function sendPayslipEmail({
  to,
  employeeName,
  month,
  pdfBuffer,
  fileName,
  employeeId,
}: SendPayslipParams) {
  const config = getEmailConfigFromEnv();
  const validation = validateEmailConfig(config);

  if (!validation.valid) {
    throw new Error(`Email configuration is incomplete: ${validation.errors.join(", ")}`);
  }

  const result = await sendConfiguredPayslipEmail(
    {
      recipientEmail: to,
      recipientName: employeeName,
      employeeId: employeeId || employeeName,
      month,
      pdfAttachment: pdfBuffer,
      pdfFileName: fileName,
    },
    config
  );

  if (!result.success) {
    throw new Error(result.error || "Payslip email failed to send");
  }

  return { success: true, messageId: result.messageId };
}
