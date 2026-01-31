# College Attendance Tracking System

**Document Type:** Product Requirements Document (PRD)
**Version:** 1.0
**Date:** January 29, 2026
**Intended Audience:** Personal Use / Development Reference

---

## 1. Executive Summary

This document specifies the requirements for a **personal attendance tracking web application** designed to overcome limitations of the existing college ERP system. The core problem is the lack of real-time visibility into attendance, On-Duty (OD) hour usage, and the inability to forecast the impact of planned absences before exam eligibility deadlines.

The system enables **manual attendance logging**, **real-time percentage calculations**, and **predictive planning tools** to ensure compliance with attendance policies.

---

## 2. Problem Statement

Current college ERP limitations:

* Attendance data updates only days before exams, creating visibility gaps
* No mechanism to track OD hours against the 72-hour semester limit
* No way to simulate the impact of planned leaves in advance
* High risk of violating minimum attendance policy (75% per subject and overall)

---

## 3. Solution Overview

A lightweight, single-user web application that provides:

* Manual tracking of attendance, OD hours, and leaves
* Real-time per-subject and overall attendance percentages
* Forecasting tools to evaluate leave impact and safe absence margins
* Visual alerts for attendance risk

---

## 4. Project Scope

### 4.1 In Scope

* Single-user personal attendance tracking
* Manual entry of timetable, attendance, OD hours, and leaves
* Real-time attendance calculations
* Leave impact simulation
* OD hours tracking against a 72-hour limit

### 4.2 Out of Scope

* Multi-user support or authentication
* Integration with college ERP or APIs
* Automated timetable import (CSV deferred)
* Institutional scalability features
* Mobile application (web-only for MVP)

### 4.3 Future Considerations

* Cloud sync (Supabase)
* PWA/mobile support
* Historical analytics
* Multi-user support with configurable policies

---

## 5. System Architecture

### 5.1 Technical Stack

| Component     | Technology                                  |
| ------------- | ------------------------------------------- |
| Frontend      | Next.js 14 (App Router), React              |
| UI            | Tailwind CSS, shadcn/ui                     |
| Storage       | localStorage (Phase 1), Supabase (Phase 2+) |
| Date Handling | date-fns                                    |
| Forms         | react-hook-form                             |
| Visualization | Recharts                                    |

---

## 6. Data Model

### 6.1 Subjects

* `subject_code` (string, PK)
* `subject_name` (string)
* `credits` (integer: 3 or 4)

### 6.2 Timetable

* `id` (auto)
* `day_of_week` (enum: Monday–Friday)
* `period_number` (1–7)
* `subject_code` (FK)
* `start_time` (time)
* `end_time` (time)

### 6.3 Attendance Log

* `id` (auto)
* `date` (date)
* `period_number` (1–7)
* `subject_code` (FK)
* `status` (present | absent | od)
* `notes` (optional)

### 6.4 Holidays

* `date` (PK)
* `description`

### 6.5 OD Log

* `id` (auto)
* `date`
* `hours_used` (float)
* `reason`
* `approval_status` (pending | approved | rejected)

---

## 7. Functional Requirements

### 7.1 Attendance Calculation Logic

#### 7.1.1 Per-Subject

```
Total Classes Held = timetable slots where date ≤ today AND not a holiday
Attendance % = (present + od) / total × 100
```

#### 7.1.2 Overall

```
Overall % = sum(present + od across subjects) / sum(total held) × 100
```

#### 7.1.3 Policy Thresholds

* Minimum per-subject attendance: **75%**
* Minimum overall attendance: **75%**

#### 7.1.4 OD & Leave Handling

* OD counts as present for attendance
* Full-day leave marks all 7 periods absent
* OD hours tracked separately from attendance

---

## 8. Feature Phases

### Phase 1: Core MVP (Week 1)

* Semester timetable setup (35 slots)
* Daily attendance marking UI
* Per-subject and overall attendance dashboard

### Phase 2: Planning Tools (Week 2)

* Safe absence margin calculator
* Leave impact simulator
* OD hour usage tracker
* Risk alerts

### Phase 3: Polish (Week 3)

* Calendar heatmap
* CSV/PDF export
* Attendance trend graphs

---

## 9. Safe Absence Calculator

```
weeks_left = (semester_end - today) / 7
future_classes = credits × weeks_left
min_required = 0.75 × projected_total
can_skip = future_classes - (min_required - current_present)
```

Example:

> DBMS: 12 remaining classes → Must attend ≥7 → Can skip ≤5

---

## 10. Leave Impact Simulator

Workflow:

1. Select leave date range
2. Retrieve affected timetable slots
3. Recalculate attendance assuming absences
4. Highlight subjects dropping below threshold

---

## 11. UI Requirements

### Daily Logging

* Shows current day schedule
* Toggle: Present / Absent / OD
* Bulk actions for full-day leave or partial OD

### Dashboard

* Overall attendance %
* Per-subject cards with color coding
* Safe margin indicators
* OD usage progress bar

### Color Coding

| Status  | Range  | Color  |
| ------- | ------ | ------ |
| Safe    | >80%   | Green  |
| Caution | 75–80% | Yellow |
| Danger  | <75%   | Red    |

---

## 12. Non-Functional Requirements

* Dashboard calculations <100ms
* Leave simulation <200ms
* Versioned localStorage schema
* JSON export/import for backups
* Desktop-first responsive UI (≥1280px)

---

## 13. Edge Cases & Constraints

* Manual handling of cancelled classes
* Static timetable assumption
* No automatic semester rollover
* OD limit informational only

---

## 14. Success Criteria

* Real-time attendance visibility
* Accurate calculations vs manual checks
* Zero surprise exam eligibility violations

---

## 15. Development Timeline

| Phase   | Duration | Deliverables       |
| ------- | -------- | ------------------ |
| Phase 1 | Week 1   | Core MVP           |
| Phase 2 | Week 2   | Planning tools     |
| Phase 3 | Week 3   | Polish & analytics |

---

## 16. Risks & Mitigation

| Risk                 | Mitigation                      |
| -------------------- | ------------------------------- |
| Missed logging       | Quick entry + retroactive edits |
| Data loss            | JSON backups + cloud sync       |
| Calculation mismatch | Pure functions + tests          |

---

## 17. Conclusion

This PRD defines a focused, developer-centric solution for eliminating attendance uncertainty. Success is measured by **predictability, accuracy, and decision support**, not feature volume.

---

*End of Document*
