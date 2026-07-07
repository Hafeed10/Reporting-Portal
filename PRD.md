# Product Requirements Document (PRD)
## Project: Ahlussuffa Reporting Portal

---

## 1. Overview & Objectives

The **Ahlussuffa Reporting Portal** is a web-based educational management and reporting tool designed for Ahlussuffa educational institutions. The application simplifies student attendance tracking, streamlines monthly institution progress reporting, and provides centralized administration metrics.

The primary objectives are:
- To replace manual register booklets with a streamlined, real-time daily register.
- To empower coordinators to track attendance by subject, period, date, and faculty.
- To automate weekly and monthly summary reports, analytics, and defaulter detection.
- To enable administration to view consolidated monthly reviews and print official documentation.

---

## 2. User Roles & Access Control

The portal implements role-based views and actions:

### A. Dars Coordinator (Teacher / Class Representative)
- **Daily Register**: Mark attendance for their assigned class and class level.
- **Roster Management**: Manage the list of active students in their assigned class.
- **Report Submission**: Create and save monthly reports including working days, local achievements, programs conducted, observations, and recommendations.
- **Access Limits**: Automatically locked to their assigned Dars (class) to prevent accidental cross-entry.

### B. Administrator / Academic Director
- **Consolidated Preview**: View all reports across all institutions/classes.
- **Full Roster Control**: Add, edit, or remove students from any class roster.
- **Print & Export**: Generate clean, print-ready PDFs and export data sheets (CSV).
- **System Settings**: Access advanced developer tools like Supabase database credentials.

---

## 3. Core Functional Modules

### 1. Daily Attendance Register
- **Configurations**: Inputs for Date, Class/Section, Class Level (HS1, HS2, BS1–BS5, 8th/9th Class), Subject, Period, Time, and Faculty Name.
- **Preset Options**:
  - *Subjects*: Thafseer, Tajweed, Fiqh, Aqeedah, Hadith, Arabic Language, and Custom.
  - *Periods*: Period 1 to Period 8.
  - *Faculty Names*: Prepopulated list of teachers (Hafiz Usthad, Arshad Nurani Usthad, Ali Nurani Usthad, etc.) with a "Custom" field for visiting instructors.
- **Interactive Roster Grid**:
  - Filter list by name instantly.
  - Status triggers: **P** (Present), **A** (Absent), **L** (Leave).
  - Batch selectors: **All Present** and **All Absent**.
  - Dynamic editing: Auto-detects if an entry already exists for the selection parameters and loads existing marks for editing.

### 2. History Log
- A chronological table listing all attendance records.
- **Search & Filter**: Search by subject, faculty, or period; filter by date, class level, or Dars.
- **Statistical Overview**: Live count of completed registers, average attendance rating, classes completed today, and list of absent students today.
- **Action Triggers**: Inline Edit and Delete logs.

### 3. Analytics & Summaries
- **Weekly Summary**: Computes attendance metrics per subject, list of absent students with period details, and faculty performance logs.
- **Monthly Reports**: Tracks monthly average attendance, top subject trends, student rankings, and lists "Defaulter Students" (attendance below 75%).
- **Exporting**: Instant CSV downloads for all tables.

### 4. Consolidated Reporting & Review
- Structured forms to input qualitative institution data:
  - Working days, regular vs. low attendance headcounts.
  - Leaves received, approved, and unapproved, categorized by reason (Medical, Family Function, Personal, etc.).
  - PRD programs completed, names of events, and learning outcomes.
  - Narrative suggestions, observations, and student achievement logs.
- **Signature Blocks**: Responsive, printable sections for coordinator and administrator verification.

---

## 4. Technical Stack

- **Frontend Core**: React 19, Vite, Tailwind CSS.
- **Icons**: Lucide React.
- **Database & Authentication**: Supabase (PostgreSQL with Row Level Security).
- **Hosting**: Designed for fast deployment and SPA (Single Page Application) routing.

---

## 5. Database Schema

### Table: `students`
Tracks active student rosters.
```sql
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  dars TEXT NOT NULL,
  class TEXT NOT NULL DEFAULT 'HS1',
  CONSTRAINT unique_student_name_dars_class UNIQUE (name, dars, class)
);
```

### Table: `daily_subject_attendance`
Logs class/period levels of attendance.
```sql
CREATE TABLE daily_subject_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  date DATE NOT NULL,
  faculty TEXT NOT NULL,
  class TEXT NOT NULL,
  subject TEXT NOT NULL,
  period TEXT NOT NULL,
  records JSONB NOT NULL DEFAULT '[]'::JSONB,
  CONSTRAINT unique_date_class_subject_period UNIQUE (date, class, subject, period)
);
```

### Table: `monthly_reports`
Stores Consolidated Month-End Institution Summaries.
```sql
CREATE TABLE monthly_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  dars TEXT NOT NULL DEFAULT 'Dars 1',
  month TEXT NOT NULL,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  prepared_by TEXT NOT NULL,
  designation TEXT NOT NULL,
  attendance_total_working_days INTEGER NOT NULL DEFAULT 0,
  attendance_avg_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  attendance_regular_count INTEGER NOT NULL DEFAULT 0,
  attendance_low_count INTEGER NOT NULL DEFAULT 0,
  leave_total_received INTEGER NOT NULL DEFAULT 0,
  leave_approved_count INTEGER NOT NULL DEFAULT 0,
  leave_unapproved_count INTEGER NOT NULL DEFAULT 0,
  leave_reasons JSONB NOT NULL DEFAULT '{"medical": 0, "family_function": 0, "personal": 0, "others": 0}'::JSONB,
  programs_count INTEGER NOT NULL DEFAULT 0,
  programs_names TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  programs_outcomes TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  participation_total INTEGER NOT NULL DEFAULT 0,
  participation_active INTEGER NOT NULL DEFAULT 0,
  participation_achievements TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  student_reports JSONB NOT NULL DEFAULT '[]'::JSONB,
  observations TEXT[] NOT NULL,
  suggestions TEXT[] NOT NULL
);
```

---

## 6. Layout & Styling Guidelines

- **Design Aesthetic**: Sleek, high-premium dark glassmorphism styling (`bg-slate-950` / `bg-slate-900` / glass borders) with HSL tailored indigo and teal highlights. Includes a dynamic light/dark theme switch.
- **Responsiveness**: Form columns and grids fold to vertical stacks on mobile (`grid-cols-1 md:grid-cols-3` or `sm:grid-cols-2`) and expand dynamically on desktop to fit extensive table grids without truncation.
- **Print Optimization**: Dedicated media rules (`@media print` / `no-print` classes) to ensure reports print cleanly on standard A4 paper without displaying navigational controls or background gradient overflows.
