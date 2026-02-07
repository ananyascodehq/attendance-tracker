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

- [ ] Create `profiles` table
- [ ] Add columns:
  - [ ] id (uuid, pk, auth.users ref)
  - [ ] email
  - [ ] full_name
  - [ ] avatar_url
  - [ ] onboarded (boolean default false)
  - [ ] created_at
- [ ] Enable RLS
- [ ] Add policies:
  - [ ] select own profile
  - [ ] insert own profile
  - [ ] update own profile

### Google OAuth

- [ ] Configure Google provider in Supabase
- [ ] Add redirect URL
- [ ] Restrict to `svce.ac.in` domain

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

### Middleware

- [x] Protect all routes except:
  - [x] /login
  - [x] /auth/callback
- [x] Block unauthenticated users
- [x] Enforce domain again

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

- [ ] users (via Supabase auth)
- [ ] profiles (linked to auth)
- [ ] semesters
- [ ] subjects
- [ ] timetable_slots
- [ ] attendance_logs
- [ ] od_logs
- [ ] holidays

### Ownership Rules

- [ ] All rows tied to `auth.uid()`
- [ ] RLS on every table
- [ ] Prevent cross-user reads

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

## Phase 3 — Sync Layer

### Replace localStorage as source of truth

- [ ] DB becomes primary storage
- [ ] local cache only
- [ ] optimistic UI updates
- [ ] sync queue

### Conflict strategy

- [ ] last write wins
- [ ] dedupe attendance logs

---

## Phase 4 — Onboarding Flow

### After first login

- [ ] choose department
- [ ] choose semester
- [ ] import timetable template
- [ ] ready dashboard

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
