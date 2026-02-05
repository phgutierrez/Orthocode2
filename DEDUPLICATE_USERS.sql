-- Remove duplicate users from the database
-- This version disables RLS to ensure deletion works
-- Execute this in Supabase SQL Editor

-- Step 1: Disable RLS temporarily
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Step 2: Check for duplicates
SELECT email, COUNT(*) as count, array_agg(id) as ids, array_agg(created_at ORDER BY created_at) as created_dates
FROM public.users
GROUP BY email
HAVING COUNT(*) > 1;

-- Step 3: Delete duplicates (keep the oldest one per email)
DELETE FROM public.users
WHERE id IN (
  WITH numbered_users AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at ASC) as row_num
    FROM public.users
  )
  SELECT id FROM numbered_users WHERE row_num > 1
);

-- Step 4: Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Step 5: Verify no duplicates remain
SELECT email, COUNT(*) as count
FROM public.users
GROUP BY email
HAVING COUNT(*) > 1;
