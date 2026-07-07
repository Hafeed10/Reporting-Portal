-- 1. Create the monthly_reports table
CREATE TABLE IF NOT EXISTS monthly_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  dars TEXT NOT NULL DEFAULT 'Dars 1', -- Class/Lesson tracking key
  month TEXT NOT NULL,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  prepared_by TEXT NOT NULL,
  designation TEXT NOT NULL,
  
  -- Attendance Summary
  attendance_total_working_days INTEGER NOT NULL DEFAULT 0,
  attendance_avg_pct NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  attendance_regular_count INTEGER NOT NULL DEFAULT 0,
  attendance_low_count INTEGER NOT NULL DEFAULT 0,
  
  -- Student Leave Report
  leave_total_received INTEGER NOT NULL DEFAULT 0,
  leave_approved_count INTEGER NOT NULL DEFAULT 0,
  leave_unapproved_count INTEGER NOT NULL DEFAULT 0,
  leave_reasons JSONB NOT NULL DEFAULT '{"medical": 0, "family_function": 0, "personal": 0, "others": 0}'::JSONB,
  
  -- Programs Watched / PRD Activities
  programs_count INTEGER NOT NULL DEFAULT 0,
  programs_names TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  programs_outcomes TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  books_read TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  writing_activities TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  
  -- Student Participation
  participation_total INTEGER NOT NULL DEFAULT 0,
  participation_active INTEGER NOT NULL DEFAULT 0,
  participation_achievements TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  
  -- Individual Student Performance Reports (List of student objects)
  student_reports JSONB NOT NULL DEFAULT '[]'::JSONB,
  
  -- Observations & Suggestions
  observations TEXT[] NOT NULL DEFAULT ARRAY[
    'Attendance trends and student engagement were satisfactory.',
    'Students actively participated in the programs and discussions.',
    'Leave records were monitored and maintained regularly.'
  ]::TEXT[],
  suggestions TEXT[] NOT NULL DEFAULT ARRAY[
    'Improve attendance through regular follow-up.',
    'Encourage greater participation in PRD programs.',
    'Conduct additional awareness and skill-development activities.'
  ]::TEXT[]
);

-- Enable Row Level Security (RLS) on monthly_reports
ALTER TABLE monthly_reports ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all access to anonymous users for testing
DROP POLICY IF EXISTS "Enable all access for anonymous users" ON monthly_reports;
CREATE POLICY "Enable all access for anonymous users" 
ON monthly_reports
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 2. Create the students table for roster tracking
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  dars TEXT NOT NULL,
  class TEXT NOT NULL DEFAULT 'HS1',
  CONSTRAINT unique_student_name_dars_class UNIQUE (name, dars, class)
);

-- Alter existing table if it was created without the class column
ALTER TABLE students ADD COLUMN IF NOT EXISTS class TEXT NOT NULL DEFAULT 'HS1';
ALTER TABLE students DROP CONSTRAINT IF EXISTS unique_student_name_dars;
ALTER TABLE students DROP CONSTRAINT IF EXISTS unique_student_name_dars_class;
ALTER TABLE students ADD CONSTRAINT unique_student_name_dars_class UNIQUE (name, dars, class);

-- Enable RLS on students table
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all access to anonymous users on students
DROP POLICY IF EXISTS "Enable all access for anonymous users on students" ON students;
CREATE POLICY "Enable all access for anonymous users on students" 
ON students
FOR ALL 
USING (true) 
WITH CHECK (true);


-- 2. Enable Row Level Security (RLS)
-- 1. Add the student_reports JSONB column if it doesn't already exist
ALTER TABLE monthly_reports ADD COLUMN IF NOT EXISTS student_reports JSONB NOT NULL DEFAULT '[]'::JSONB;
ALTER TABLE monthly_reports ADD COLUMN IF NOT EXISTS books_read TEXT[] NOT NULL DEFAULT '{}'::TEXT[];
ALTER TABLE monthly_reports ADD COLUMN IF NOT EXISTS writing_activities TEXT[] NOT NULL DEFAULT '{}'::TEXT[];

-- 2. Create the students table for roster tracking
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  dars TEXT NOT NULL,
  class TEXT NOT NULL DEFAULT 'HS1',
  CONSTRAINT unique_student_name_dars_class UNIQUE (name, dars, class)
);

-- 3. Enable RLS on students table
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- 4. Create policy to allow all access to anonymous users on students
DROP POLICY IF EXISTS "Enable all access for anonymous users on students" ON students;
CREATE POLICY "Enable all access for anonymous users on students" 
ON students
FOR ALL 
USING (true) 
WITH CHECK (true);


-- 3. Create the daily_subject_attendance table for subject-wise period-wise tracking
CREATE TABLE IF NOT EXISTS daily_subject_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  date DATE NOT NULL,
  faculty TEXT NOT NULL,
  class TEXT NOT NULL,
  subject TEXT NOT NULL,
  period TEXT NOT NULL,
  records JSONB NOT NULL DEFAULT '[]'::JSONB,
  CONSTRAINT unique_date_class_subject_period UNIQUE (date, class, subject, period)
);

-- Enable RLS on daily_subject_attendance
ALTER TABLE daily_subject_attendance ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all access to anonymous users for testing
DROP POLICY IF EXISTS "Enable all access for anonymous users on daily_subject_attendance" ON daily_subject_attendance;
CREATE POLICY "Enable all access for anonymous users on daily_subject_attendance" 
ON daily_subject_attendance
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 4. Seed initial student roster data
INSERT INTO students (name, dars, class) VALUES
  ('Ali', 'Imam Navavi Garden', 'HS1'),
  ('Aisha', 'Imam Navavi Garden', 'HS1'),
  ('Omar', 'Imam Navavi Garden', 'HS2'),
  ('Fatima', 'Imam Navavi Garden', 'HS2'),
  ('Zainab', 'Imam Navavi Garden', 'BS1'),
  ('Hamza', 'Imam Navavi Garden', 'BS1'),
  ('Bilal', 'Imam Navavi Garden', 'BS2'),
  ('Maryam', 'Imam Navavi Garden', 'BS2'),

  ('Youssef', 'Imam Rafi Garden', 'HS1'),
  ('Khadija', 'Imam Rafi Garden', 'HS1'),
  ('Ibrahim', 'Imam Rafi Garden', 'HS2'),
  ('Sara', 'Imam Rafi Garden', 'HS2'),
  ('Mustafa', 'Imam Rafi Garden', 'BS1'),
  ('Amira', 'Imam Rafi Garden', 'BS1'),
  ('Yahya', 'Imam Rafi Garden', 'BS2'),
  ('Hana', 'Imam Rafi Garden', 'BS2'),

  ('Suleiman', 'Imam Gazli Garden', 'HS1'),
  ('Layla', 'Imam Gazli Garden', 'HS1'),
  ('Hassan', 'Imam Gazli Garden', 'HS2'),
  ('Yasmin', 'Imam Gazli Garden', 'HS2'),
  ('Idris', 'Imam Gazli Garden', 'BS1'),
  ('Farah', 'Imam Gazli Garden', 'BS1'),
  ('Zakariya', 'Imam Gazli Garden', 'BS2'),
  ('Nour', 'Imam Gazli Garden', 'BS2'),

  ('Tariq', 'RootExc', 'HS1'),
  ('Salma', 'RootExc', 'HS1'),
  ('Imran', 'RootExc', 'HS2'),
  ('Rania', 'RootExc', 'HS2'),
  ('Luqman', 'RootExc', 'BS1'),
  ('Heba', 'RootExc', 'BS1'),
  ('Anas', 'RootExc', 'BS2'),
  ('Mona', 'RootExc', 'BS2')
ON CONFLICT (name, dars, class) DO NOTHING;

-- 5. Seed initial monthly reports data
INSERT INTO monthly_reports (
  id, created_at, dars, month, report_date, prepared_by, designation,
  attendance_total_working_days, attendance_avg_pct, attendance_regular_count, attendance_low_count,
  leave_total_received, leave_approved_count, leave_unapproved_count, leave_reasons,
  programs_count, programs_names, programs_outcomes,
  participation_total, participation_active, participation_achievements,
  observations, suggestions, student_reports
) VALUES 
(
  'a6b8d30e-1111-4444-8888-000000000001',
  NOW() - INTERVAL '30 days',
  'Imam Navavi Garden',
  'May 2026',
  '2026-05-31',
  'Sarah Jenkins',
  'Student Affairs Coordinator',
  22,
  92.40,
  45,
  5,
  12,
  10,
  2,
  '{"medical": 6, "family_function": 3, "personal": 2, "others": 1}'::jsonb,
  3,
  ARRAY['Digital Literacy & Cyber Safety Seminars', 'Career Pathways Panel Discussion', 'Mental Health and Well-being Workshop'],
  ARRAY['Students learned key practices for maintaining privacy and safety online.', 'Exposure to diverse career tracks and preparation methodologies.', 'Acquired mindfulness techniques and coping mechanisms for exam stress.'],
  50,
  42,
  ARRAY['Liam Carter successfully built a responsive community website.', 'The sophomore debate squad secured first place in the regional tournament.'],
  ARRAY['Attendance trends and student engagement were satisfactory.', 'Students actively participated in the programs and discussions.', 'Leave records were monitored and maintained regularly.'],
  ARRAY['Improve attendance through regular follow-up.', 'Encourage greater participation in PRD programs.', 'Conduct additional awareness and skill-development activities.'],
  '[]'::jsonb
),
(
  'a6b8d30e-2222-4444-8888-000000000002',
  NOW() - INTERVAL '60 days',
  'Imam Rafi Garden',
  'April 2026',
  '2026-04-30',
  'Sarah Jenkins',
  'Student Affairs Coordinator',
  20,
  89.10,
  42,
  8,
  18,
  15,
  3,
  '{"medical": 8, "family_function": 5, "personal": 3, "others": 2}'::jsonb,
  2,
  ARRAY['Introduction to Web Development & Git', 'Communication and Public Speaking Bootcamp'],
  ARRAY['Established foundational skills in HTML, CSS, and basic version control.', 'Enhanced confidence in public speaking and structuring verbal presentations.'],
  50,
  38,
  ARRAY['Sophia Martinez completed all web development modules in record time.', 'Three students completed peer mentoring certification.'],
  ARRAY['Attendance saw a brief dip mid-month due to seasonal illnesses.', 'Public speaking program had a very high interactive feedback rating.', 'Unapproved absences were followed up with parent calls.'],
  ARRAY['Implement an automated message system for absent students.', 'Arrange an advanced React seminar for interest groups.', 'Expand peer tutoring sessions to cover math and programming fundamentals.'],
  '[]'::jsonb
),
(
  'a6b8d30e-3222-4444-8888-000000000003',
  NOW() - INTERVAL '90 days',
  'Imam Gazli Garden',
  'March 2026',
  '2026-03-31',
  'Sarah Jenkins',
  'Student Affairs Coordinator',
  21,
  95.80,
  48,
  2,
  6,
  6,
  0,
  '{"medical": 3, "family_function": 2, "personal": 1, "others": 0}'::jsonb,
  3,
  ARRAY['Introduction to Algorithmic Thinking', 'Teamwork and Collaborative Projects Seminar', 'Science and Innovation Fair Presentation'],
  ARRAY['Learned fundamental logic, arrays, and basic problem decomposition.', 'Understood group roles, conflicts resolution, and sprint task allocations.', 'Demonstrated physics and design models to peers and visitors.'],
  50,
  46,
  ARRAY['The robotics club qualified for state finals.', 'Daniel Wood received perfect score for his innovation layout.'],
  ARRAY['Attendance was excellent throughout the month.', 'Classroom participation reached its highest level this quarter.', 'Zero unapproved absences recorded.'],
  ARRAY['Establish a rewards program for students maintaining 100% attendance.', 'Initiate hands-on science workshop preparations earlier.', 'Provide study guides for upcoming evaluation tests.'],
  '[]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 6. Seed initial daily subject attendance data
INSERT INTO daily_subject_attendance (
  date, faculty, class, subject, period, records
) VALUES
(
  CURRENT_DATE,
  'Ustad Ahmed',
  'Imam Navavi Garden',
  'Fiqh',
  'Period 1',
  '[
    {"student_name": "Ali", "status": "P"},
    {"student_name": "Aisha", "status": "P"},
    {"student_name": "Omar", "status": "P"},
    {"student_name": "Fatima", "status": "P"},
    {"student_name": "Zainab", "status": "L"},
    {"student_name": "Hamza", "status": "P"},
    {"student_name": "Bilal", "status": "A"},
    {"student_name": "Maryam", "status": "P"}
  ]'::jsonb
),
(
  CURRENT_DATE,
  'Ustad Ahmed',
  'Imam Navavi Garden',
  'Hadith',
  'Period 2',
  '[
    {"student_name": "Ali", "status": "P"},
    {"student_name": "Aisha", "status": "P"},
    {"student_name": "Omar", "status": "P"},
    {"student_name": "Fatima", "status": "P"},
    {"student_name": "Zainab", "status": "L"},
    {"student_name": "Hamza", "status": "P"},
    {"student_name": "Bilal", "status": "P"},
    {"student_name": "Maryam", "status": "P"}
  ]'::jsonb
),
(
  CURRENT_DATE,
  'Ustad Salim',
  'Imam Rafi Garden',
  'Arabic Language',
  'Period 1',
  '[
    {"student_name": "Youssef", "status": "P"},
    {"student_name": "Khadija", "status": "P"},
    {"student_name": "Ibrahim", "status": "A"},
    {"student_name": "Sara", "status": "P"},
    {"student_name": "Mustafa", "status": "P"},
    {"student_name": "Amira", "status": "P"},
    {"student_name": "Yahya", "status": "L"},
    {"student_name": "Hana", "status": "P"}
  ]'::jsonb
),
(
  CURRENT_DATE,
  'Ustad Siddique',
  'Imam Gazli Garden',
  'Tajweed',
  'Period 1',
  '[
    {"student_name": "Suleiman", "status": "P"},
    {"student_name": "Layla", "status": "P"},
    {"student_name": "Hassan", "status": "P"},
    {"student_name": "Yasmin", "status": "P"},
    {"student_name": "Idris", "status": "P"},
    {"student_name": "Farah", "status": "P"},
    {"student_name": "Zakariya", "status": "P"},
    {"student_name": "Nour", "status": "P"}
  ]'::jsonb
)
ON CONFLICT (date, class, subject, period) DO NOTHING;

