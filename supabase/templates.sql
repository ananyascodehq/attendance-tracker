-- =============================================
-- PHASE 2: Timetable Templates for Viral Sharing
-- Run this in Supabase SQL Editor after schema.sql
-- =============================================

-- 1. TIMETABLE_TEMPLATES TABLE
-- =============================================
CREATE TABLE timetable_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_code TEXT UNIQUE NOT NULL,
    department TEXT NOT NULL,
    year INTEGER NOT NULL CHECK (year BETWEEN 1 AND 5),
    semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 10),
    section TEXT, -- Optional: A, B, C, etc.
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    use_count INTEGER DEFAULT 0,
    slots JSONB NOT NULL DEFAULT '[]'::jsonb,
    subjects JSONB NOT NULL DEFAULT '[]'::jsonb, -- Store subject info for import
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE timetable_templates ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view templates)
CREATE POLICY "Anyone can view templates" ON timetable_templates FOR
SELECT USING (true);

-- Authenticated users can create templates
CREATE POLICY "Authenticated users can create templates" ON timetable_templates FOR
INSERT
WITH
    CHECK (
        auth.uid () IS NOT NULL
        AND auth.uid () = created_by
    );

-- Only creator can update their templates
CREATE POLICY "Creator can update own templates" ON timetable_templates FOR
UPDATE USING (auth.uid () = created_by);

-- Only creator can delete their templates
CREATE POLICY "Creator can delete own templates" ON timetable_templates FOR DELETE USING (auth.uid () = created_by);

-- Indexes for performance
CREATE INDEX idx_templates_share_code ON timetable_templates (share_code);

CREATE INDEX idx_templates_created_by ON timetable_templates (created_by);

CREATE INDEX idx_templates_department ON timetable_templates (department);

-- Trigger for updated_at
CREATE TRIGGER update_timetable_templates_updated_at
    BEFORE UPDATE ON timetable_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. ATOMIC INCREMENT FUNCTION
-- =============================================
-- Function to atomically increment use_count and return the template
CREATE OR REPLACE FUNCTION increment_template_use_count(p_template_id UUID)
RETURNS timetable_templates AS $$
DECLARE
    result timetable_templates;
BEGIN
    UPDATE timetable_templates
    SET use_count = use_count + 1,
        updated_at = NOW()
    WHERE id = p_template_id
    RETURNING * INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. TEMPLATE METRICS VIEW (Optional)
-- =============================================
CREATE OR REPLACE VIEW template_metrics AS
SELECT 
    COUNT(*) as total_templates,
    SUM(use_count) as total_imports,
    ROUND(AVG(use_count)::numeric, 2) as avg_imports_per_template,
    COUNT(*) FILTER (WHERE use_count > 0) as templates_with_imports
FROM timetable_templates;

-- Grant select on view to authenticated users
GRANT SELECT ON template_metrics TO authenticated;

-- =============================================
-- SCHEMA UPDATE COMPLETE!
-- =============================================
-- New table: timetable_templates
-- Features:
--   - Public read, authenticated write
--   - Unique share codes with collision handling
--   - JSONB storage for slots and subjects
--   - Atomic use_count increment
--   - Metrics view for analytics
-- =============================================