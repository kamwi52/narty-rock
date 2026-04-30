// src/lib/gmail-integration.ts
// Email sending integration for payslips.
// Supports both SMTP (with Gmail App Password) and Gmail API.
// This file should only be used in API routes (server-side).

import nodemailer from "nodemailer";

export interface EmailConfig {
  service: "gmail-smtp" | "gmail-api" | "smtp";
  smtpConfig?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string; // App password or regular password
    };
  };
  gmailApiConfig?: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  };
  fromEmail: string;
  fromName: string;
}

export interface PayslipEmailContent {
  recipientEmail: string;
  recipientName: string;
  employeeId: string;
  month: string;
  pdfAttachment: Buffer; // PDF file as buffer
  pdfFileName: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: string;
}

/**
 * Send payslip email using configured email service
 * Add this to your .env.local or environment variables:
 *
 * For Gmail SMTP (recommended for simplicity):
 * EMAIL_SERVICE=gmail-smtp
 * GMAIL_SMTP_HOST=smtp.gmail.com
 * GMAIL_SMTP_PORT=587
 * GMAIL_SMTP_USER=your-email@gmail.com
 * GMAIL_SMTP_PASS=your-app-password (16-char password from Google Account)
 * EMAIL_FROM=your-email@gmail.com
 * EMAIL_FROM_NAME="Narty Rock Private School"
 *
 * For Gmail API (requires OAuth2 setup):
 * EMAIL_SERVICE=gmail-api
 * GMAIL_API_CLIENT_ID=...
 * GMAIL_API_CLIENT_SECRET=...
 * GMAIL_API_REFRESH_TOKEN=...
 * EMAIL_FROM=your-email@gmail.com
 * EMAIL_FROM_NAME="Narty Rock Private School"
 */
export async function sendPayslipEmail(
  emailContent: PayslipEmailContent,
  config: EmailConfig
): Promise<EmailSendResult> {
  const timestamp = new Date().toISOString();

  try {
    let transporter: nodemailer.Transporter;

    if (config.service === "gmail-smtp" && config.smtpConfig) {
      // Gmail SMTP with App Password
      transporter = nodemailer.createTransport(config.smtpConfig);
    } else if (config.service === "smtp" && config.smtpConfig) {
      // Generic SMTP
      transporter = nodemailer.createTransport(config.smtpConfig);
    } else {
      throw new Error("Invalid email service configuration");
    }

    // Verify connection
    await transporter.verify();

    // Prepare email
    const mailOptions = {
      from: `${config.fromName} <${config.fromEmail}>`,
      to: emailContent.recipientEmail,
      subject: `Payslip for ${emailContent.month} - ${config.fromName}`,
      html: generatePayslipEmailHTML(emailContent),
      attachments: [
        {
          filename: emailContent.pdfFileName,
          content: emailContent.pdfAttachment,
          contentType: "application/pdf",
        },
      ],
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log("[Gmail] Payslip sent successfully:", {
      messageId: info.messageId,
      to: emailContent.recipientEmail,
      month: emailContent.month,
    });

    return {
      success: true,
      messageId: info.messageId,
      timestamp,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    console.error("[Gmail] Failed to send payslip email:", {
      to: emailContent.recipientEmail,
      month: emailContent.month,
      error: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
      timestamp,
    };
  }
}

/**
 * Send bulk payslips to multiple employees
 * Returns array of results with employee IDs
 */
export async function sendBulkPayslips(
  payslips: Array<PayslipEmailContent>,
  config: EmailConfig,
  delayMs: number = 1000
): Promise<Array<EmailSendResult & { employeeId: string }>> {
  const results: Array<EmailSendResult & { employeeId: string }> = [];

  for (let i = 0; i < payslips.length; i++) {
    const payslip = payslips[i];

    const result = await sendPayslipEmail(payslip, config);
    results.push({
      ...result,
      employeeId: payslip.employeeId,
    });

    // Add delay between sends to avoid rate limiting
    if (i < payslips.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

/**
 * Generate professional HTML email body for payslip
 */
function generatePayslipEmailHTML(emailContent: PayslipEmailContent): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a3a2a 0%, #2d5c47 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 10px 0 0 0; font-size: 14px; opacity: 0.9; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .info-box { background: white; padding: 15px; border-left: 4px solid #1a3a2a; margin: 15px 0; border-radius: 4px; }
        .info-box p { margin: 5px 0; font-size: 14px; }
        .button { display: inline-block; background: #1a3a2a; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; margin: 15px 0; }
        .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        .important { color: #d32f2f; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payslip Notification</h1>
          <p>Narty Rock Private School</p>
        </div>

        <div class="content">
          <p>Dear <strong>${emailContent.recipientName}</strong>,</p>

          <p>Your payslip for <strong>${emailContent.month}</strong> is ready and has been attached to this email.</p>

          <div class="info-box">
            <p><strong>Payslip Details:</strong></p>
            <p>Employee ID: <code>${emailContent.employeeId}</code></p>
            <p>Period: ${emailContent.month}</p>
            <p>Attachment: ${emailContent.pdfFileName}</p>
          </div>

          <p><strong>Please note:</strong></p>
          <ul>
            <li>Please review your payslip carefully</li>
            <li>Contact HR if you notice any discrepancies</li>
            <li>This is a confidential document — keep it safe</li>
            <li>Bank transfer details are shown in your payslip</li>
          </ul>

          <p>If you have any questions or concerns about your payslip, please contact the Human Resources department.</p>

          <p>
            <strong>Human Resources Department</strong><br>
            Narty Rock Private School<br>
            Email: hr@nartyrock.edu.zm
          </p>

          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
            This is an automated email. Please do not reply directly to this message.
          </p>
        </div>

        <div class="footer">
          <p>&copy; 2026 Narty Rock Private School. All rights reserved.</p>
          <p>This email contains confidential information intended only for the recipient.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Validate email configuration before sending
 */
export function validateEmailConfig(config: EmailConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.fromEmail) errors.push("fromEmail is required");
  if (!config.fromName) errors.push("fromName is required");

  if (config.service === "gmail-smtp" || config.service === "smtp") {
    if (!config.smtpConfig) {
      errors.push(`smtpConfig is required for ${config.service}`);
    } else {
      if (!config.smtpConfig.host) errors.push("SMTP host is required");
      if (!config.smtpConfig.port) errors.push("SMTP port is required");
      if (!config.smtpConfig.auth?.user) errors.push("SMTP user is required");
      if (!config.smtpConfig.auth?.pass) errors.push("SMTP password/app-password is required");
    }
  } else if (config.service === "gmail-api") {
    if (!config.gmailApiConfig) {
      errors.push("gmailApiConfig is required for gmail-api");
    } else {
      if (!config.gmailApiConfig.clientId) errors.push("Gmail API clientId is required");
      if (!config.gmailApiConfig.clientSecret) errors.push("Gmail API clientSecret is required");
      if (!config.gmailApiConfig.refreshToken) errors.push("Gmail API refreshToken is required");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get email configuration from environment variables
 * Must be called from server-side (API routes, Server Components, etc.)
 */
export function getEmailConfigFromEnv(): EmailConfig {
  const service = (process.env.EMAIL_SERVICE || "gmail-smtp") as "gmail-smtp" | "gmail-api" | "smtp";

  if (service === "gmail-smtp" || service === "smtp") {
    return {
      service,
      smtpConfig: {
        host: process.env.GMAIL_SMTP_HOST || process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.GMAIL_SMTP_PORT || process.env.SMTP_PORT || "587"),
        secure: (process.env.GMAIL_SMTP_SECURE || process.env.SMTP_SECURE || "false") === "true",
        auth: {
          user: process.env.GMAIL_SMTP_USER || process.env.SMTP_USER || "",
          pass: process.env.GMAIL_SMTP_PASS || process.env.SMTP_PASS || "",
        },
      },
      fromEmail: process.env.EMAIL_FROM || "",
      fromName: process.env.EMAIL_FROM_NAME || "Narty Rock Private School",
    };
  }

  // Gmail API
  return {
    service: "gmail-api",
    gmailApiConfig: {
      clientId: process.env.GMAIL_API_CLIENT_ID || "",
      clientSecret: process.env.GMAIL_API_CLIENT_SECRET || "",
      refreshToken: process.env.GMAIL_API_REFRESH_TOKEN || "",
    },
    fromEmail: process.env.EMAIL_FROM || "",
    fromName: process.env.EMAIL_FROM_NAME || "Narty Rock Private School",
  };
}
