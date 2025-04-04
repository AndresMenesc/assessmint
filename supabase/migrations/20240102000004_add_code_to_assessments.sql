
-- Add code column to assessments table if it doesn't exist
ALTER TABLE public.assessments 
ADD COLUMN IF NOT EXISTS code TEXT;

-- Make code column not nullable with a default random string 
-- This is for existing rows
UPDATE public.assessments
SET code = substring(md5(random()::text) from 1 for 8)
WHERE code IS NULL;

-- Add not null constraint after updating existing rows
ALTER TABLE public.assessments 
ALTER COLUMN code SET NOT NULL;

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS assessments_code_idx ON public.assessments(code);
