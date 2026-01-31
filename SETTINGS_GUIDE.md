# 📋 Settings & Configuration Guide

## Overview

The **Settings** page (`/settings`) is where you manage the core structure of your attendance tracking system:

1. **Subjects** - Add, edit, and delete subjects
2. **Timetable** - Build your weekly schedule with drag-and-drop
3. **Semester & Holidays** - Configure dates and holidays

---

## 1. Subjects Management

### Add a Subject

1. Go to **Settings → 📚 Subjects** tab
2. Fill in the form fields:
   - **Subject Code**: Unique identifier (e.g., `CS101`, `MATH201`)
   - **Subject Name**: Full name (e.g., "Data Structures")
   - **Credits**: 3 or 4 (informational only, doesn't affect calculations)
3. Click **Add Subject**

### Edit a Subject

1. In the subjects table, modify the fields directly:
   - Click on the name to change it
   - Select a different credit value from the dropdown
2. Changes save automatically to localStorage

### Delete a Subject

1. Click the **Delete** button in the Actions column
2. Confirm the deletion
3. ⚠️ **Warning**: Deleting a subject also removes all related timetable slots and attendance logs

---

## 2. Timetable Builder

### Structure

- **5 Working Days**: Monday through Friday
- **7 Periods per Day**: Periods 1-7 (customizable times)
- **Saturday**: Defaults to holiday unless you explicitly add classes

### Add a Class Slot

1. Go to **Settings → 📅 Timetable** tab
2. Fill in the form:
   - **Day**: Select day of the week
   - **Period**: Select period number (1-7)
   - **Subject**: Choose from your subjects
   - **Start Time**: HH:mm format (e.g., 09:00)
   - **End Time**: HH:mm format (e.g., 10:00)
3. Click **Add**

### Move a Class (Drag & Drop)

1. Click on a class card in the timetable grid
2. Drag it to a different day/period
3. Drop it in the target cell
4. Changes save automatically

### Delete a Class

1. Click the **×** button on the class card
2. It's immediately removed from the timetable

### Example: MWF + TTh Schedule

For a typical 3+2 class schedule:

| Day       | Period | Subject Code | Time        |
| --------- | ------ | ------------ | ----------- |
| Monday    | 1      | CS101        | 09:00-10:00 |
| Tuesday   | 1      | CS102        | 09:00-10:00 |
| Wednesday | 1      | CS101        | 09:00-10:00 |
| Thursday  | 1      | CS102        | 09:00-10:00 |
| Friday    | 1      | CS101        | 09:00-10:00 |

### Duration Calculation

- Duration is automatically calculated from start/end times
- Used for OD hour calculations (spec 5.3)
- Example: 09:00 to 10:00 = 1.0 hour

---

## 3. Semester Configuration

### Set Semester Dates

1. Go to **Settings → 🎓 Semester & Holidays** tab
2. Configure:
   - **Semester Start Date**: First day of semester
   - **Semester End Date**: Last day of semester
   - **Last Instruction Date**: Last day of regular classes (before exams)

**Impact**: These dates define the attendance period. Dates outside this range cannot have attendance logged.

### Add Holidays

1. Fill in the form:
   - **Date**: Holiday date (ISO format)
   - **Description**: Name of the holiday (e.g., "Republic Day", "Holi")
2. Click **Add Holiday**

### Holiday Effects

- **Excluded from denominator**: Holiday dates don't count in attendance calculations
- **No classes expected**: Students don't need to be present
- **Automatic Saturdays**: Saturdays default to holidays unless you add classes

### Common Indian Holidays (2026)

- January 26 - Republic Day
- March 16 - Holi
- August 15 - Independence Day
- October 2 - Gandhi Jayanti

---

## Dashboard

The **Settings** page shows a quick stats dashboard at the bottom:

| Stat            | Shows                        |
| --------------- | ---------------------------- |
| 📚 Subjects     | Count of configured subjects |
| 📅 Classes/Week | Count of timetable slots     |
| 🏖️ Holidays     | Count of holidays            |
| 🎓 Semester     | Date range                   |

---

## Data Persistence

All changes are automatically saved to **browser localStorage**:

- `attendance_subjects`
- `attendance_timetable`
- `attendance_logs`
- `attendance_holidays`
- `attendance_semester_config`

### Clear All Data

To reset everything to defaults:

1. Open browser DevTools (F12)
2. Go to **Application → Local Storage**
3. Delete all `attendance_*` keys
4. Refresh the page

---

## Workflow: Setting Up Your First Timetable

### Step 1: Add Subjects (2 min)

```
CS101: Data Structures (3 credits)
CS102: Web Development (4 credits)
CS103: Database Systems (3 credits)
MATH101: Discrete Math (4 credits)
```

### Step 2: Set Semester Dates (1 min)

- Start: January 5, 2026
- End: May 30, 2026
- Last Instruction: May 15, 2026

### Step 3: Add Holidays (2 min)

- January 26 - Republic Day
- March 13 - Holi
- Others as applicable

### Step 4: Build Timetable (10 min)

- Add classes for each subject
- MWF schedule for some, TTh for others
- Mix of 1-hour and 2-hour slots
- Use drag-drop to rearrange if needed

### Step 5: Start Logging (Now!)

- Go to **Log Attendance** page
- Start marking attendance
- All changes persist automatically

---

## Tips & Tricks

### ✅ Best Practices

- **Consistent naming**: Use code like `CS101`, `PHYS201` for clarity
- **Realistic times**: Use actual class times (affects OD calculations)
- **Complete holidays**: Add all official holidays to avoid calculation errors
- **Backup settings**: Screenshot your timetable for reference

### 🐛 Troubleshooting

**Q: I can't add a timetable slot**
A: Make sure you have at least one subject created first.

**Q: My changes aren't saving**
A: Changes save automatically. Check browser console (F12) for errors.

**Q: I want to test the app with different schedules**
A: Delete all data (step above) and start fresh, OR modify existing data using Settings.

**Q: Can I have the same subject in multiple periods?**
A: Yes! You can have CS101 on MWF periods 1, 3, 5 and also have another course on periods 2, 4, 7.

---

## Spec Compliance

Settings implement **SPEC Section 4** (Data Model):

✅ **4.2 Subject** - Code, name, credits (informational)
✅ **4.3 Timetable Slot** - Day, period, subject, times, duration
✅ **4.1 Semester Config** - Start, end, last instruction dates
✅ **Holiday Support** - Excluded from denominators

All changes immediately affect:

- Dashboard calculations
- Available session counts
- Leave simulation
- OD hour calculations

---

## Next Steps

After configuring your settings:

1. Go to **Dashboard** to see your overall stats
2. Go to **Log Attendance** to mark daily attendance
3. Use **Planner** to simulate leave and calculate safe margins
4. Return to **Settings** anytime to modify timetable/subjects
