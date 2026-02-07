# Personal ERP Attendance Tracker - Project Status Document

**Version:** 1.3.0  
**Last Updated:** February 8, 2026  
**Status:** Production Ready

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Features Implemented](#features-implemented)
5. [Data Models](#data-models)
6. [Calculation Logic](#calculation-logic)
7. [Components Breakdown](#components-breakdown)
8. [Known Limitations](#known-limitations)
9. [Potential Improvements](#potential-improvements)

---

## 🎯 Project Overview

A comprehensive Next.js application for college students to track semester attendance, manage leave impact, and maintain the required **75% per-subject** and **80% overall** attendance thresholds.

### Core Purpose

- Track daily attendance across multiple subjects
- Simulate leave impact before taking time off
- Calculate safe margins for skipping classes
- Track On-Duty (OD) hours (max 72 per semester)
- Manage semester configuration, holidays, and CAT exam periods

---

## 🛠 Tech Stack

| Category      | Technology           | Version     |
| ------------- | -------------------- | ----------- |
| Framework     | Next.js (App Router) | 16.1.6      |
| Language      | TypeScript           | 5.3.x       |
| UI            | React                | 18.2.x      |
| Styling       | Tailwind CSS         | 3.3.x       |
| Date Handling | date-fns             | 2.30.x      |
| Forms         | react-hook-form      | 7.48.x      |
| Charts        | Recharts             | 2.15.x      |
| Storage       | localStorage         | Browser API |

---

## 🏗 Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard (home)
│   ├── layout.tsx         # Root layout with navigation
│   ├── globals.css        # Global styles + Tailwind
│   ├── attendance/        # Attendance logging page
│   ├── planner/           # Planning tools page
│   └── settings/          # Configuration page
├── components/            # React components
│   ├── AttendanceChart.tsx
│   ├── AttendanceLogger.tsx
│   ├── DashboardCard.tsx
│   ├── LeaveSimulator.tsx
│   ├── Navigation.tsx
│   ├── OdTracker.tsx
│   ├── SafeMarginCalculator.tsx
│   ├── SemesterConfigManager.tsx
│   ├── SubjectDetailModal.tsx
│   ├── SubjectsManager.tsx
│   ├── ThemeProvider.tsx
│   └── TimetableBuilder.tsx
├── hooks/
│   └── useAttendanceData.ts  # Main data hook
├── lib/
│   ├── calculations.ts       # All calculation logic
│   ├── constants.ts          # App constants
│   ├── sampleData.ts         # Initial sample data
│   └── storage.ts            # localStorage utilities
└── types/
    └── index.ts              # TypeScript definitions
```

### Data Flow

```
localStorage ─► loadAppData() ─► useAttendanceData() ─► Components
                                       │
                                       ▼
                              saveAppData() ─► localStorage
```

---

## ✅ Features Implemented

### 1. Dashboard (`/`)

- **Overall attendance percentage** with color-coded status
- **Subject-wise attendance cards** with quick stats
- **Attendance chart** (Recharts bar chart)
- **Quick stats**: Total sessions, attended, OD used/remaining
- **Subject detail modal** showing class-by-class history
- **Dark mode support**

### 2. Attendance Logging (`/attendance`)

- **Date picker** with navigation (prev/next day buttons)
- **Timetable-based period display** for selected day
- **Three attendance statuses**: Present (default), Leave, OD
- **OD reason capture** with modal
- **Holiday detection** - Shows message if date is a holiday
- **Semester bounds detection** - Warns if outside semester dates
- **CAT exam period detection** - No classes during exams
- **Auto-save** to localStorage

### 3. Planning Tools (`/planner`)

#### Leave Simulator

- **Single day leave checkbox** - Quick toggle for single-day leaves
- **Date range selection** with start/end dates
- **Schedule preview** showing classes that would be missed
- **Impact calculation** showing projected attendance drop
- **Per-subject impact** highlighting subjects at risk
- **Holiday/CAT awareness** - Excludes non-class days from calculation

#### OD Tracker

- **Visual progress bar** showing OD hours used (out of 72)
- **Detailed history** with expandable list
- **Grouped by date** for easy review

#### Safe Margin Calculator

- **Per-subject breakdown** showing:
  - Future sessions remaining
  - Must attend count
  - Can safely skip count
- **Projected totals** and minimum requirements
- Educational disclaimer encouraging attendance

### 4. Settings (`/settings`)

#### Subjects Manager

- **Add/edit/delete subjects**
- **Credit options**: 0, 1.5, 2, 3, 4 credits
- **Subject types**:
  - Regular subjects (with code)
  - Labs (1.5 credits, 3 consecutive periods = 1 session)
  - Zero-credit types: Library, Seminar, VAC
- **Unique color coding** per subject (20 colors)

#### Timetable Builder

- **Drag-and-drop** interface for desktop
- **Tap-to-select** mode for mobile devices
- **7 periods × 6 days** grid (Mon-Sat)
- **Fixed period timings** (08:30 - 15:15)
- **Lab handling** - Auto-fills 3 consecutive periods
- **VAC handling** - Auto-fills 2 consecutive periods
- **Clear individual slots** or entire subject

#### Semester Configuration

- **Semester dates**: Start, End, Last instruction date
- **Holiday management**: Add/delete holidays
- **CAT exam periods**: Multiple CAT periods with date ranges

### 5. Theme Support

- **Dark mode toggle** in navigation
- **System preference detection**
- **Persistent preference** in localStorage

---

## 📊 Data Models

### Subject

```typescript
interface Subject {
  subject_code?: string; // Optional for Library/Seminar
  subject_name: string;
  credits: 0 | 1.5 | 2 | 3 | 4;
  zero_credit_type?: "library" | "seminar" | "vac";
}
```

### TimetableSlot

```typescript
interface TimetableSlot {
  id: string;
  day_of_week:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday";
  period_number: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  subject_code?: string;
  start_time: string; // HH:mm
  end_time: string; // HH:mm
}
```

### AttendanceLog

```typescript
interface AttendanceLog {
  id: string;
  date: string; // ISO date
  period_number: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  subject_code?: string;
  status: "present" | "od" | "leave";
  notes?: string; // OD reason
}
```

### SemesterConfig

```typescript
interface SemesterConfig {
  start_date: string;
  end_date: string;
  last_instruction_date: string;
  cat_periods?: CATExamPeriod[];
}

interface CATExamPeriod {
  id: string;
  name: string; // e.g., "CAT 1", "CAT 2"
  start_date: string;
  end_date: string;
}
```

### Holiday

```typescript
interface Holiday {
  date: string;
  description: string;
}
```

---

## 🧮 Calculation Logic

### Per-Subject Attendance

```
Attendance% = (Attended Sessions / Total Scheduled Sessions) × 100
```

**Where:**

- **Total Scheduled Sessions** = Count of scheduled classes from semester start to today
  - Excludes: Sundays, holidays, CAT exam periods
  - Labs: 3 periods = 1 session
  - VAC: 2 periods = 1 session
- **Attended Sessions** = Total - Absent (leave) count
  - OD counts as attended
  - Unmarked periods = present (default)

### Overall Attendance (NEW FORMULA)

```
Overall% = (Total Attended Periods / Total Periods) × 100
```

**Note:** This was recently changed from average of percentages to weighted by periods.

### Status Thresholds

| Status           | Per-Subject | Overall |
| ---------------- | ----------- | ------- |
| Safe (Green)     | ≥77%        | ≥82%    |
| Warning (Yellow) | 75-77%      | 80-82%  |
| Danger (Red)     | <75%        | <80%    |

### Safe Margin Calculation

```
Future Sessions = Sessions from tomorrow to semester end
Must Attend = ceil(Projected Total × 0.75) - Already Attended
Can Skip = Future Sessions - Must Attend
```

---

## 🧩 Components Breakdown

### Core Components

| Component               | Purpose                | Key Features                                     |
| ----------------------- | ---------------------- | ------------------------------------------------ |
| `useAttendanceData`     | Central data hook      | CRUD operations, calculations, localStorage sync |
| `AttendanceLogger`      | Log daily attendance   | Status buttons, OD modal, holiday detection      |
| `SubjectDetailModal`    | View class history     | Day-by-day breakdown, status legend              |
| `LeaveSimulator`        | Simulate leave impact  | Date range, single-day mode, impact preview      |
| `SafeMarginCalculator`  | Calculate skip margins | Per-subject breakdown, disclaimer                |
| `OdTracker`             | View OD history        | Progress bar, grouped history                    |
| `SubjectsManager`       | Manage subjects        | Add/edit/delete, credit types                    |
| `TimetableBuilder`      | Build schedule         | Drag-drop, tap-to-select, lab handling           |
| `SemesterConfigManager` | Configure semester     | Dates, holidays, CAT periods                     |
| `AttendanceChart`       | Visualize attendance   | Recharts bar chart                               |
| `DashboardCard`         | Subject card           | Percentage, status, quick stats                  |
| `Navigation`            | App navigation         | Links, theme toggle                              |
| `ThemeProvider`         | Theme management       | Dark mode, system preference                     |

---

## ⚠️ Known Limitations

1. **No Backend/Cloud Sync**
   - All data stored in browser localStorage
   - Data lost if browser storage cleared
   - No cross-device sync

2. **No Export/Import UI**
   - Export/import functions exist in code but no UI
   - Data backup requires manual JSON extraction

3. **No User Authentication**
   - Single user only
   - No multi-user support

4. **Limited Mobile Experience**
   - Timetable builder works via tap-to-select
   - Some tables may overflow on small screens

5. **No Notifications/Reminders**
   - No alerts for low attendance
   - No reminders to log attendance

6. **No PWA Support**
   - Not installable as app
   - No offline support beyond localStorage

7. **Fixed Period Timings**
   - Period times hardcoded (08:30 - 15:15)
   - Cannot customize period durations

8. **No Undo/Redo**
   - Actions are immediate
   - No history tracking

---

## 💡 Potential Improvements

### High Priority

1. **Data Export/Import UI**
   - Add export button to download JSON
   - Add import button to restore from file
   - CSV export for spreadsheets

2. **PWA Support**
   - Service worker for offline access
   - Installable on mobile devices
   - Push notifications

3. **Attendance Trends**
   - Weekly/monthly trend charts
   - Attendance heatmap calendar
   - Subject comparison graphs

4. **Backup & Restore**
   - Automatic localStorage backup
   - One-click restore
   - Export to cloud (optional)

### Medium Priority

5. **Calendar View**
   - Month calendar showing attendance
   - Click date to log/view
   - Holiday highlighting

6. **Smart Suggestions**
   - "You can skip X more classes this week"
   - "Attend next 3 classes to reach 75%"
   - Risk alerts before attendance drops

7. **Multiple Semester Support**
   - Archive past semesters
   - Historical comparison
   - Semester templates

8. **Customizable Period Timings**
   - Edit period start/end times
   - Support different day schedules
   - Lunch break configuration

### Low Priority / Nice-to-Have

9. **Widget/Quick Actions**
   - Quick "mark present" from home screen
   - Today's schedule widget
   - Attendance summary widget

10. **Gamification**
    - Streak tracking (days of 100% attendance)
    - Achievement badges
    - Attendance goals

11. **Analytics Dashboard**
    - Most missed subject
    - Best attendance day of week
    - OD usage patterns

12. **Accessibility Improvements**
    - Screen reader support
    - Keyboard navigation
    - High contrast mode

13. **Localization**
    - Multiple language support
    - Date format preferences
    - Regional calendars

14. **Integration Options**
    - Google Calendar sync
    - iCal export
    - College ERP import (if API available)

---

## 📁 File Reference

| File                                       | Lines | Purpose                     |
| ------------------------------------------ | ----- | --------------------------- |
| `src/lib/calculations.ts`                  | ~387  | All attendance calculations |
| `src/hooks/useAttendanceData.ts`           | ~378  | Main data management hook   |
| `src/components/TimetableBuilder.tsx`      | ~625  | Timetable UI                |
| `src/components/AttendanceLogger.tsx`      | ~500  | Attendance logging UI       |
| `src/components/LeaveSimulator.tsx`        | ~476  | Leave simulation            |
| `src/components/SubjectsManager.tsx`       | ~375  | Subject management          |
| `src/app/settings/page.tsx`                | ~362  | Settings page               |
| `src/app/page.tsx`                         | ~355  | Dashboard                   |
| `src/components/SemesterConfigManager.tsx` | ~286  | Semester config             |
| `src/app/attendance/page.tsx`              | ~286  | Attendance page             |
| `src/components/SubjectDetailModal.tsx`    | ~260  | Subject history modal       |
| `src/components/OdTracker.tsx`             | ~247  | OD tracking                 |
| `src/app/planner/page.tsx`                 | ~231  | Planning tools page         |
| `src/components/SafeMarginCalculator.tsx`  | ~158  | Safe margin calc            |

---

## 🔧 Recent Changes

1. **Overall Attendance Formula** - Changed from average of percentages to attended/total periods
2. **Single Day Leave Checkbox** - Added to Leave Simulator
3. **Mobile Tap-to-Select** - Added for TimetableBuilder
4. **Invalid Date Guards** - Fixed production crashes from empty dates
5. **2 Credits Option** - Added as valid credit type
6. **Dark Mode** - Full dark mode support
7. **OD Tracking** - Complete OD management with history
8. **CAT Exam Periods** - Exclude exam periods from attendance calculation

---

_This document serves as a comprehensive reference for the current state of the project. Use it to identify areas for improvement and plan future development._
