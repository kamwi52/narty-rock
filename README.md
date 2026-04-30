# Narty Rock Private School — Portal

A production-ready school web portal built with **Next.js 14 (App Router)** and **React**.

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Accounts

On the login page, select one of three demo accounts:

| Role | Name | Access |
|------|------|--------|
| Administrator | Mrs. Banda | Announcements, Report Cards (full CRUD) |
| Teacher | Mr. Phiri | Post Homework, Generate Report Cards |
| Student | Thandeka Dube | View Homework (Form 4A), View Announcements |

---

## Features

### 1. Report Card Generator
- Enter student name, class, term, year
- Add subjects with CA1/CA2/Exam marks (auto-computes total and letter grade)
- Enter attendance and teacher/head remarks
- Preview formatted A4 report card
- **Print or Save as PDF** via browser print dialog (`Ctrl+P` / `Cmd+P`)

### 2. Announcements Board
- **Admin**: Create announcements with priority levels (Normal / High / Urgent)
- Pin/unpin announcements to top
- Delete announcements
- **Students**: Read-only view with priority filter tabs

### 3. Homework Publisher
- **Teacher**: Post assignments by class and subject with due date
- Filter by class
- Colour-coded due date urgency (green → amber → red → overdue)
- **Student**: See only their class's assignments, filtered by subject

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout with AuthProvider
│   ├── globals.css                 # Design tokens, base styles
│   ├── page.tsx                    # Root redirect
│   ├── not-found.tsx               # 404 page
│   ├── login/page.tsx              # Login / role selector
│   ├── dashboard/page.tsx          # Role-aware dashboard
│   ├── admin/
│   │   ├── announcements/page.tsx  # Admin: manage announcements
│   │   └── report-cards/page.tsx   # Admin/Teacher: generate report cards
│   ├── teacher/
│   │   ├── homework/page.tsx       # Teacher: post homework
│   │   └── report-cards/page.tsx   # Teacher: generate report cards
│   └── student/
│       ├── announcements/page.tsx  # Student: view announcements
│       └── homework/page.tsx       # Student: view homework
├── components/
│   ├── layout/
│   │   └── PortalShell.tsx         # Sidebar + top bar shell
│   ├── ui/
│   │   └── index.tsx               # Card, Badge, Button, Input, etc.
│   └── features/
│       └── report-cards/
│           └── ReportCardPrint.tsx # Printable report card component
├── data/
│   └── mockData.ts                 # All mock data + types
└── lib/
    └── auth.tsx                    # Mock auth context
```

---

## Design System

Colors (edit in `globals.css`):
- `--forest` `#1a3a2a` — Primary deep green
- `--gold` `#c9a84c` — Accent gold
- `--cream` `#faf8f3` — Page background

Fonts:
- **Playfair Display** — headings (loaded from Google Fonts)
- **DM Sans** — body text

---

## Replacing Mock Data with a Real Database

The mock data layer lives entirely in `src/data/mockData.ts`. To connect a real backend:

1. Replace array mutations (`setItems`) with API calls (e.g. `fetch('/api/announcements', { method: 'POST', ... })`)
2. Add `src/app/api/` route handlers for each resource
3. Connect to Supabase, PlanetScale, or any PostgreSQL/MongoDB instance
4. Replace `src/lib/auth.tsx` with [NextAuth.js](https://next-auth.js.org/) for real authentication

---

## Deployment

```bash
npm run build
npm start
```

Or deploy instantly to [Vercel](https://vercel.com) — zero config required for Next.js.
