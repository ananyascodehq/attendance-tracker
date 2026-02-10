# Campus Attendance Tool — Task List

## Phase 0 — Auth Foundation (Supabase + Google Domain)

### Setup

- [x] Install `@supabase/supabase-js`
- [x] Install `@supabase/ssr` (replaces deprecated auth-helpers-nextjs)
- [x] Add env vars:
  - [x] NEXT_PUBLIC_SUPABASE_URL
  - [x] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [x] Create Supabase browser client (`/lib/supabase/client.ts`)
- [x] Create Supabase server client (`/lib/supabase/server.ts`)

### Database

- [x] Create `profiles` table
- [x] Add columns:
  - [x] id (uuid, pk, auth.users ref)
  - [x] email
  - [x] full_name
  - [x] avatar_url
  - [x] onboarded (boolean default false)
  - [x] created_at
- [x] Enable RLS
- [x] Add policies:
  - [x] select own profile
  - [x] insert own profile
  - [x] update own profile

### Google OAuth

- [x] Configure Google provider in Supabase
- [x] Add redirect URL
- [x] Restrict to `svce.ac.in` domain

### Auth Pages

- [x] Create `/login`
- [x] Add Google login button
- [x] Implement OAuth redirect

### Callback

- [x] Create `/auth/callback`
- [x] Exchange code → session
- [x] Validate email domain (`@svce.ac.in`)
- [x] Sign out if invalid
- [x] Upsert profile row
- [x] Redirect:
  - [x] `/onboarding` if new
  - [x] `/` if existing

### Proxy (Route Protection)

- [x] Protect all routes except:
  - [x] /login
  - [x] /auth/callback
- [x] Block unauthenticated users
- [x] Enforce domain again
- [x] Migrated middleware.ts → proxy.ts for Next.js 16

### Session Handling

- [x] Create `AuthProvider`
- [x] Provide session globally
- [x] Listen to auth state changes

### Logout

- [x] Add logout button
- [x] Clear session
- [x] Redirect login

---

## Phase 1 — Multi-User Data Model

### Core Tables

- [x] users (via Supabase auth)
- [x] profiles (linked to auth)
- [x] semesters
- [x] subjects
- [x] timetable_slots
- [x] attendance_logs
- [x] holidays
- [x] cat_periods (exam periods)

### Ownership Rules

- [x] All rows tied to `auth.uid()`
- [x] RLS on every table
- [x] Prevent cross-user reads

### TypeScript Types

- [x] Database types (`/types/database.ts`)
- [x] Insert/Update types for all tables

### Data Access Layer

- [x] Database functions (`/lib/supabase/database.ts`)
- [x] CRUD for all tables
- [x] Composite queries (getSemesterData)

### React Hooks

- [x] `useSemesterData` hook with real-time subscriptions
- [x] `useSemesters` hook for semester list

---

## Phase 2 — Timetable Templates (viral adoption)

### Tables

- [ ] timetable_templates
- [ ] template_slots
- [ ] department
- [ ] semester_template_map

### Features

- [ ] create template
- [ ] publish template
- [ ] import template
- [ ] clone into user account

Goal:  
One student sets timetable → whole class imports.

---

## Phase 3 — Sync Layer ✅

### Replace localStorage as source of truth

- [x] DB becomes primary storage
- [x] `useSyncedData` hook replaces localStorage-based `useAttendanceData`
- [x] `DataProvider` context wraps all pages
- [x] All components migrated to `useData()` from DataProvider
- [x] Realtime subscriptions for live updates
- [x] DB types ↔ legacy types conversion layer

### Conflict strategy

- [x] last write wins (Supabase upsert)
- [x] dedupe attendance logs (unique constraint on semester_id, subject_id, date, period_number)

---

## Phase 4 — Onboarding Flow (Partial ✅)

### After first login

- [ ] choose department (future — Phase 2 templates)
- [x] create semester (name, start/end dates)
- [ ] import timetable template (future — Phase 2 templates)
- [x] redirect to /settings for subject & timetable setup
- [x] 2-step onboarding UI (welcome → semester setup)
- [x] profile marked as onboarded

Target: onboarding < 60 seconds.

---

## Phase 5 — Core Retention Features

### Daily logging

- [ ] today auto loads
- [ ] default present
- [ ] one-tap mark leave/OD
- [ ] fast navigation

### Predictive engine

- [ ] safe skip count
- [ ] risk warnings
- [ ] projected attendance

### OD tracker

- [ ] usage bar
- [ ] history list

---

## Phase 6 — PWA

- [ ] service worker
- [ ] installable app
- [ ] offline logging
- [ ] sync when online

---

## Phase 7 — Analytics

- [ ] weekly trends
- [ ] attendance heatmap
- [ ] subject risk ranking
- [ ] skip recommendations

---

## Phase 8 — Backup & Safety

- [ ] export JSON
- [ ] import JSON
- [ ] auto backup
- [ ] schema versioning

---

## Phase 9 — Scale Prep

- [ ] test with 5 users
- [ ] test with 20 users
- [ ] department rollout
- [ ] campus rollout

---

## Non-Goals (for now)

- [ ] teacher dashboards
- [ ] ERP integration
- [ ] admin panel
- [ ] notifications spam
- [ ] microservices

---

## Definition of “Campus Ready”

- Login restricted to college domain
- Data synced across devices
- Timetable import in <1 min
- Daily logging frictionless
- No data loss
- Stable for 500+ users
