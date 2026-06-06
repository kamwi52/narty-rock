# HRM (Human Resource Management) Module Documentation

## Overview

The HRM module is a comprehensive **Human Resource Management and Payroll System** integrated into the Narty Rock Private School Portal. It provides:

- **Employee/Teacher Management** — Add, edit, view, and manage teacher profiles with employment details
- **Payroll Configuration** — Set up salary structures with allowances, deductions, and tax configuration
- **Payroll Processing** — Run monthly payroll calculations creating detailed records
- **Payslip Generation** — Automatically generate professional PDF payslips for each employee
- **Email Distribution** — Send payslips directly to employees via Gmail/SMTP with delivery tracking
- **Audit Logs** — Track all email sends with detailed success/failure reporting

## Architecture

### Module Structure

```
src/
├── app/
│   ├── api/hrm/
│   │   ├── employees/route.ts          # Employee CRUD API
│   │   ├── payroll-structures/route.ts # Salary configuration API
│   │   ├── payroll-records/route.ts    # Monthly payroll records API
│   │   ├── payslips/
│   │   │   ├── generate/route.ts       # PDF generation endpoint
│   │   │   └── send/route.ts           # Email sending endpoint
│   │   └── send-logs/route.ts          # Audit trail API
│   └── admin/hrm/
│       ├── employees/page.tsx          # Employee management UI
│       ├── payroll-config/page.tsx     # Payroll configuration UI
│       └── payslips/page.tsx           # Payslip generation & sending UI
├── lib/
│   ├── pdf-generator.ts                # PDFKit-based payslip PDF generation
│   └── email-service.ts                # SendGrid-based transactional email
└── data/
    └── mockData.ts                     # Database schemas & mock data
```

### Data Models

#### Employee
```typescript
interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;                    // "Teacher", "Support Staff", etc.
  department: string;              // "Science", "Languages", etc.
  joiningDate: string;             // YYYY-MM-DD
  status: "active" | "inactive" | "on-leave";
  bankAccount?: string;
  bankCode?: string;
  taxId?: string;
  dependents?: number;
  nextOfKin?: string;
  nextOfKinPhone?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### PayrollStructure
```typescript
interface PayrollStructure {
  id: string;
  employeeId: string;
  basePay: number;
  allowances: {
    housing?: number;
    transport?: number;
    meal?: number;
    responsibility?: number;
    other?: number;
  };
  deductions: {
    pension?: number;
    healthInsurance?: number;
    unionFees?: number;
    loan?: number;
    other?: number;
  };
  taxBracket: string;
  taxRate: number;                 // 0.15 = 15%
  currency: string;                // "ZMW", "USD", etc.
  effectiveFrom: string;           // YYYY-MM-DD
  effectiveTo?: string;            // null = current
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### PayrollRecord
```typescript
interface PayrollRecord {
  id: string;
  payrollCycleId: string;         // Links to batch processing
  employeeId: string;
  month: string;                  // YYYY-MM
  workingDays: number;
  daysWorked: number;
  basePay: number;
  allowancesTotal: number;
  grossPay: number;
  deductionsTotal: number;
  taxDeduction: number;
  netPay: number;
  status: "draft" | "approved" | "processed" | "paid";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### Payslip (Generated PDF Document)
```typescript
interface Payslip {
  id: string;
  payrollRecordId: string;
  employeeId: string;
  month: string;
  pdfUrl?: string;                 // Path to generated PDF file
  htmlContent?: string;            // For preview
  generatedAt: string;
  sentViaEmail: boolean;
  sentAt?: string;
}
```

#### PayslipSendLog (Audit Trail)
```typescript
interface PayslipSendLog {
  id: string;
  payslipId: string;
  employeeId: string;
  recipientEmail: string;
  sentAt: string;
  status: "success" | "failed" | "pending" | "bounced";
  messageId?: string;              // Gmail message ID
  errorMessage?: string;
  attemptCount: number;
  lastAttemptAt: string;
}
```

## Setup & Configuration

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

Dependencies added:
- `pdfkit@0.13.0` — Server-side PDF generation
- `nodemailer@6.9.7` — Email sending via SMTP
- `googleapis@118.0.0` — Gmail API support (optional)

### 2. Set Up Email Configuration

**Option A: Gmail SMTP (Recommended for Simplicity)**

1. Go to [Google Account Security Settings](https://myaccount.google.com/apppasswords)
2. Create an "App Password" for your Gmail account
3. Create `.env.local` in project root:

```env
# Email Configuration
EMAIL_SERVICE=gmail-smtp
EMAIL_FROM=admin@nartyrock.edu.zm
EMAIL_FROM_NAME=Narty Rock Private School

# Gmail SMTP Settings
GMAIL_SMTP_HOST=smtp.gmail.com
GMAIL_SMTP_PORT=587
GMAIL_SMTP_SECURE=false
GMAIL_SMTP_USER=admin@nartyrock.edu.zm
GMAIL_SMTP_PASS=your-16-char-app-password
```

**Option B: Generic SMTP Server**

```env
EMAIL_SERVICE=smtp
EMAIL_FROM=admin@school.com
EMAIL_FROM_NAME=School Name

SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=smtp-user
SMTP_PASS=smtp-password
```

**Option C: Gmail API (Advanced)**

Requires OAuth2 setup. See [Google API Documentation](https://developers.google.com/gmail/api).

### 3. Create PDF Output Directory

The system automatically creates `public/payslips/` directory for PDF storage. Ensure `public/` directory exists and is writable.

### 4. Access Control

The HRM module is **admin-only** and protected by the existing authentication system in `src/lib/auth.tsx`.

### 5. Database Migration

The current implementation uses mock data in `src/data/mockData.ts`. To migrate to a real database:

1. Set up your database (PostgreSQL, MongoDB, etc.)
2. Create migration scripts for the HRM schemas
3. Replace API route implementations with database queries
4. Update `mockData.ts` imports

## Usage Guide

### For Admins

#### 1. Employee Management (`/admin/hrm/employees`)

**Adding an Employee:**
1. Click "Add Employee"
2. Fill in employee details:
   - Full name, email, phone
   - Role (Teacher, Support Staff, etc.)
   - Department (Science, Languages, etc.)
   - Joining date
   - Tax ID, bank account (optional)
3. Click "Save"

**Editing an Employee:**
1. Click the edit icon (pencil) on the employee card
2. Modify details as needed
3. Click "Update"

**Deactivating an Employee:**
1. Click the trash icon on the active employee card
2. Confirm deactivation
3. Employee status changes to "Inactive"

#### 2. Payroll Configuration (`/admin/hrm/payroll-config`)

**Setting Up Salary Structure:**
1. Click "Add Structure"
2. Select employee
3. Enter salary components:
   - **Base Pay:** Monthly base salary
   - **Allowances:** Housing, transport, meals, responsibility, etc.
   - **Deductions:** Pension, health insurance, union fees, etc.
   - **Tax Configuration:** Tax bracket and rate (e.g., 15%)
4. System calculates **Gross Pay**, **Net Pay** automatically
5. Click "Save Structure"

**Creating New Structure for Employee:**
- Previous structure is automatically ended with current date
- New structure becomes active immediately

#### 3. Payroll Processing

**Steps to Generate & Send Payslips:**

1. **Select Month** (`/admin/hrm/payslips`)
   - Choose the month for payroll
   - View all draft payroll records for that month
   - Select which employees to process (checkboxes)

2. **Generate Payslips**
   - Click "Generate Payslips"
   - System generates professional PDF payslips
   - PDFs saved to `public/payslips/`

3. **Send via Email**
   - Click "Send All Payslips"
   - System sends emails to all employees
   - Each email includes PDF attachment
   - Send logs tracked in real-time

4. **View Results**
   - Success/failure counts displayed
   - Failed sends show error reasons
   - All sends logged in audit trail

## API Reference

### Employees API

```
GET    /api/hrm/employees                 # List all employees
GET    /api/hrm/employees?id=emp1         # Get single employee
POST   /api/hrm/employees                 # Create employee
PUT    /api/hrm/employees                 # Update employee
DELETE /api/hrm/employees                 # Deactivate employee
```

### Payroll Structures API

```
GET    /api/hrm/payroll-structures                      # List all structures
GET    /api/hrm/payroll-structures?employeeId=emp1     # Get employee's current structure
POST   /api/hrm/payroll-structures                      # Create new structure
PUT    /api/hrm/payroll-structures                      # Update structure
```

### Payroll Records API

```
GET    /api/hrm/payroll-records                         # List all records
GET    /api/hrm/payroll-records?month=2026-04          # Filter by month
GET    /api/hrm/payroll-records?employeeId=emp1        # Filter by employee
GET    /api/hrm/payroll-records?status=draft           # Filter by status
POST   /api/hrm/payroll-records                         # Create record
PUT    /api/hrm/payroll-records                         # Update record
PATCH  /api/hrm/payroll-records                         # Bulk update (e.g., approve all)
```

### Payslips API

```
POST   /api/hrm/payslips/generate                       # Generate PDFs from payroll records
GET    /api/hrm/payslips/generate?month=2026-04        # View generated payslips
POST   /api/hrm/payslips/send                           # Send payslips via email
GET    /api/hrm/payslips/send                           # View send logs
```

### Send Logs API

```
GET    /api/hrm/send-logs                               # View recent send logs
GET    /api/hrm/send-logs?status=success               # Filter by status
GET    /api/hrm/send-logs?employeeId=emp1             # Filter by employee
HEAD   /api/hrm/send-logs                               # Get summary statistics
```

## PDF Generation

### Features

The payslip PDF includes:

- **Header:** School name, payslip ID, month, date
- **Employee Info:** Name, ID, role, department, email, phone
- **Earnings Section:**
  - Base salary
  - Allowances (separated by type)
  - Gross pay (highlighted)
- **Deductions Section:**
  - Income tax
  - Pension & social security
  - Total deductions
- **Net Pay:** Prominently displayed in highlight box
- **Bank Details:** Bank name and account number
- **Footer:** Legal notice, generation timestamp

### Customization

Edit `src/lib/pdf-generator.ts` to customize:

```typescript
// Colors, fonts, layout in generatePayslipPDF()
doc.fontSize(14).font("Helvetica-Bold").text("Payslip Title");
doc.fillColor("#1a3a2a"); // Change colors

// Add company logo
doc.image("path/to/logo.png", x, y, { width: 100 });

// Change currency formatting
function formatCurrency(amount, currency) {
  // Customize currency symbols and formatting
}
```

## Email Integration

### Security Best Practices

1. **Use App Passwords:** Never use your main Gmail password
2. **Environment Variables:** Store credentials in `.env.local`, never in code
3. **HTTPS Only:** Always use secure connections
4. **Rate Limiting:** Mail sending is delayed between emails to avoid rate limiting
5. **Error Logging:** All failures logged for audit trail

### Gmail App Password Setup

1. Enable 2-Factor Authentication on Google Account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Select "Mail" and "Windows Computer" (or your platform)
4. Google generates a 16-character password
5. Use this password in `GMAIL_SMTP_PASS` environment variable

### Email Delivery Monitoring

The system logs every send attempt:

```typescript
// Check send logs API
GET /api/hrm/send-logs

// Response includes:
{
  "data": [
    {
      "id": "log...",
      "payslipId": "ps...",
      "employeeId": "emp1",
      "recipientEmail": "employee@school.com",
      "status": "success" | "failed",
      "messageId": "Gmail message ID",
      "errorMessage": null or error description,
      "sentAt": "2026-04-20T14:30:00Z"
    }
  ]
}
```

### Handling Failed Sends

Failed emails show:
1. Employee name
2. Error reason (invalid email, SMTP error, etc.)
3. Timestamp and retry count
4. `messageId` if partially sent

**Retry Strategy:**
- Manually fix the issue (update email address)
- Regenerate payslips
- Resend

## Production Deployment

### Before Going Live

1. **Database Migration:**
   - Move from mock data to real database
   - Create database models/migrations
   - Update API routes to use database queries

2. **Security Hardening:**
   - Implement role-based access control (RBAC)
   - Add audit logging for all financial transactions
   - Encrypt sensitive data (tax IDs, bank accounts)
   - Implement request rate limiting

3. **Email Configuration:**
   - Set up dedicated email account for payroll notifications
   - Configure SPF, DKIM, DMARC records
   - Test with multiple email providers

4. **File Storage:**
   - Consider cloud storage (AWS S3, Google Cloud Storage)
   - Implement backup strategy for PDFs
   - Set up retention policies

5. **Compliance:**
   - Ensure GDPR/data privacy compliance
   - Implement data retention policies
   - Create audit logs for payroll access

### Environment Variables Checklist

For production, ensure these are set:

```env
# Core
NODE_ENV=production

# Email (choose one method)
EMAIL_SERVICE=gmail-smtp # or smtp or gmail-api
EMAIL_FROM=admin@school.com
EMAIL_FROM_NAME=School Name

# Gmail SMTP (if using gmail-smtp)
GMAIL_SMTP_HOST=smtp.gmail.com
GMAIL_SMTP_PORT=587
GMAIL_SMTP_SECURE=false
GMAIL_SMTP_USER=admin@school.com
GMAIL_SMTP_PASS=16-character-app-password

# Or Generic SMTP
SMTP_HOST=mail.domain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=user
SMTP_PASS=password

# Database (when migrating from mock data)
DATABASE_URL=postgresql://user:pass@host:5432/db
```

## Troubleshooting

### "Failed to send payslip email"

**Causes:**
- Gmail app password incorrect
- SMTP credentials invalid
- Invalid recipient email address
- SMTP server unreachable

**Solutions:**
1. Verify app password in `.env.local`
2. Test SMTP connection: `telnet smtp.gmail.com 587`
3. Check employee email addresses in Employee Management
4. Review send logs for specific error messages

### "PDF generation failed"

**Causes:**
- Missing `public/payslips/` directory
- Insufficient disk space
- Invalid employee/payroll record data

**Solutions:**
1. Create `public/payslips/` directory
2. Check server disk space
3. Verify payroll structure exists for employee
4. Check browser console for specific errors

### "Email attachments not showing in mail client"

**Solutions:**
1. Verify PDF file is being generated
2. Check file permissions on `public/payslips/`
3. Test with simple text email first (no attachment)
4. Verify recipient email supports attachments

### "Payroll calculations incorrect"

**Solutions:**
1. Verify tax rate is decimal (0.15 not 15)
2. Check allowances and deductions are positive
3. Confirm working days and days worked are set correctly
4. Review the payroll structure for the month

## Extending the Module

### Adding Custom Allowances

1. Update `PayrollStructure` interface in `mockData.ts`
2. Add field to allowances form in `payroll-config/page.tsx`
3. Update API to include in calculations
4. Modify PDF template to display

### Adding Advance/Loan Deductions

1. Add `loanDeductions` field to employee or payroll record
2. Update calculations in payroll record API
3. Display in PDF payslip section
4. Track in payroll history for reporting

### Email Templates

Customize email body in `src/lib/gmail-integration.ts`:

```typescript
function generatePayslipEmailHTML(emailContent) {
  // Modify HTML template
  // Add company branding
  // Customize message content
}
```

### Reporting

Create new API endpoint for payroll reports:

```typescript
// GET /api/hrm/reports/payroll-summary?month=2026-04
// Returns: total gross, total net, employee count, etc.
```

## Common Use Cases

### Monthly Payroll Processing

```
1. Create payroll records for all employees
   POST /api/hrm/payroll-records (batch)

2. Review and approve records
   PATCH /api/hrm/payroll-records { ids: [...], status: "approved" }

3. Generate payslips
   POST /api/hrm/payslips/generate { payrollRecordIds: [...] }

4. Send to employees
   POST /api/hrm/payslips/send { payslipIds: [...] }

5. Archive and close cycle
   PATCH /api/hrm/payroll-cycles { month: "2026-04", status: "completed" }
```

### Salary Revision

```
1. Update employee's payroll structure
   POST /api/hrm/payroll-structures { employeeId, newBasePay, ... }
   (Previous structure auto-ended)

2. Next payroll uses new structure automatically
```

### Employee Offboarding

```
1. Update employee status
   PUT /api/hrm/employees { id, status: "inactive" }

2. Final payslip for remaining days
   POST /api/hrm/payroll-records { employeeId, month, daysWorked: X }

3. Generate and send final payslip
```

## Support & Maintenance

For issues or questions:

1. Check troubleshooting section above
2. Review send logs for email issues
3. Check browser console for frontend errors
4. Review server logs for API errors
5. Verify environment variables are set correctly

## License & Attribution

This HRM module is part of the Narty Rock Private School Portal and follows the same license as the parent project.

---

**Version:** 1.0.0  
**Last Updated:** April 20, 2026  
**Maintained by:** Development Team
