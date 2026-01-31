# ⚡ Quick Reference Card

## 🎯 Your App is Now Live at http://localhost:3000

### 4 Pages Available

| Page              | URL           | Purpose                                               |
| ----------------- | ------------- | ----------------------------------------------------- |
| 📊 Dashboard      | `/`           | View overall stats & per-subject breakdown            |
| 📋 Log Attendance | `/attendance` | Mark attendance for any date                          |
| 📅 Planner        | `/planner`    | Test scenarios, check OD hours, safe margin           |
| ⚙️ **Settings**   | `/settings`   | **Manage subjects, build timetable, config semester** |

---

## ✨ New Settings Page Features

### 📚 Subjects Tab

```
Action          | How
Add Subject     | Fill code, name, credits → Click "Add Subject"
Edit Subject    | Click field in table → Edit inline
Delete Subject  | Click "Delete" button in Actions column
```

### 📅 Timetable Tab

```
Action          | How
Add Class       | Select day, period, subject, times → Click "Add"
Move Class      | Click and drag class card to new cell
Delete Class    | Click "×" button on class card
View All        | 5-day × 7-period grid shows entire week
```

### 🎓 Semester Tab

```
Action          | How
Set Semester    | Fill start, end, last-instruction dates
Add Holiday     | Fill date, description → Click "Add Holiday"
Remove Holiday  | Click "Remove" button next to holiday
View Duration   | Shows total days in semester
```

---

## 📋 First-Time Setup (15 minutes)

```
1. Go to http://localhost:3000/settings
2. Click "📚 Subjects" tab
   → Add your 4-5 subjects
3. Click "📅 Timetable" tab
   → Add your class slots (drag to rearrange)
4. Click "🎓 Semester & Holidays" tab
   → Set semester dates
   → Add holidays
5. Click "Dashboard" in navbar
   → Your stats appear!
6. Go to "Log Attendance"
   → Start marking classes
```

---

## 🎯 Key Metrics

After setup, monitor these on Dashboard:

**Overall Attendance**: Should stay ≥80% (aim for ≥82%)

- 🟢 82%+ = Safe
- 🟡 80-82% = Warning
- 🔴 <80% = Danger (exam risk!)

**Per-Subject**: Should stay ≥75% (aim for ≥77%)

- 🟢 77%+ = Safe
- 🟡 75-77% = Warning
- 🔴 <75% = Danger (fail risk!)

**OD Hours**: Should stay ≤72 hours

- Track in OD Tracker on Planner page
- Each class marked "OD" adds to total

---

## 💡 Pro Tips

### Timetable Setup

✅ Use **drag-and-drop** to fix scheduling conflicts  
✅ Set realistic **times** (affects OD calculations)  
✅ Mark **Saturday** as holiday (don't add classes unless needed)  
✅ Use **MWF+TTh pattern** for typical college schedule

### Attendance Logging

✅ Log **daily** or in **batches weekly**  
✅ Mark **OD** when you go on official duties (counts as present!)  
✅ Mark **Leave** only when genuinely absent  
✅ Can edit **past dates** anytime

### Planning Ahead

✅ Use **Leave Simulator** before taking days off  
✅ Check **Safe Margin** to know how many you can skip  
✅ Monitor **OD Hours** to avoid exceeding 72 hours

---

## 🐛 Troubleshooting

### Issue | Solution

---|---
Can't add timetable slots | Add at least one subject first
Changes not saving | Refresh page (should auto-save) or check localStorage
Attendance showing 0% | No attendance logged yet, start marking classes
Dashboard blank | Add subjects & timetable, then log attendance
Drag-drop not working | Use latest browser (Chrome, Firefox, Safari, Edge)

---

## 📱 Using on Mobile

✅ Fully responsive design works on:

- iPhones
- Android phones
- Tablets
- Desktops

Tap → Enter values → Changes save automatically

---

## 💾 Data Backup

Your data is safe in browser localStorage. To backup:

```
1. Press F12 (DevTools)
2. Application → Local Storage
3. Take screenshot or export
4. Your data persists forever (until you clear it)
```

To completely reset:

```
1. F12 → Application → Local Storage
2. Delete all "attendance_*" keys
3. Refresh page
4. Fresh start with sample data
```

---

## 🚀 Next: The Workflow

```
DAY 1: Setup (15 min)
├─ Settings → Add subjects
├─ Settings → Build timetable
├─ Settings → Set semester & holidays
└─ Dashboard → Verify stats

DAILY (2 min each)
├─ Log Attendance → Mark attendance
├─ Refresh → Stats update
└─ Check if ≥75% per-subject, ≥80% overall

WEEKLY (5 min)
├─ Planner → Leave Simulator
├─ Check → OD Tracker
├─ Plan → Safe Margin Calculator
└─ Adjust → Settings if needed
```

---

## 📞 Quick Links

| Document                                   | Purpose                         |
| ------------------------------------------ | ------------------------------- |
| [SETTINGS_GUIDE.md](./SETTINGS_GUIDE.md)   | How to use Settings (detailed)  |
| [USER_GUIDE.md](./USER_GUIDE.md)           | Complete feature documentation  |
| [BUILD_CHECKLIST.md](./BUILD_CHECKLIST.md) | What's implemented              |
| [DEVELOPMENT.md](./DEVELOPMENT.md)         | Dev guide & architecture        |
| [docs/specs.md](./docs/specs.md)           | Original SPEC (source of truth) |

---

## ✅ Verification Checklist

After setup, verify these work:

- [ ] Add subject in Settings → Subjects
- [ ] Edit subject name inline
- [ ] Delete a subject
- [ ] Add class slot in Timetable
- [ ] Drag class to different day/period
- [ ] Delete class
- [ ] Set semester dates
- [ ] Add holiday
- [ ] Go to Dashboard → See your stats
- [ ] Go to Log Attendance → Mark attendance
- [ ] Dashboard updates automatically
- [ ] Refresh page → Data persists

All ✅? **You're ready to track attendance!**

---

## 🎓 Go Live!

**Open http://localhost:3000 and start building your schedule!**

Your attendance tracker is:

- ✅ Fully functional
- ✅ Data persists
- ✅ Works offline
- ✅ Responsive design
- ✅ Spec-compliant calculations
- ✅ Ready for real use

**Happy tracking! 📊**
