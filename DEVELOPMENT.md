# College ERP Attendance Tracker

A modern, spec-compliant attendance tracking system built with Next.js, React, and TypeScript.

## ✅ Features Implemented

### 1. **Dashboard** (/)

- Overall attendance percentage with live calculation
- Per-subject attendance cards with color-coded status
- OD hours tracking (used/remaining out of 72 hours)
- Quick access to logging and planning tools
- Semester date information display

### 2. **Attendance Logging** (/attendance)

- Log attendance for any date
- Period-by-period status marking:
  - **✓ Present**: Default state (no action needed)
  - **✗ Leave**: Counts as absent
  - **⚡ OD**: On-duty (auto-approved, counts as present)
- Bulk "Mark Full Day as Leave" action
- Quick "Today" button for fast access
- Automatic local storage persistence

### 3. **Planner & Simulation** (/planner)

- **Leave Impact Simulator**: Test date ranges and see attendance impact
- **OD Hours Tracker**: Visual display of OD usage with warnings
- **Safe Margin Calculator**: Shows how many sessions you can safely skip
- Semester information display

### 4. **Core Features**

- ✅ Spec-compliant calculation engine
- ✅ Color-coded status (Green/Yellow/Red)
- ✅ Offline-first with localStorage persistence
- ✅ Type-safe with full TypeScript coverage
- ✅ Sample data pre-loaded for testing

## 📊 Color Thresholds (SPEC 7.1)

| Metric          | Safe (Green) | Warning (Yellow) | Danger (Red) |
| --------------- | ------------ | ---------------- | ------------ |
| **Overall**     | ≥82%         | 80-82%           | <80%         |
| **Per-Subject** | ≥77%         | 75-77%           | <75%         |

## 📋 Technical Stack

- **Frontend**: Next.js 16, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Storage**: localStorage (offline-first)
- **State Management**: React hooks + custom `useAttendanceData`
- **Calculations**: Pure functions per spec

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Navigation & layout
│   ├── page.tsx                # Dashboard
│   ├── attendance/page.tsx      # Attendance logger
│   ├── planner/page.tsx         # Planning tools
│   └── globals.css
├── components/
│   ├── AttendanceLogger.tsx     # Daily logging UI
│   ├── DashboardCard.tsx        # Subject stats card
│   ├── LeaveSimulator.tsx       # Leave impact simulation
│   ├── OdTracker.tsx            # OD hours display
│   └── SafeMarginCalculator.tsx # Safe skip calculator
├── hooks/
│   └── useAttendanceData.ts     # Core state management
├── lib/
│   ├── calculations.ts          # SPEC calculation engine
│   ├── constants.ts             # Thresholds & config
│   ├── sampleData.ts            # Test data
│   └── storage.ts               # localStorage layer
└── types/
    └── index.ts                 # TypeScript interfaces
```

## 🎯 Calculation Engine (SPEC Section 5)

### Per-Subject Attendance (5.1)

```
Attended = Count(status = 'present' OR 'od')
Total = Count(all sessions ≤ today)
Percentage = (Attended / Total) × 100
```

### Overall Attendance (5.2)

```
Overall% = Average(all subject percentages)
No weighting by credits
```

### OD Hours (5.3)

```
Used = Sum(duration_hours where status = 'od')
Remaining = 72 - Used
```

### Safe Margin (5.4)

```
Future = Count(scheduled sessions until last_instruction_date)
Projected = Current + Future
MinRequired = Ceiling(Projected × 0.75)
MustAttend = Max(0, MinRequired - CurrentAttended)
CanSkip = Floor(Future - MustAttend)
```

## 🚀 Getting Started

### Install & Run

```bash
cd c:\Users\anany\Desktop\personal-erp-tracker
npm install
npm run dev
```

Visit `http://localhost:3000`

### Sample Data Included

- **4 Subjects**: Data Structures, Web Development, Database Systems, Operating Systems
- **8 Timetable Slots**: MWF and TTh schedule
- **4 Holidays**: Republic Day, Maha Shivaratri, Holi, Ambedkar Jayanti
- **Semester**: Jan 5 - May 30, 2026

## 📝 Data Persistence

All data is stored in browser's localStorage:

- `attendance_subjects`
- `attendance_timetable`
- `attendance_logs`
- `attendance_holidays`
- `attendance_semester_config`

**Offline-first**: Works completely offline. Changes sync to storage automatically.

## ✨ Key Behaviors Per Spec

| Behavior               | Implementation                   |
| ---------------------- | -------------------------------- |
| Default attendance     | Present (no action needed)       |
| OD approval            | Auto-approved (immediate)        |
| OD limit blocking      | Informational only (no blocking) |
| Leave status           | Counts as absent                 |
| Holiday impact         | Excluded from denominator        |
| Retroactive entries    | Fully supported                  |
| Partial lab attendance | Counts as one session            |

## 🎨 UI/UX Highlights

- **Fast to Log**: Target <30 seconds/day (per spec 7.2)
- **Color Coded**: Instant visual status
- **Mobile Responsive**: Works on all devices
- **Intuitive Buttons**: Clear action labels
- **Info Boxes**: Educational tips throughout
- **Fast Calculations**: <100ms (per spec 8)

## 🧪 Testing

The app comes with sample data pre-loaded. You can:

1. **Test Dashboard**: View overall and per-subject stats
2. **Log Attendance**: Mark today's or past dates
3. **Simulate Leave**: See impact of taking leave
4. **Check Safe Margin**: See how many sessions you can skip
5. **Track OD**: Monitor OD hours usage

No server required—everything runs locally.

## 📚 Spec Compliance

This implementation strictly follows [docs/specs.md](docs/specs.md):

- ✅ All formulas from Section 5
- ✅ All status codes from Section 2.3
- ✅ All thresholds from Section 1 & 7
- ✅ All data models from Section 4
- ✅ Non-functional requirements met
- ✅ 100% TypeScript type safety

## 🔮 Future Enhancements

- Database integration (replace localStorage)
- User authentication
- Multi-semester support
- Exam eligibility certificates
- Email notifications
- Export to PDF
- Dark mode

---

**Version**: 1.0.0  
**Last Updated**: Jan 31, 2026  
**Status**: Development Ready
