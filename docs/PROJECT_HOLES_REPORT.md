# 🕳️ Project Holes Review Report

Based on a thorough review of the Campus Attendance Tracker architecture, documentation, database schema, and source code, here are the critical "holes" and vulnerabilities identified in the current implementation.

## 🚨 Critical Architecture & Security Flaws

### 1. Incomplete RLS Foreign Key Validation (Data Pollution Risk)
The Row Level Security (RLS) policies successfully lock down queries to the current user via `auth.uid() = user_id`. However, **they fail to validate relationships**.
* **The Hole**: A malicious authenticated user A can insert a timetable slot, subject, or attendance log setting their own `user_id`, but injecting a `semester_id` belonging to user B.
* **Impact**: While User A cannot read User B's semester, they can pollute User B's DB with phantom subjects/logs. If User B deletes their semester, it will cascade-delete User A's garbage. 
* **Fix**: RLS policies for inserts should use `EXISTS` to verify that the parent `semester_id` actually belongs to `auth.uid()`.

### 2. Client-Side "Transactions" (Severe Data Loss Risk)
In `useSyncedData.ts`, bulk updates like `updateAllTimetable` perform operations sequentially without database transactions.
* **The Hole**: 
  ```typescript
  // 1. Clears ALL timetable slots
  await db.clearTimetable(semesterData.semester.id);
  // 2. Loops to insert new ones
  for (const slot of timetable) { await db.upsertTimetableSlot(...) }
  ```
* **Impact**: If a user's network drops exactly after step 1, or their browser tab closes, their **entire timetable is permanently wiped out**. The Supabase JS client doesn't support atomic transactions.
* **Fix**: Move bulk operations to a Supabase Postgres RPC (Stored Procedure) so the clear and insert happen atomically.

### 3. Cascading Deletes on Subject Syncs
* **The Hole**: In `updateAllSubjects`, missing subjects are deleted sequentially.
* **Impact**: Because `attendance_logs` and `timetable_slots` CASCADE delete when a subject is deleted, a failed client-side sync loop, or an accidental UI desync, could irreversibly wipe out a student's entire attendance history for a subject in milliseconds.
* **Fix**: Implement Soft Deletes (`is_deleted = boolean`), or use an RPC transaction to ensure the sync is totally safe. Do not cascade delete attendance logs automatically from the UI sync unless explicitly confirmed by the user.

## 🐛 Logic & State Bugs

### 4. The VAC Subject Void (Null Key Bug)
* **The Hole**: In `useSyncedData.ts` -> `updateAllSubjects`, there is a helper `getSubjectKey` used to match existing subjects and avoid duplicate creations:
  ```typescript
  if (s.zero_credit_type === 'library' || s.zero_credit_type === 'seminar') {
    return `__${s.zero_credit_type}__`;
  }
  return null; // Missing 'vac' type!
  ```
* **Impact**: The database allows `vac` (Value Added Course) as a `zero_credit_type`, but the frontend fails to map its key. Any 'vac' subject updated through settings will be indefinitely recreated or duplicated instead of updated.

### 5. Optimistic UI Race Conditions
* **The Hole**: `addAttendanceLog` immediately pushes a generated `temp-${Date.now()}` ID into the React state array, then attempts the network request.
* **Impact**: Rapid button tapping by a user on a slow connection will spawn multiple duplicate optimistic entries in the UI. While the database's `UNIQUE` constraint will block the actual insertions, the local UI state will become temporarily invalid, flashing duplicate entries or causing layout jumps before `loadData(false)` kicks in to heal the state.
* **Fix**: Disable the specific UI button during its individual loading state or debounce the optimistic push. 

## ⚖️ Scalability & Performance Liabilities

### 6. The "Mega-Payload" State Fetch
* **The Hole**: The `useSyncedData` hook pulls the **entire** active semester's history (subjects, timetables, all holidays, and 100% of historical attendance logs) into client-side React memory.
* **Impact**: As the semester reaches its end, compiling safe-skip margins, OD track totals, and leave simulations requires re-evaluating potentially hundreds of rows against complex date math logic directly on the UI thread for every component re-render. This will lead to battery drain and lag on budget smartphones.
* **Fix**: The heavy analytical lifting (`getStats`, `Safe Margin Calculator`) should ideally be memoized aggressively via `useMemo` or shifted to the server side / Supabase Edge Functions.

### 7. Fixed Business Constraints
* **The Hole**: The timetable logic hardcodes 7 periods and explicitly slices timings `start_time.slice(0, 5)` expecting exact `08:30 - 15:15` behavior.
* **Impact**: If SVCE ever changes standard period counts from 7 to 8 (e.g., for extra labs), or changes start times, the app completely breaks and cannot be dynamically adjusted by the student.

---
**Summary Verdict:**
The app looks feature-rich but heavily trusts the client with data integrity. Moving database writes to RPCs (Supabase Stored Procedures) and shoring up RLS relational checks are the highest priorities to prevent catastrophic data loss for students.
