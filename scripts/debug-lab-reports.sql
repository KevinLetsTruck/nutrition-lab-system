-- Debug script to understand the issue

-- 1. Check if users table exists and has id column
SELECT 
    'Users table exists' as check_type,
    EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
    ) as result;

-- 2. Check users table columns
SELECT 
    'Users table columns' as check_type,
    column_name, 
    data_type
FROM information_schema.columns
WHERE table_name = 'users'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check if lab_reports table already exists
SELECT 
    'Lab reports table exists' as check_type,
    EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'lab_reports'
    ) as result;

-- 4. If lab_reports exists, check its columns
SELECT 
    'Lab reports columns' as check_type,
    column_name, 
    data_type
FROM information_schema.columns
WHERE table_name = 'lab_reports'
AND table_schema = 'public'
ORDER BY ordinal_position;