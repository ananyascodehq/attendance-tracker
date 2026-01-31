# College Attendance Tracking System — Technical Specification

**Document Type:** Technical Specification (SPEC)
**Version:** 3.0 FINAL
**Date:** 2026-01-29
**Status:** Build-Ready, All Clarifications Incorporated

---

## 0. Authority & Scope

This document is the **single source of truth** for implementation.

Rules in this SPEC override intuition, UI assumptions, and informal interpretations. If behavior is not explicitly defined here, it **must not be implemented** without updating this document.

---

## 1. Attendance Policy (ABSOLUTE TRUTH)

| Metric              | Value                                            |
| ------------------- | ------------------------------------------------ |
| Per-subject minimum | 75%                                              |
| Overall minimum     | 80%                                              |
| Overall calculation | Flat average across all subjects (including VAC) |
| Warning thresholds  | 77% per-subject, 82% overall                     |
| OD limit            | 72 hours / semester (tracked, not enforced)      |

Notes:

* Per-subject and overall thresholds are evaluated independently.
* Failing either condition implies **exam ineligibility risk**.

---

## 2. Attendance Mechanics

### 2.1 Attendance Units

* Attendance is measured in **sessions**, not hours.
* A lab session (even 3 hours) counts as **one session**.
* Partial lab attendance still counts as **present**.

### 2.2 Default Attendance Assumption

* Faculty logbook is the assumed ground truth.
* Every scheduled session defaults to **present**.
* User explicitly marks only **OD** or **Leave**.
* The system is **predictive**, not a mirror of ERP data.

### 2.3 Status Semantics

| Status    | Attendance Impact         | Notes                         |
| --------- | ------------------------- | ----------------------------- |
| present   | Counts as attended        | Default state                 |
| od        | Counts as attended        | Auto-approved                 |
| leave     | Counts as absent          | Internal only                 |
| cancelled | Counts as attended        | Individual class cancellation |
| holiday   | Excluded from denominator | Institute-wide only           |

---

## 3. OD (On-Duty) Rules

* All ODs are auto-approved.
* OD sessions count as **present** for attendance.
* OD hours contribute toward the **72-hour reference limit**.
* OD limits are informational only (no blocking).
* Partial-day OD is allowed.
* Retroactive OD entry is allowed.

---

## 4. Data Model

### 4.1 Semester Configuration

```
SemesterConfig {
  start_date: ISODate
  end_date: ISODate
  last_instruction_date: ISODate
}
```

---

### 4.2 Subject

```
Subject {
  code: string
  name: string
  credits: number   // informational only
}
```

Credits do **not** affect attendance calculations.

---

### 4.3 Timetable Slot

```
TimetableSlot {
  id: string
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'
  period: 1 | 2 | 3 | 4 | 5 | 6 | 7
  subject_code: string
  start_time: HH:mm
  end_time: HH:mm
  duration_hours: number
  is_library: boolean
}
```

Rules:

* Timetable defines **all possible sessions**.
* Saturdays default to holidays unless explicitly scheduled.
* Library/seminar slots cannot be used for OD.

---

### 4.4 Attendance Log

```
AttendanceLog {
  date: ISODate
  period: 1–7
  subject_code: string
  status: 'present' | 'od' | 'leave'
  notes?: string
}
```

Constraints:

* Period-level granularity is mandatory.
* Only deviations from default (present) need to be logged.

---

### 4.5 Holiday

```
Holiday {
  date: ISODate
  description: string
  is_recurring: boolean
}
```

Holidays remove sessions from the denominator.

---

## 5. Calculation Engine (Deterministic)

### 5.1 Per-Subject Attendance

```
TotalSessions = count(
  scheduled sessions ≤ today
  excluding holidays
)

AttendedSessions = count(status = present OR od)

Attendance% = (AttendedSessions / TotalSessions) × 100
```

If `TotalSessions = 0`, attendance defaults to **100%**.

---

### 5.2 Overall Attendance

```
Overall% = average(Attendance% of all subjects, including VAC)
```

No weighting by credits.

---

### 5.3 OD Hours Calculation

```
ODHoursUsed = sum(duration_hours of timetable slots where status = 'od')
Remaining = 72 − ODHoursUsed
```

* OD hours are **derived**, never stored.
* Missing slot duration defaults to 1.0 hour.

---

### 5.4 Safe Margin Calculator

```
FutureSessions = count(future scheduled sessions until last_instruction_date)
ProjectedTotal = CurrentTotal + FutureSessions

MinRequired = ceil(ProjectedTotal × 0.75)
MustAttend = max(0, MinRequired − AttendedSessions)
CanSkip = floor(FutureSessions − MustAttend)
```

All values must be non-negative integers.

---

## 6. Leave Impact Simulator

Simulation logic:

1. Select date range
2. Enumerate affected sessions
3. Assume all affected sessions = leave
4. Recalculate attendance percentages
5. Flag any subject <75% or overall <80%

Simulation **must not mutate stored data**.

---

## 7. UI Contracts (Behavioral)

### 7.1 Color Thresholds

**Overall:**

* ≥82% → Green
* 80–82% → Yellow
* <80% → Red

**Per-subject:**

* ≥77% → Green
* 75–77% → Yellow
* <75% → Red

---

### 7.2 Daily Logging Screen

* Load today’s date by default
* Show 7 scheduled periods
* Actions: [OD], [Leave]
* No action = Present
* Bulk: Mark full day as Leave
* Retroactive edits allowed

Target time: **≤30 seconds/day**.

---

## 8. Non-Functional Requirements

* All calculations <100ms
* Pure functions for business logic
* Offline-first behavior supported
* No silent failure states

---

## 9. Acceptance Criteria

Phase 1 is complete when:

* User can answer “Am I safe for exams?” in <5 seconds
* Attendance matches manual calculation
* Alerts trigger at 77%, 80%, 82% exactly
* OD hours derived correctly
* App works offline
* Core logic has 100% unit test coverage

---

## 10. Change Control

Any change to:

* Thresholds
* Calculation formulas
* Status semantics
* Data models

**must be reflected here first**.

Code follows SPEC — never the reverse.

---

*End of SPEC*
