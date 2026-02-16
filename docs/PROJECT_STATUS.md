# Campus Attendance Tracker - Project Status Document

**Version:** 2.2.0  
**Last Updated:** February 16, 2026  
**Status:** Multi-User Platform (Cloud-Synced) + Viral Sharing

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Authentication System](#authentication-system)
5. [Database Schema](#database-schema)
6. [Features Implemented](#features-implemented)
7. [Data Models](#data-models)
8. [Calculation Logic](#calculation-logic)
9. [Components Breakdown](#components-breakdown)
10. [Migration Phases](#migration-phases)
11. [Known Limitations](#known-limitations)
12. [Potential Improvements](#potential-improvements)

---

## 🎯 Project Overview

A comprehensive Next.js application for college students to track semester attendance, manage leave impact, and maintain the required **75% per-subject** and **80% overall** attendance thresholds.

### Core Purpose

- Track daily attendance across multiple subjects
- Simulate leave impact before taking time off
- Calculate safe margins for skipping classes
- Track On-Duty (OD) hours (max 72 per semester)
- Manage semester configuration, holidays, and CAT exam periods
- **Multi-user support** with cloud sync via Supabase
- **Google OAuth** restricted to `@svce.ac.in` college domain

---

## 🛠 Tech Stack

| Category      | Technology           | Version |
| ------------- | -------------------- | ------- |
| Framework     | Next.js (App Router) | 16.1.6  |
| Language      | TypeScript           | 5.3.x   |
| UI            | React                | 18.2.x  |
| Styling       | Tailwind CSS         | 3.3.x   |
| Date Handling | date-fns             | 2.30.x  |
| Forms         | react-hook-form      | 7.48.x  |
| Charts        | Recharts             | 2.15.x  |
| **Auth**      | Supabase Auth        | 2.x     |
| **Database**  | Supabase (Postgres)  | -       |
| **Realtime**  | Supabase Realtime    | -       |
| **SSR Auth**  | @supabase/ssr        | -       |

---

## 🏗 Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard (home)
│   ├── layout.tsx         # Root layout (AuthProvider + DataProvider)
│   ├── globals.css        # Global styles + Tailwind
│   ├── attendance/        # Attendance logging page
│   ├── auth/
│   │   └── callback/      # OAuth callback handler
│   ├── login/             # Login page (Google OAuth)
│   ├── onboarding/        # New user onboarding (3-step)
│   ├── planner/           # Planning tools page
│   └── settings/          # Configuration page
├── components/
│   ├── AuthProvider.tsx   # Auth context (session, user, signOut)
│   ├── DataProvider.tsx   # Data context (wraps useSyncedData)
│   ├── ErrorBoundary.tsx  # React error boundary with retry UI
│   ├── ThemeProvider.tsx  # Dark mode provider
│   ├── Navigation.tsx     # App nav + logout + avatar
│   ├── AttendanceChart.tsx
│   ├── AttendanceLogger.tsx
│   ├── CelebrationAnimation.tsx
│   ├── DashboardCard.tsx
│   ├── LeaveSimulator.tsx
│   ├── OdTracker.tsx
│   ├── SafeMarginCalculator.tsx
│   ├── SemesterConfigManager.tsx
│   ├── Spinner.tsx
│   ├── SubjectDetailModal.tsx
│   ├── SubjectsManager.tsx
│   └── TimetableBuilder.tsx
├── hooks/
│   ├── useSyncedData.ts   # ★ Main data hook (Supabase + retry logic)
│   └── useSemesterData.ts # Semester-level queries + realtime
├── lib/
│   ├── calculations.ts    # All attendance calculation logic
│   ├── constants.ts       # App constants
│   ├── sampleData.ts      # Initial sample data
│   └── supabase/
│       ├── client.ts      # createBrowserClient
│       ├── server.ts      # createServerClient (cookies)
│       ├── middleware.ts  # Session refresh (used by proxy.ts)
│       └── database.ts    # ★ CRUD for all 7 tables
└── types/
    ├── index.ts           # App types (legacy format)
    └── database.ts        # Supabase table types + Insert/Update
supabase/
    └── schema.sql         # Full database schema with RLS
```

### Data Flow (v2.0 — Cloud-Synced Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                     User's Browser                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  layout.tsx                                                  │
│  └── ThemeProvider                                           │
│      └── ErrorBoundary  (graceful error handling + retry)    │
│          └── AuthProvider  (session, user, signOut)          │
│              └── DataProvider  (wraps useSyncedData)         │
│                  └── Navigation + <page>                     │
│                                                              │
│  useSyncedData()                                             │
│  ├── Reads from Supabase (getActiveSemesterData)             │
│  ├── Converts DB types → legacy AppData for calculations     │
│  ├── Provides CRUD that writes to Supabase (with retry)      │
│  └── Subscribes to realtime changes                          │
│                                                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase Cloud                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  auth.users  ──► profiles (1:1)                              │
│                      │                                       │
│                      └──► semesters (1:N, one active)        │
│                              │                               │
│                 ┌────────────┼────────────┬─────────┐        │
│                 ▼            ▼            ▼         ▼        │
│            subjects   timetable_slots  holidays  cat_periods │
│                 │            │                               │
│                 └────────────┘                               │
│                       │                                      │
│                       ▼                                      │
│              attendance_logs                                 │
│                                                              │
│  RLS: Every table → user_id = auth.uid()                     │
│  Triggers: updated_at auto-refreshed                         │
│  Realtime: All tables broadcast changes                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication System

### Google OAuth with Domain Restriction

| Aspect          | Detail                               |
| --------------- | ------------------------------------ |
| Provider        | Google OAuth 2.0 via Supabase Auth   |
| Allowed Domain  | `@svce.ac.in` only                   |
| Callback URL    | `/auth/callback`                     |
| Session Storage | httpOnly cookies (Supabase SSR)      |
| Session Refresh | Automatic via proxy on every request |

### Auth Flow

```
/login  →  Google OAuth  →  /auth/callback
                                   │
                          Validate @svce.ac.in
                                   │
                        ┌──────────┴──────────┐
                   Invalid email          Valid email
                        │                      │
                   Sign out +            Upsert profile
                   show error                  │
                                     ┌─────────┴─────────┐
                                  New user          Existing user
                                     │                    │
                                /onboarding             /
                                (create semester)
```

### Protected Routes

- **Public:** `/login`, `/auth/callback`
- **Protected:** Everything else (proxy redirects to `/login`)

### Components

- `AuthProvider` — React context providing `user`, `session`, `loading`, `signOut`
- `Navigation` — Shows user avatar (from Google), logout button, hidden on `/login`

---

## 🗄 Database Schema

### Tables (7 total)

| Table             | Purpose                    | Owner Key | RLS |
| ----------------- | -------------------------- | --------- | --- |
| `profiles`        | User info (name, avatar)   | `id`      | ✅  |
| `semesters`       | Semester dates & name      | `user_id` | ✅  |
| `subjects`        | Courses per semester       | `user_id` | ✅  |
| `timetable_slots` | Weekly period schedule     | `user_id` | ✅  |
| `attendance_logs` | Attendance per date/period | `user_id` | ✅  |
| `holidays`        | Holiday dates              | `user_id` | ✅  |
| `cat_periods`     | CAT exam date ranges       | `user_id` | ✅  |

### Key Constraints

- `subjects` — Unique `(semester_id, subject_code)`
- `timetable_slots` — Unique `(semester_id, day_of_week, period_number)`
- `attendance_logs` — Unique `(semester_id, subject_id, date, period_number)`
- `holidays` — Unique `(semester_id, date)`
- `cat_periods` — Check `end_date >= start_date`

### Indexes

- `semesters` — `(user_id)`, `(user_id, is_active)`
- `subjects` — `(semester_id)`, `(user_id)`
- `timetable_slots` — `(semester_id)`, `(semester_id, day_of_week)`
- `attendance_logs` — `(semester_id)`, `(semester_id, date)`, `(subject_id)`
- `holidays` — `(semester_id)`
- `cat_periods` — `(semester_id)`

### Triggers

- `updated_at` auto-set on UPDATE for: semesters, subjects, attendance_logs

### Helper Functions

- `get_active_semester(user_id)` — Returns active semester UUID

---

## ✅ Features Implemented

### 1. Authentication & User Management

- **Google OAuth** sign-in restricted to college domain
- **Auto profile creation** from Google metadata
- **Session persistence** across browser restarts
- **Logout** clears session and redirects

### 2. Onboarding (`/onboarding`) — NEW in v2.0

- **Step 1 — Welcome:** Feature highlights (track, monitor, plan)
- **Step 2 — Semester Setup:** Name, start date, end date
- Creates first semester in Supabase
- Marks profile as onboarded
- Redirects to `/settings` for subjects & timetable

### 3. Dashboard (`/`)

- **Overall attendance percentage** with color-coded status
- **Subject-wise attendance cards** with quick stats
- **Attendance chart** (Recharts bar chart)
- **Quick stats**: Total sessions, attended, OD used/remaining
- **Subject detail modal** showing class-by-class history
- **Dark mode support**

### 4. Attendance Logging (`/attendance`)

- **Date picker** with navigation (prev/next day buttons)
- **Timetable-based period display** for selected day
- **Three attendance statuses**: Present (default), Leave, OD
- **OD reason capture** with modal
- **Holiday detection** - Shows message if date is a holiday
- **Semester bounds detection** - Warns if outside semester dates
- **CAT exam period detection** - No classes during exams
- **Auto-sync** to Supabase on every change

### 5. Planning Tools (`/planner`)

#### Leave Simulator

- **Single day leave checkbox** for quick simulation
- **Date range selection** with start/end dates
- **Schedule preview** of classes that would be missed
- **Impact calculation** showing projected attendance drop
- **Per-subject impact** highlighting at-risk subjects
- **Holiday/CAT awareness** - Excludes non-class days

#### OD Tracker

- **Visual progress bar** (used / 72 hours max)
- **Detailed history** with expandable list
- **Grouped by date** for easy review

#### Safe Margin Calculator

- **Per-subject breakdown**: future sessions, must attend, can skip
- **Projected totals** and minimum requirements
- Educational disclaimer encouraging attendance

### 6. Settings (`/settings`)

#### Subjects Manager

- **Add/edit/delete subjects** → saved to Supabase
- **Credit options**: 0, 1.5, 2, 3, 4
- **Types**: Regular, Lab (1.5cr), Library/Seminar/VAC (0cr)
- **Unique color coding** per subject

#### Timetable Builder

- **Drag-and-drop** (desktop) / **Tap-to-select** (mobile)
- **7 periods × 6 days** grid (Mon-Sat)
- **Fixed period timings** (08:30 - 15:15)
- **Lab handling** - 3 consecutive periods auto-fill
- **VAC handling** - 2 consecutive periods auto-fill

#### Semester Configuration

- **Semester dates**: Start, end, last instruction date
- **Holiday management**: Add/delete with descriptions
- **CAT exam periods**: Multiple with date ranges

### 7. Theme Support

- **Dark mode toggle** in navigation
- **System preference detection**
- **Persistent preference** in localStorage

---

## 📊 Data Models

### Supabase Types (`types/database.ts`)

```typescript
// Key types with Insert/Update variants for each table
interface Semester { id, user_id, name, start_date, end_date, last_instruction_date, is_active }
interface SubjectDB { id, user_id, semester_id, subject_code, subject_name, credits, zero_credit_type }
interface TimetableSlotDB { id, user_id, semester_id, subject_id, day_of_week, period_number, start_time, end_time }
interface AttendanceLogDB { id, user_id, semester_id, subject_id, date, period_number, status, notes }
interface HolidayDB { id, user_id, semester_id, date, description }
interface CatPeriodDB { id, user_id, semester_id, name, start_date, end_date }
interface SemesterData { semester, subjects[], timetable[], attendance[], holidays[], cat_periods[] }
```

### Legacy Types (`types/index.ts`)

Still used by calculation functions. `useSyncedData` converts DB → legacy on read.

---

## 🧮 Calculation Logic

### Per-Subject Attendance

```
Attendance% = (Attended Sessions / Total Scheduled Sessions) × 100
```

- Excludes: Sundays, holidays, CAT exam periods
- Labs: 3 periods = 1 session | VAC: 2 periods = 1 session
- OD counts as attended | Unmarked = present (default)

### Overall Attendance

```
Overall% = (Total Attended Periods / Total Periods) × 100
```

### Status Thresholds

| Status           | Per-Subject | Overall |
| ---------------- | ----------- | ------- |
| Safe (Green)     | ≥77%        | ≥82%    |
| Warning (Yellow) | 75-77%      | 80-82%  |
| Danger (Red)     | <75%        | <80%    |

### Safe Margin

```
Can Skip = Future Sessions - ceil(Projected Total × 0.75) + Already Attended
```

---

## 🧩 Components Breakdown

### Provider Stack (layout.tsx)

```
ThemeProvider → AuthProvider → DataProvider → Navigation + Pages
```

### Core Components

| Component               | Purpose              | Data Source   |
| ----------------------- | -------------------- | ------------- |
| `AuthProvider`          | Auth state + signOut | Supabase Auth |
| `DataProvider`          | All app data         | useSyncedData |
| `useSyncedData`         | CRUD + realtime      | Supabase DB   |
| `AttendanceLogger`      | Daily attendance     | useData()     |
| `LeaveSimulator`        | Leave impact         | useData()     |
| `SafeMarginCalculator`  | Skip margins         | useData()     |
| `OdTracker`             | OD history           | useData()     |
| `SubjectsManager`       | Subject CRUD         | useData()     |
| `TimetableBuilder`      | Schedule builder     | useData()     |
| `SemesterConfigManager` | Semester config      | useData()     |

---

## 📈 Migration Phases

### ✅ Phase 0 — Auth Foundation (COMPLETE)

- Supabase Auth with Google OAuth
- Domain restriction to `@svce.ac.in`
- Login page, callback, proxy (route protection)
- AuthProvider, route protection, logout

### ✅ Phase 1 — Multi-User Data Model (COMPLETE)

- 7 tables with RLS policies
- TypeScript types + Insert/Update variants
- CRUD functions in `database.ts`
- Indexes and triggers

### ✅ Phase 3 — Sync Layer (COMPLETE)

- `useSyncedData` hook as primary data source
- `DataProvider` context wrapping entire app
- All pages migrated from `useAttendanceData` → `useData`
- Realtime subscriptions for live updates
- Onboarding flow creates first semester
- DB types ↔ legacy types conversion layer

### ✅ Phase 4 — Onboarding Flow (COMPLETE)

- 3-step onboarding: Welcome → Department → Semester
- Department selection with all UG/PG programs
- Department stored in profiles table
- Profile marked as onboarded after completion
- Redirect to /settings for subject & timetable setup

### ✅ Phase 5 — Core Retention Features (COMPLETE)

- **Daily logging:** Today auto-loads, default present, one-tap leave/OD
- **Predictive engine:** Safe skip count, risk warnings, projected attendance
- **OD tracker:** Usage bar (72h limit), full history list with details

### ✅ Phase 2 — Timetable Templates (COMPLETE)

- **Database:** `timetable_templates` table with RLS (public read, auth write)
- **Share Codes:** Format `{DEPT}{YEAR}{SECTION}-K{YY}` (e.g., CS3A-K26)
- **Collision Handling:** Auto-append random suffix on duplicate codes
- **ShareTimetableButton:** Generate code → copy → WhatsApp share
- **ImportTimetableModal:** Enter code → preview → import subjects + slots
- **Metrics:** Atomic `use_count` increment, tracks imports per template
- **Edge Cases:** Self-import blocked, overwrite warning, empty validation

### 🔜 Phase 6+ — Future

- PWA + offline mode
- Analytics dashboard
- Admin panel

---

## ⚠️ Known Limitations

1. ~~**No Backend/Cloud Sync**~~ ✅ RESOLVED
2. ~~**No User Authentication**~~ ✅ RESOLVED
3. ~~**No Error Boundaries**~~ ✅ RESOLVED (ErrorBoundary + retry logic added)
4. **Limited Offline Support** — Requires internet for all operations
5. **No Export/Import UI** — Functions exist but no UI
6. **Limited Mobile Experience** — Tables may overflow on small screens
7. **No Notifications** — No alerts or reminders
8. **No PWA Support** — Not installable
9. **Fixed Period Timings** — Hardcoded 08:30 - 15:15
10. **No Undo/Redo** — Actions are immediate
11. **Dual Type Systems** — `types/index.ts` + `types/database.ts` require manual sync (intentional for calculation compatibility)

---

## 💡 Potential Improvements

### High Priority

1. **PWA + Offline Mode** — Service worker, sync queue
2. **Timetable Templates (Phase 2)** — Viral class-wide sharing
3. **Data Export UI** — Download/restore JSON

### Medium Priority

4. **Calendar View** — Monthly attendance view
5. **Smart Suggestions** — "You can skip X more this week"
6. **Semester Archives** — Historical comparison
7. **Customizable Period Timings**

### Low Priority

8. **Gamification** — Streaks, badges
9. **Analytics** — Patterns, trends
10. **Accessibility** — Screen reader, keyboard nav
11. **Integrations** — Google Calendar, iCal

---

## 📁 File Reference

| File                                      | Purpose                            |
| ----------------------------------------- | ---------------------------------- |
| `src/hooks/useSyncedData.ts`              | ★ Main data hook (Supabase+retry)  |
| `src/lib/supabase/database.ts`            | ★ CRUD for all tables              |
| `src/components/DataProvider.tsx`         | ★ Data context for all pages       |
| `src/components/ErrorBoundary.tsx`        | React error boundary with retry UI |
| `src/components/AuthProvider.tsx`         | Auth context (session, user)       |
| `src/lib/supabase/client.ts`              | Browser Supabase client            |
| `src/lib/supabase/server.ts`              | Server Supabase client             |
| `src/lib/supabase/middleware.ts`          | Session refresh logic              |
| `src/proxy.ts`                            | Route protection (Next.js 16)      |
| `src/app/login/page.tsx`                  | Google OAuth login page            |
| `src/app/auth/callback/route.ts`          | OAuth callback + domain check      |
| `src/app/onboarding/page.tsx`             | New user onboarding (3-step)       |
| `src/lib/calculations.ts`                 | All attendance calculations        |
| `src/types/database.ts`                   | Supabase table types               |
| `src/types/index.ts`                      | Legacy app types (used by calcs)   |
| `supabase/schema.sql`                     | Full DB schema with RLS            |
| `supabase/templates.sql`                  | Timetable templates migration      |
| `src/components/ShareTimetableButton.tsx` | Share code generation + modal      |
| `src/components/ImportTimetableModal.tsx` | Code entry + import logic          |

---

## 🔧 Changelog

### v2.2.0 — Phase 2: Timetable Templates (Feb 16, 2026)

- **Database:**
  - New `timetable_templates` table with JSONB slots/subjects storage
  - RLS: Public SELECT, authenticated INSERT, creator-only UPDATE/DELETE
  - `increment_template_use_count()` RPC for atomic counter updates
  - `template_metrics` view for analytics
- **Types:**
  - Added `TimetableTemplate`, `TemplateSlot`, `TemplateSubject` interfaces
  - Added `DEPARTMENT_ABBREVIATIONS` mapping for share codes
- **CRUD Functions:**
  - `createTemplate()` with collision-resistant code generation
  - `getTemplateByCode()`, `getTemplatesByUser()`, `incrementTemplateUseCount()`
  - `convertToTemplateFormat()` helper for DB→template conversion
- **Components:**
  - `ShareTimetableButton` — Button/card variants, generates code, copy + WhatsApp share
  - `ImportTimetableModal` — Code search, preview with stats, overwrite warning, import
- **Settings Page:**
  - Added "Quick Setup" section with share/import cards
- **Edge Cases Handled:**
  - Self-import blocked
  - Empty timetable validation before share
  - Overwrite warning when user has existing timetable
  - Collision handling with random suffix

### v2.1.1 — Architecture Cleanup (Feb 16, 2026)

- **Deprecated Code Removed:**
  - Deleted `useAttendanceData.ts` (replaced by `useSyncedData`)
  - Deleted `storage.ts` (localStorage utilities no longer needed)
  - Removed backwards-compat `useAttendanceData` alias from DataProvider
- **Error Handling:**
  - Added `ErrorBoundary` component with retry UI
  - ErrorBoundary wraps entire app in layout.tsx
- **Retry Logic:**
  - Added `withRetry()` utility in useSyncedData (exponential backoff)
  - All mutation operations now retry up to 3 times on transient failures
  - Auth/permission errors are not retried (fail fast)
- **Type System Note:**
  - `types/index.ts` (legacy) intentionally retained — used by calculation functions
  - `types/database.ts` (Supabase) — used by database layer
  - Conversion happens in `useSyncedData` via helper functions

### v2.1.0 — Phase 4 & 5 Complete (Feb 16, 2026)

- **Phase 4 — Onboarding Flow:**
  - Added department selection step to onboarding (3-step flow)
  - Added `department` column to profiles table
  - Added `Department` TypeScript type with all 20 UG/PG programs
- **Phase 5 — Core Retention Features:**
  - Verified all daily logging features (today auto-loads, default present, one-tap mark)
  - Verified predictive engine (safe skip count, risk warnings, projected attendance)
  - Verified OD tracker (usage bar, history list)

### v2.0.2 — Next.js 16 Migration (Feb 10, 2026)

- **Proxy Migration:** Renamed `middleware.ts` → `proxy.ts` for Next.js 16 compatibility
- **Function Rename:** `middleware()` → `proxy()` per new convention
- Fixes `MIDDLEWARE_INVOCATION_FAILED` error on Vercel deployment

### v2.0.1 — Bug Fixes (Feb 8, 2026)

- **SubjectsManager:** Fixed library/seminar deletion bug (was deleting ALL subjects without code)
- **SubjectsManager:** Fixed library/seminar editing (edits failed silently)
- **SubjectsManager:** Added duplicate check for library/seminar entries
- **SubjectsManager:** Added `getSubjectId()` helper for unique identification
- **useSyncedData:** Fixed loading screen flicker on autosave
  - Added `showLoading` parameter to `loadData()`
  - Mutations now use silent background refresh `loadData(false)`
  - Real-time subscriptions also use silent refresh

### v2.0.0 — Multi-User Cloud Platform (Feb 8, 2026)

- **Phase 0:** Supabase Auth + Google OAuth with `@svce.ac.in` restriction
- **Phase 1:** 7 Supabase tables with RLS, TypeScript types, CRUD functions
- **Phase 3:** `useSyncedData` replaces localStorage, `DataProvider` context, realtime subscriptions
- **Onboarding:** Two-step flow (welcome → create semester → settings)
- **All pages** now read/write from Supabase

### v1.3.0 — Feature Additions

- Overall attendance formula: attended/total periods (was avg of %)
- Single day leave checkbox in Leave Simulator
- Mobile tap-to-select in TimetableBuilder
- Invalid date guards

### v1.0.0 — Initial Release

- Full attendance tracking with localStorage
- Dashboard, logging, planner, settings
- Dark mode, OD tracking, CAT periods

---

## 🔑 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

_This document serves as a comprehensive reference for the current state of the project. Last updated after Phase 5 (Core Retention Features) completion._
