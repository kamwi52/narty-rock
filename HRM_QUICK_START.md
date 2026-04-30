# HRM Module - Quick Start Guide

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `pdfkit` — PDF generation
- `nodemailer` — Email sending
- `googleapis` — Gmail API (optional)

### 2. Configure Email (Choose One Method)

#### Method A: Gmail SMTP (Easiest)

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Make sure 2-Factor Authentication is enabled first
   - Select "Mail" app and "Windows Computer" device
   - Google generates 16-character password

2. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

3. Edit `.env.local`:
   ```env
   EMAIL_SERVICE=gmail-smtp
   EMAIL_FROM=admin@school.com
   EMAIL_FROM_NAME=Narty Rock Private School
   
   GMAIL_SMTP_HOST=smtp.gmail.com
   GMAIL_SMTP_PORT=587
   GMAIL_SMTP_USER=admin@school.com
   GMAIL_SMTP_PASS=xxxx-xxxx-xxxx-xxxx
   ```

4. Test by running the development server:
   ```bash
   npm run dev
   ```

#### Method B: Generic SMTP Server

```env
EMAIL_SERVICE=smtp
EMAIL_FROM=admin@school.com
EMAIL_FROM_NAME=Narty Rock Private School

SMTP_HOST=mail.domain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=smtp-username
SMTP_PASS=smtp-password
```

### 3. Create Public Directory for PDFs

```bash
mkdir -p public/payslips
chmod 755 public/payslips
```

### 4. Start Development Server

```bash
npm run dev
```

Open browser: http://localhost:3000

### 5. Log In

Login with admin account:
- **Session Key:** `admin`
- **Username:** `Mrs. Banda`
- **Role:** Administrator

## Using the HRM Module

### Access the Module

Once logged in as admin, you'll see three new menu items:

1. **Employees** → `/admin/hrm/employees`
2. **Payroll Configuration** → `/admin/hrm/payroll-config`
3. **Payslips** → `/admin/hrm/payslips`

### Typical Workflow

#### Step 1: Add/Manage Employees
1. Go to **Employees**
2. Click **Add Employee**
3. Fill in employee details
4. Click **Save**

#### Step 2: Configure Salaries
1. Go to **Payroll Configuration**
2. Click **Add Structure**
3. Select employee
4. Enter salary components (base, allowances, deductions)
5. Click **Save Structure**

#### Step 3: Create Monthly Payroll
1. Go to **Payslips**
2. Select month
3. System shows draft payroll records (you'll need to create these first via the API or manually)
4. Select employees to process
5. Click **Generate Payslips**
6. Click **Send All Payslips**

#### Step 4: Monitor Sends
- View success/failure counts
- Check send logs for any issues
- Retry failed sends if needed

## Example Data

The system comes with sample data:

**Employees:**
- Mr. Phiri (Mathematics teacher)
- Ms. Mwale (English Language teacher)

**Payroll Structures:**
- Pre-configured salary structures for both
- Allowances (housing, transport, meal, responsibility)
- Deductions (pension, health insurance, union fees)
- 15% tax rate

**Payroll Records:**
- April 2026 draft records for both employees

## Testing the System

### Test Payslip Generation

1. Go to `/admin/hrm/payslips`
2. Select April 2026
3. Select both employees
4. Click "Generate Payslips"
5. Check `public/payslips/` folder for PDF files

### Test Email Sending

1. **If using Gmail SMTP:**
   - Make sure your app password is correct
   - Check employee email addresses are valid
   - Test by sending to yourself first

2. **Mock Send (for testing):**
   - Payslips will be generated
   - Email sending only works if properly configured
   - Check browser console for errors

### Manual Testing

Test API endpoints directly:

```bash
# Get all employees
curl http://localhost:3000/api/hrm/employees

# Get payroll records for April 2026
curl "http://localhost:3000/api/hrm/payroll-records?month=2026-04"

# View send logs
curl http://localhost:3000/api/hrm/send-logs
```

## Troubleshooting

### Can't Send Emails

**Problem:** "Email configuration is incomplete"

**Solutions:**
1. Check `.env.local` exists and has all required fields
2. Verify no typos in email or password
3. Restart dev server after changes to `.env.local`
4. Test SMTP credentials with online tools

### PDFs Not Generated

**Problem:** "PDF generation failed"

**Solutions:**
1. Verify `public/payslips/` directory exists
2. Check file permissions on `public/` folder
3. Ensure payroll structure exists for employee
4. Check browser console for specific errors

### Employees Not Showing

**Problem:** Can't see employees in dropdown

**Solutions:**
1. Add employees in Employee Management first
2. Refresh page after adding
3. Ensure employee status is "active"

### Gmail App Password Not Working

**Problem:** "Failed to authenticate"

**Solutions:**
1. Verify 2FA is enabled on Google Account
2. Generate new app password at https://myaccount.google.com/apppasswords
3. Use exactly what Google provides (with hyphens if included)
4. Check email address matches the app password account

## File Structure

```
src/
├── app/api/hrm/                          # API endpoints
│   ├── employees/route.ts
│   ├── payroll-structures/route.ts
│   ├── payroll-records/route.ts
│   ├── payslips/generate/route.ts
│   ├── payslips/send/route.ts
│   └── send-logs/route.ts
├── app/admin/hrm/                        # Admin pages
│   ├── employees/page.tsx
│   ├── payroll-config/page.tsx
│   └── payslips/page.tsx
├── lib/
│   ├── pdf-generator.ts                  # PDF generation
│   └── gmail-integration.ts              # Email sending
└── data/
    └── mockData.ts                       # Schemas & sample data

.env.local.example                        # Configuration template
HRM_MODULE_README.md                      # Full documentation
HRM_QUICK_START.md                        # This file
```

## Key Files Explained

| File | Purpose |
|------|---------|
| `src/lib/pdf-generator.ts` | Generates professional payslip PDFs using PDFKit |
| `src/lib/gmail-integration.ts` | Handles email sending via Nodemailer with error handling |
| `src/app/api/hrm/**/route.ts` | REST API endpoints for all HRM operations |
| `src/data/mockData.ts` | Database schemas and sample data (mock mode) |
| `.env.local` | Environment variables for email configuration |

## Next Steps

### For Production Deployment:

1. **Database Migration**
   - Set up PostgreSQL/MySQL/MongoDB
   - Create migration scripts for HRM tables
   - Update API routes to use real database

2. **Security Hardening**
   - Implement role-based access control (RBAC)
   - Add audit logging for all financial transactions
   - Encrypt sensitive data (tax IDs, bank accounts in database)

3. **Advanced Features**
   - Payroll reports and dashboards
   - Salary advance/loan tracking
   - Tax compliance reporting
   - Integration with accounting software

4. **Team Training**
   - Train admin team on monthly payroll workflow
   - Document internal processes
   - Set up backup procedures

## Support Resources

- **Full Documentation:** See `HRM_MODULE_README.md`
- **API Reference:** See section "API Reference" in HRM_MODULE_README.md
- **Troubleshooting:** See section "Troubleshooting" in HRM_MODULE_README.md
- **Code Comments:** Check inline comments in source files

## Need Help?

1. Check the troubleshooting section above
2. Review HRM_MODULE_README.md for detailed documentation
3. Check browser console (F12) for frontend errors
4. Check terminal for server errors (npm run dev output)
5. Verify `.env.local` settings match requirements

---

**Ready to use! Start with the "Typical Workflow" section above.**
