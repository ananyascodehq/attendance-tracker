-- =============================================
-- PHASE 1: Multi-User Data Model for Campus Attendance
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. PROFILES TABLE (if not already created)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    department TEXT,
    onboarded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe to run multiple times)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles FOR
SELECT USING (auth.uid () = id);

CREATE POLICY "Users can insert own profile" ON profiles FOR
INSERT
WITH
    CHECK (auth.uid () = id);

CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE USING (auth.uid () = id);

-- 2. SEMESTERS TABLE
-- =============================================
CREATE TABLE semesters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "Fall 2026", "Spring 2026"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    last_instruction_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own semesters" ON semesters FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can insert own semesters" ON semesters FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update own semesters" ON semesters FOR
UPDATE USING (auth.uid () = user_id);

CREATE POLICY "Users can delete own semesters" ON semesters FOR DELETE USING (auth.uid () = user_id);

CREATE INDEX idx_semesters_user_id ON semesters (user_id);

CREATE INDEX idx_semesters_active ON semesters (user_id, is_active);

-- 3. SUBJECTS TABLE
-- =============================================
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    semester_id UUID NOT NULL REFERENCES semesters (id) ON DELETE CASCADE,
    subject_code TEXT, -- Optional for library/seminar
    subject_name TEXT NOT NULL,
    credits NUMERIC(2, 1) NOT NULL CHECK (credits IN (0, 1.5, 2, 3, 4)),
    zero_credit_type TEXT CHECK (
        zero_credit_type IN ('library', 'seminar', 'vac')
        OR zero_credit_type IS NULL
    ),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (semester_id, subject_code) -- No duplicate codes per semester
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subjects" ON subjects FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can insert own subjects" ON subjects FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update own subjects" ON subjects FOR
UPDATE USING (auth.uid () = user_id);

CREATE POLICY "Users can delete own subjects" ON subjects FOR DELETE USING (auth.uid () = user_id);

CREATE INDEX idx_subjects_semester ON subjects (semester_id);

CREATE INDEX idx_subjects_user ON subjects (user_id);

-- 4. TIMETABLE_SLOTS TABLE
-- =============================================
CREATE TABLE timetable_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    semester_id UUID NOT NULL REFERENCES semesters (id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects (id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL CHECK (
        day_of_week IN (
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
        )
    ),
    period_number INTEGER NOT NULL CHECK (period_number BETWEEN 1 AND 7),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (
        semester_id,
        day_of_week,
        period_number
    ) -- One slot per day/period
);

ALTER TABLE timetable_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own timetable" ON timetable_slots FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can insert own timetable" ON timetable_slots FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update own timetable" ON timetable_slots FOR
UPDATE USING (auth.uid () = user_id);

CREATE POLICY "Users can delete own timetable" ON timetable_slots FOR DELETE USING (auth.uid () = user_id);

CREATE INDEX idx_timetable_semester ON timetable_slots (semester_id);

CREATE INDEX idx_timetable_day ON timetable_slots (semester_id, day_of_week);

-- 5. ATTENDANCE_LOGS TABLE
-- =============================================
CREATE TABLE attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    semester_id UUID NOT NULL REFERENCES semesters (id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects (id) ON DELETE CASCADE,
    date DATE NOT NULL,
    period_number INTEGER NOT NULL CHECK (period_number BETWEEN 1 AND 7),
    status TEXT NOT NULL CHECK (
        status IN ('present', 'leave', 'od')
    ),
    notes TEXT, -- OD reason, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (
        semester_id,
        subject_id,
        date,
        period_number
    ) -- One log per subject/date/period
);

ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attendance" ON attendance_logs FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can insert own attendance" ON attendance_logs FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update own attendance" ON attendance_logs FOR
UPDATE USING (auth.uid () = user_id);

CREATE POLICY "Users can delete own attendance" ON attendance_logs FOR DELETE USING (auth.uid () = user_id);

CREATE INDEX idx_attendance_semester ON attendance_logs (semester_id);

CREATE INDEX idx_attendance_date ON attendance_logs (semester_id, date);

CREATE INDEX idx_attendance_subject ON attendance_logs (subject_id);

-- 6. HOLIDAYS TABLE
-- =============================================
CREATE TABLE holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    semester_id UUID NOT NULL REFERENCES semesters (id) ON DELETE CASCADE,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (semester_id, date) -- One holiday per date per semester
);

ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own holidays" ON holidays FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can insert own holidays" ON holidays FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update own holidays" ON holidays FOR
UPDATE USING (auth.uid () = user_id);

CREATE POLICY "Users can delete own holidays" ON holidays FOR DELETE USING (auth.uid () = user_id);

CREATE INDEX idx_holidays_semester ON holidays (semester_id);

-- 7. CAT_PERIODS TABLE (Exam periods)
-- =============================================
CREATE TABLE cat_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    semester_id UUID NOT NULL REFERENCES semesters (id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "CAT 1", "CAT 2"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (end_date >= start_date)
);

ALTER TABLE cat_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own CAT periods" ON cat_periods FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can insert own CAT periods" ON cat_periods FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update own CAT periods" ON cat_periods FOR
UPDATE USING (auth.uid () = user_id);

CREATE POLICY "Users can delete own CAT periods" ON cat_periods FOR DELETE USING (auth.uid () = user_id);

CREATE INDEX idx_cat_periods_semester ON cat_periods (semester_id);

-- 8. HELPER FUNCTIONS
-- =============================================

-- Function to get active semester for a user
CREATE OR REPLACE FUNCTION get_active_semester(p_user_id UUID)
RETURNS UUID AS $$
  SELECT id FROM semesters 
  WHERE user_id = p_user_id AND is_active = TRUE 
  LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- 9. UPDATED_AT TRIGGERS
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_semesters_updated_at
  BEFORE UPDATE ON semesters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_attendance_logs_updated_at
  BEFORE UPDATE ON attendance_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- SCHEMA COMPLETE!
-- =============================================
-- Tables created:
--   - profiles (user info)
--   - semesters (semester config)
--   - subjects (courses)
--   - timetable_slots (weekly schedule)
--   - attendance_logs (daily attendance)
--   - holidays (holidays list)
--   - cat_periods (exam periods)
--
-- All tables have:
--   - user_id linked to auth.users
--   - RLS enabled with user-only policies
--   - Proper indexes for performance
-- =============================================