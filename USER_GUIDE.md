# 🎓 Complete App Features & User Guide

## Application Overview

**College Attendance Tracking System** - A personal attendance tracker that helps you stay above your college's minimum attendance requirements.

**Live at**: http://localhost:3000  
**Tech Stack**: Next.js 14 + React 18 + TypeScript + Tailwind CSS  
**Storage**: Browser localStorage (no backend needed)  
**Offline**: Fully functional offline

---

## Core Features

### 1. 📊 Dashboard (`/`)

**Purpose**: View your overall attendance status and per-subject breakdown

**What You See**:

- **Overall Attendance %**: Flat average across all subjects
- **OD Hours**: Used vs. remaining (72-hour limit)
- **Per-Subject Cards**: Each subject shows:
  - Subject code and name
  - Attendance percentage
  - Sessions attended/total
  - Status: 🟢 Safe (≥82%) | 🟡 Warning (80-82%) | 🔴 Danger (<80%)
- **Quick Action Links**: Navigate to logging, planning tools

**Color Thresholds** (from spec):
| Overall | Per-Subject | Status |
|---------|-------------|--------|
| ≥82% | ≥77% | 🟢 Safe |
| 80-82% | 75-77% | 🟡 Warning |
| <80% | <75% | 🔴 Danger |

**Data Updates**:

- Automatically recalculates when you log attendance
- Includes holidays (excluded from denominator)
- Considers OD as "present" for percentage

---

### 2. 📋 Log Attendance (`/attendance`)

**Purpose**: Mark your attendance for any date

**How It Works**:

1. **Select Date**: Pick today or any past date
2. **View Timetable**: Shows all scheduled classes for that day
3. **Mark Attendance**: For each class, choose:
   - ✓ **Present** (default) - You attended
   - ✗ **Leave** - You were absent (counts against you)
   - ⚡ **OD** (On-Duty) - Auto-approved absence (counts as present)
4. **Bulk Action**: "Mark Full Day as Leave" to mark all classes

**Smart Features**:

- Period-level granularity (mark individual classes)
- Retroactive entry allowed (log past attendance anytime)
- Auto-saves to localStorage
- Only deviations from "present" need to be logged

**Example Workflow**:

```
Nov 15, 2026:
- Period 1 (CS101): Present ✓
- Period 2 (CS102): OD ⚡
- Period 3 (CS103): Leave ✗
→ Auto-saves, dashboard updates instantly
```

---

### 3. 📅 Planner (`/planner`)

**Purpose**: Plan ahead and test scenarios

**Left Column: Leave Impact Simulator**

- Select date range (e.g., Nov 20-25)
- Check which subjects you plan to skip
- Click "Simulate"
- See immediate impact:
  - New percentage for each subject
  - New overall percentage
  - 🔴 Warnings if dropping below thresholds
  - **Doesn't actually log** - just shows what-if

**Right Column: OD Hours Tracker**

- Shows used/remaining from 72-hour limit
- Visual progress bar:
  - 🟢 Green: <70% used (plenty of room)
  - 🟡 Yellow: 70-90% used (careful)
  - 🔴 Red: >90% used (almost over)
- Total OD hours calculated from sessions marked as OD

**Right Column: Safe Margin Calculator**

- For each subject, shows:
  - Future sessions until semester end
  - Sessions you **must attend** to stay ≥75%
  - Sessions you **can safely skip**
- Color coded by risk level
- Per-subject breakdown

**Use Cases**:

```
"Can I take 5 days off for my cousin's wedding?"
→ Simulate Nov 20-25 → See if you stay above 75% in each subject

"How many more OD hours can I use?"
→ OD Tracker shows 15 hours remaining

"I have 35 sessions left. How many can I skip?"
→ Safe Margin shows: must attend 26, can skip 9
```

---

### 4. ⚙️ Settings (`/settings`)

**Purpose**: Configure your subjects, timetable, and semester

#### Subjects Tab

- **Add**: Subject code, name, credits
- **Edit**: Inline editing of all fields
- **Delete**: Remove subjects (removes related data)
- **Credits**: 3 or 4 (informational, doesn't affect calculations)

#### Timetable Tab

- **5-day schedule**: Monday-Friday
- **7 periods per day**: Customizable times
- **Add Slots**:
  - Select day, period, subject, start/end times
  - Duration auto-calculated
  - Click "Add" to add to grid
- **Drag & Drop**: Click and drag classes to new day/period
- **Delete**: Click × button on a class card
- **Visual Grid**: Color-coded by subject

#### Semester & Holidays Tab

- **Semester Dates**:
  - Start date: First day
  - End date: Last day
  - Last instruction: Last day before exams
- **Holidays**:
  - Add by date and description
  - Excluded from attendance calculations
  - Common: Republic Day, Holi, Independence Day, etc.

**Example Setup** (5 subjects, 18 classes/week):

```
Subjects:
- CS101: Data Structures (4 credits)
- CS102: Web Development (4 credits)
- PHYS201: Mechanics (3 credits)
- MATH101: Calculus (4 credits)
- ENG101: English (3 credits)

Timetable (3+2 pattern):
- Mon 9-10: CS101
- Tue 9-10: PHYS201
- Wed 9-10: CS101
- Thu 9-10: PHYS201
- Fri 9-10: CS101
... (and 13 more slots)

Holidays: 8-10 throughout semester
Semester: Jan 5 - May 30
```

---

## Calculation Engine (SPEC Compliance)

### Attendance Percentage (Section 5.1)

```
Per-Subject % = (Sessions Attended) / (Total Sessions) * 100

Attended = present + od (not leave, not cancelled)
Excluded = holidays (don't count in denominator)
Default = 100% if zero sessions (safety)
```

### Overall Attendance (Section 5.2)

```
Overall % = Average of all subject percentages

NOT weighted by credits
Simple flat average
```

### OD Hours (Section 5.3)

```
OD Hours Used = Sum of duration_hours for sessions marked 'od'
OD Limit = 72 hours per semester (informational only, no blocking)
```

### Safe Margin (Section 5.4)

```
Must Attend = Sessions needed to maintain 75% per subject
Can Skip = Total Sessions - Must Attend
Calculation = Future sessions - (required to hit 75%)
```

### Status Assignment (Section 7.1)

```
Overall:  ≥82% = Safe, 80-82% = Warning, <80% = Danger
Per-Subject: ≥77% = Safe, 75-77% = Warning, <75% = Danger
```

---

## Data Model (What Gets Stored)

### AppData Structure

```typescript
{
  subjects: [
    { code: "CS101", name: "Data Structures", credits: 4 },
    ...
  ],
  timetable: [
    { id: "Mon-1", day: "Monday", period: 1, subject: "CS101",
      start_time: "09:00", end_time: "10:00", duration_hours: 1.0 },
    ...
  ],
  attendance: [
    { date: "2026-01-15", period: 1, subject: "CS101", status: "present" },
    ...
  ],
  holidays: [
    { date: "2026-01-26", description: "Republic Day" },
    ...
  ],
  semester_config: {
    start_date: "2026-01-05",
    end_date: "2026-05-30",
    last_instruction_date: "2026-05-15"
  }
}
```

All stored in localStorage, survives browser refresh, works offline.

---

## User Workflows

### Workflow 1: First-Time Setup (15 minutes)

```
1. Go to Settings → Subjects
2. Add your 4-5 subjects
3. Go to Settings → Timetable
4. Add your class slots for the week
5. Go to Settings → Semester
6. Set semester dates and holidays
7. Go to Dashboard
8. You're ready to log!
```

### Workflow 2: Daily Logging (2 minutes)

```
1. Open the app
2. Go to Log Attendance
3. Today's date is pre-selected
4. Mark each class: Present/Leave/OD
5. Dashboard auto-updates
6. Done! (Changes saved automatically)
```

### Workflow 3: Weekly Planning (5 minutes)

```
1. Go to Planner
2. Leave Simulator: Test a date range
3. OD Tracker: Check remaining hours
4. Safe Margin: See how many you can skip
5. Plan your week accordingly
```

### Workflow 4: Adjust Schedule (varies)

```
1. Go to Settings
2. Click on Subjects/Timetable/Semester tabs
3. Make changes (add, edit, delete)
4. Go back to Dashboard
5. Stats automatically recalculate
```

---

## Browser DevTools Integration

### View Stored Data

1. Open DevTools (F12)
2. Go to **Application → Local Storage**
3. Look for `attendance_*` keys:
   - `attendance_subjects`
   - `attendance_timetable`
   - `attendance_logs`
   - `attendance_holidays`
   - `attendance_semester_config`

### Clear Data (Hard Reset)

1. DevTools → Local Storage
2. Delete all `attendance_*` keys
3. Refresh page
4. App resets to fresh state with sample data

### Debug Calculations

1. DevTools → Console
2. No errors should appear during normal use
3. If issues: check that all subjects have codes, holidays are valid dates

---

## FAQ

### Q: Is my data safe?

**A**: Data stored in browser localStorage is private to your computer/browser. Nobody else can see it.

### Q: Will my data disappear?

**A**: No. It persists until you manually clear it. Closing the browser/tab doesn't affect it.

### Q: Can I use this on mobile?

**A**: Yes! The app is fully responsive. Works on phones, tablets, desktops.

### Q: What if I make a mistake?

**A**: All entries can be edited or deleted. Go to Log Attendance and change the date's entry.

### Q: How many subjects/classes can I add?

**A**: Unlimited! You can have any number of subjects and timetable slots.

### Q: Do credits affect my percentage?

**A**: No. Percentages are flat averages. Credits are informational only.

### Q: What happens on Saturday?

**A**: Saturdays default to holidays (no classes). You can add classes explicitly if needed.

### Q: Can I log attendance for past dates?

**A**: Yes! Go to Log Attendance, pick any date from the semester, and mark it.

### Q: Does the app work offline?

**A**: Yes! It's 100% offline. No internet connection required.

### Q: What about exam day?

**A**: The app tracks until the semester end date. After that, no more logging is meaningful.

---

## Keyboard Shortcuts

| Shortcut       | Action                  |
| -------------- | ----------------------- |
| `Cmd/Ctrl + R` | Refresh dashboard       |
| `Tab`          | Navigate between inputs |
| `Enter`        | Submit forms            |

---

## Version & Support

**Version**: 1.0.0 Final  
**Last Updated**: January 31, 2026  
**Framework**: Next.js 14  
**Browser Support**: Chrome, Firefox, Safari, Edge (all modern versions)

### Known Limitations

- ❌ No automatic sync across devices (localStorage is device-local)
- ❌ No backend integration (designed to work offline)
- ❌ No email notifications
- ❌ No PDF export (future enhancement)

### Future Enhancements

- 🔮 Cloud sync option
- 🔮 Export to PDF/Excel
- 🔮 Exam eligibility certificates
- 🔮 Peer comparison (anonymized)
- 🔮 Mobile app (React Native)
- 🔮 Smart notifications

---

## Emergency Reset

If anything breaks:

```bash
1. Press F12 to open DevTools
2. Application → Local Storage → Delete all attendance_* keys
3. Refresh (F5)
4. App resets with fresh sample data
```

---

**Ready to track attendance? Go to http://localhost:3000 and start!**
