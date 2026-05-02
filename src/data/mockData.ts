// src/data/mockData.ts
// Central mock data store. Replace with a real DB (e.g. Supabase, Prisma) later.

export type Role = "admin" | "teacher" | "student";

export interface User {
  id: string;
  name: string;
  role: Role;
  classId?: string; // students only
  subject?: string; // teachers only
  avatar: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  author: string;
  date: string;
  priority: "normal" | "high" | "urgent";
  pinned: boolean;
}

export interface HomeworkAssignment {
  id: string;
  subject: string;
  classId: string;
  title: string;
  description: string;
  dueDate: string;
  postedBy: string;
  postedAt: string;
  attachmentLabel?: string;
}

export interface SubjectGrade {
  subject: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade: string;
  remarks: string;
  teacherInitials: string;
}

export interface ReportCard {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  term: string;
  year: string;
  grades: SubjectGrade[];
  attendance: { present: number; total: number };
  classTeacherRemark: string;
  headRemark: string;
  nextTermBegins: string;
}

// ── Mock Users ──────────────────────────────────────────────────────────────
export const USERS: User[] = [
  { id: "u1", name: "Mr. Carlos", role: "admin", avatar: "MC" },
  { id: "u2", name: "Teacher Fein", role: "teacher", subject: "Mathematics", avatar: "TF" },
  { id: "u3", name: "Ms. Mwale", role: "teacher", subject: "English Language", avatar: "MM" },
  { id: "u4", name: "Thandeka Dube", role: "student", classId: "Grade 1", avatar: "TD" },
  { id: "u5", name: "Chanda Mutale", role: "student", classId: "Grade 1", avatar: "CM" },
  { id: "u6", name: "Lweendo Siame", role: "student", classId: "Grade 2", avatar: "LS" },
];

// Hardcoded session — in prod, replace with NextAuth or JWT
export const MOCK_SESSIONS: Record<string, User> = {
  admin: USERS[0],
  teacher_math: USERS[1],
  teacher_eng: USERS[2],
  student_10a: USERS[3],
  student_11b: USERS[5],
};

// ── Announcements ────────────────────────────────────────────────────────────
export let announcements: Announcement[] = [
  {
    id: "a1",
    title: "Term 2 Examinations Timetable Released",
    body: "The Term 2 examination timetable is now available on the school portal. Students are advised to collect their admit cards from the registrar's office no later than Friday, 25 April. Please ensure all outstanding fees are cleared before collection.",
    author: "Mr. Carlos",
    date: "2026-04-15",
    priority: "urgent",
    pinned: true,
  },
  {
    id: "a2",
    title: "Annual Sports Day — 30 April 2026",
    body: "Narty Rock Private School is pleased to announce the Annual Sports Day scheduled for Wednesday, 30 April 2026 at the school grounds. All parents and guardians are warmly invited. Students must report in their house colours by 07:30 hrs.",
    author: "Mr. Carlos",
    date: "2026-04-10",
    priority: "high",
    pinned: false,
  },
  {
    id: "a3",
    title: "Library Extended Hours — April",
    body: "The school library will be open from 06:30 to 18:00 Monday through Friday during the April revision period. Students are encouraged to take advantage of additional study resources available during this time.",
    author: "Mr. Carlos",
    date: "2026-04-08",
    priority: "normal",
    pinned: false,
  },
];

// ── Homework Assignments ─────────────────────────────────────────────────────
export let homework: HomeworkAssignment[] = [
  {
    id: "h1",
    subject: "Mathematics",
    classId: "Grade 1",
    title: "Quadratic Equations — Exercise 7B",
    description: "Complete all questions in Exercise 7B on pages 134–136 of the Algebra textbook. Show all working clearly. Questions involving the quadratic formula must display the discriminant step.",
    dueDate: "2026-04-23",
    postedBy: "Teacher Fein",
    postedAt: "2026-04-18",
  },
  {
    id: "h2",
    subject: "English Language",
    classId: "Grade 1",
    title: "Argumentative Essay — First Draft",
    description: 'Write a 600-word argumentative essay on the topic: "Social media does more harm than good to young people." Include an introduction, three body paragraphs with evidence, and a conclusion. Submit handwritten draft.',
    dueDate: "2026-04-25",
    postedBy: "Ms. Mwale",
    postedAt: "2026-04-17",
  },
  {
    id: "h3",
    subject: "Mathematics",
    classId: "Grade 2",
    title: "Differentiation — Chain Rule Problems",
    description: "From the Additional Mathematics workbook, attempt all problems in Chapter 12, Section C. You must show substitution steps for each chain rule application. Answers without working will not be marked.",
    dueDate: "2026-04-22",
    postedBy: "Teacher Fein",
    postedAt: "2026-04-16",
  },
  {
    id: "h4",
    subject: "English Language",
    classId: "Grade 2",
    title: "Poetry Analysis — 'The Road Not Taken'",
    description: "Analyse the poem 'The Road Not Taken' by Robert Frost. Your response should identify at least two literary devices, discuss the theme of choice, and include your personal interpretation. Minimum 400 words.",
    dueDate: "2026-04-24",
    postedBy: "Ms. Mwale",
    postedAt: "2026-04-17",
  },
];

// ── Report Cards ─────────────────────────────────────────────────────────────
export let reportCards: ReportCard[] = [
  {
    id: "r1",
    studentId: "u4",
    studentName: "Thandeka Dube",
    classId: "Grade 1",
    className: "Grade 1",
    term: "Term 1",
    year: "2026",
    grades: [
      { subject: "Mathematics", ca1: 18, ca2: 17, exam: 58, total: 93, grade: "A", remarks: "Excellent", teacherInitials: "T.F" },
      { subject: "English Language", ca1: 16, ca2: 15, exam: 52, total: 83, grade: "B+", remarks: "Very Good", teacherInitials: "M.M" },
      { subject: "Physics", ca1: 17, ca2: 18, exam: 55, total: 90, grade: "A", remarks: "Outstanding", teacherInitials: "K.N" },
      { subject: "Chemistry", ca1: 14, ca2: 16, exam: 48, total: 78, grade: "B", remarks: "Good", teacherInitials: "S.Z" },
      { subject: "Biology", ca1: 15, ca2: 14, exam: 50, total: 79, grade: "B", remarks: "Good", teacherInitials: "E.K" },
      { subject: "Geography", ca1: 13, ca2: 15, exam: 45, total: 73, grade: "B-", remarks: "Satisfactory", teacherInitials: "T.M" },
    ],
    attendance: { present: 58, total: 60 },
    classTeacherRemark: "Thandeka is a focused and diligent student who consistently demonstrates academic excellence. Keep up the outstanding effort.",
    headRemark: "A commendable performance. We are proud of your dedication.",
    nextTermBegins: "5 May 2026",
  },
];

// ── Helper: compute letter grade ─────────────────────────────────────────────
export function computeGrade(total: number): { grade: string; remarks: string } {
  if (total >= 90) return { grade: "A+", remarks: "Outstanding" };
  if (total >= 80) return { grade: "A", remarks: "Excellent" };
  if (total >= 75) return { grade: "B+", remarks: "Very Good" };
  if (total >= 70) return { grade: "B", remarks: "Good" };
  if (total >= 65) return { grade: "B-", remarks: "Good" };
  if (total >= 55) return { grade: "C", remarks: "Satisfactory" };
  if (total >= 45) return { grade: "D", remarks: "Pass" };
  return { grade: "F", remarks: "Fail" };
}

export const CLASSES = ["Pre-School", "Middle Class", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"];
export const SUBJECTS = [
  "Mathematics", "English Language", "Physics", "Chemistry",
  "Biology", "Geography", "History", "Civic Education",
  "Computer Studies", "Business Studies",
];
export const TERMS = ["Term 1", "Term 2", "Term 3"];

// ────────────────────────────────────────────────────────────────────────────
// ─ HRM MODULE TYPES & DATA ──────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────

// ── Employee/Teacher Management ──────────────────────────────────────────────
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string; // "Teacher", "Support Staff", etc.
  department: string; // "Science", "Languages", "Administration", etc.
  joiningDate: string; // YYYY-MM-DD
  status: "active" | "inactive" | "on-leave"; // active, inactive, on-leave
  bankAccount?: string;
  bankCode?: string;
  taxId?: string;
  dependents?: number;
  nextOfKin?: string;
  nextOfKinPhone?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Payroll Structure (Salary Configuration) ─────────────────────────────────
export interface PayrollStructure {
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
  taxBracket: string; // "Standard", "Exempt", "Special", etc.
  taxRate: number; // As decimal, e.g., 0.15 for 15%
  currency: string; // "ZMW", "USD", etc. Default "ZMW"
  effectiveFrom: string; // YYYY-MM-DD
  effectiveTo?: string; // YYYY-MM-DD (null if current)
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Payroll Record (Monthly Processing) ──────────────────────────────────────
export interface PayrollRecord {
  id: string;
  payrollCycleId: string; // Links to a specific payroll cycle
  employeeId: string;
  month: string; // YYYY-MM
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
  processedBy?: string;
}

// ── Payslip (Generated Document) ─────────────────────────────────────────────
export interface Payslip {
  id: string;
  payrollRecordId: string;
  employeeId: string;
  month: string; // YYYY-MM
  pdfUrl?: string; // Path to generated PDF
  htmlContent?: string; // For preview/printing
  generatedAt: string;
  sentViaEmail: boolean;
  sentAt?: string;
}

// ── Gmail Send Log (Audit Trail) ─────────────────────────────────────────────
export interface PayslipSendLog {
  id: string;
  payslipId: string;
  employeeId: string;
  recipientEmail: string;
  sentAt: string;
  status: "success" | "failed" | "pending" | "bounced";
  messageId?: string; // Gmail message ID
  errorMessage?: string;
  attemptCount: number;
  lastAttemptAt: string;
}

// ── Payroll Cycle (Batch Processing) ────────────────────────────────────────
export interface PayrollCycle {
  id: string;
  month: string; // YYYY-MM
  status: "draft" | "processing" | "completed" | "archived";
  processedBy: string;
  processedAt?: string;
  totalEmployees: number;
  totalGrossPay: number;
  totalNetPay: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ────────────────────────────────────────────────────────────────────────────
// ── Mock HRM Data ───────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────

export let employees: Employee[] = [
  {
    id: "emp1",
    name: "Teacher Fein",
    email: "fein@nartyrock.edu.zm",
    phone: "+260 971 123 456",
    role: "Teacher",
    department: "Mathematics",
    joiningDate: "2020-01-15",
    status: "active",
    bankAccount: "1234567890",
    bankCode: "ZANZ",
    taxId: "TAX-2020-TF",
    dependents: 2,
    nextOfKin: "Jennifer Fein",
    nextOfKinPhone: "+260 971 123 457",
    createdAt: "2020-01-15",
    updatedAt: "2026-04-20",
  },
  {
    id: "emp3",
    name: "Mr. Carlos",
    email: "carlos@nartyrock.edu.zm",
    phone: "+260 968 789 012",
    role: "Administrator",
    department: "Administration",
    joiningDate: "2019-06-01",
    status: "active",
    bankAccount: "5555666677",
    bankCode: "ZANZ",
    taxId: "TAX-2019-MC",
    dependents: 3,
    nextOfKin: "Maria Carlos",
    nextOfKinPhone: "+260 968 789 013",
    createdAt: "2019-06-01",
    updatedAt: "2026-04-20",
  },
  {
    id: "emp2",
    name: "Ms. Mwale",
    email: "mwale@nartyrock.edu.zm",
    phone: "+260 977 234 567",
    role: "Teacher",
    department: "Languages",
    joiningDate: "2021-02-10",
    status: "active",
    bankAccount: "0987654321",
    bankCode: "ZANZ",
    taxId: "TAX-2021-MM",
    dependents: 1,
    nextOfKin: "John Mwale",
    nextOfKinPhone: "+260 977 234 568",
    createdAt: "2021-02-10",
    updatedAt: "2026-04-20",
  },
];

export let payrollStructures: PayrollStructure[] = [
  {
    id: "ps1",
    employeeId: "emp1",
    basePay: 4500,
    allowances: {
      housing: 1000,
      transport: 500,
      meal: 300,
      responsibility: 200,
    },
    deductions: {
      pension: 450,
      healthInsurance: 150,
      unionFees: 50,
    },
    taxBracket: "Standard",
    taxRate: 0.15,
    currency: "ZMW",
    effectiveFrom: "2024-01-01",
    notes: "Approved by finance",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "ps2",
    employeeId: "emp2",
    basePay: 4200,
    allowances: {
      housing: 900,
      transport: 400,
      meal: 300,
      responsibility: 150,
    },
    deductions: {
      pension: 420,
      healthInsurance: 150,
      unionFees: 50,
    },
    taxBracket: "Standard",
    taxRate: 0.15,
    currency: "ZMW",
    effectiveFrom: "2024-01-01",
    notes: "Approved by finance",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "ps3",
    employeeId: "emp3",
    basePay: 6500,
    allowances: {
      housing: 1500,
      transport: 600,
      meal: 400,
      responsibility: 500,
    },
    deductions: {
      pension: 650,
      healthInsurance: 200,
      unionFees: 75,
    },
    taxBracket: "Standard",
    taxRate: 0.18,
    currency: "ZMW",
    effectiveFrom: "2024-01-01",
    notes: "Administrative staff",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
];

export let payrollRecords: PayrollRecord[] = [
  {
    id: "pr1",
    payrollCycleId: "cycle1",
    employeeId: "emp1",
    month: "2026-04",
    workingDays: 22,
    daysWorked: 22,
    basePay: 4500,
    allowancesTotal: 2000,
    grossPay: 6500,
    deductionsTotal: 650,
    taxDeduction: 975,
    netPay: 4875,
    status: "draft",
    createdAt: "2026-04-20",
    updatedAt: "2026-04-20",
  },
  {
    id: "pr2",
    payrollCycleId: "cycle1",
    employeeId: "emp2",
    month: "2026-04",
    workingDays: 22,
    daysWorked: 22,
    basePay: 4200,
    allowancesTotal: 1750,
    grossPay: 5950,
    deductionsTotal: 620,
    taxDeduction: 892.5,
    netPay: 4437.5,
    status: "draft",
    createdAt: "2026-04-20",
    updatedAt: "2026-04-20",
  },
];

export let payslips: Payslip[] = [];

export let payslipSendLogs: PayslipSendLog[] = [];

export let payrollCycles: PayrollCycle[] = [
  {
    id: "cycle1",
    month: "2026-04",
    status: "draft",
    processedBy: "u1",
    totalEmployees: 2,
    totalGrossPay: 12450,
    totalNetPay: 9312.5,
    createdAt: "2026-04-20",
    updatedAt: "2026-04-20",
  },
];
