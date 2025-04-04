
-- Function to get admin user by email
CREATE OR REPLACE FUNCTION public.get_admin_user_by_email(user_email TEXT)
RETURNS TABLE (
  email TEXT,
  name TEXT,
  role TEXT,
  password TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.email, 
    au.name, 
    au.role,
    au.password
  FROM public.admin_users au
  WHERE au.email = user_email;
END;
$$;

-- Function to count questions
CREATE OR REPLACE FUNCTION public.get_questions_count()
RETURNS TABLE (count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT COUNT(*)::bigint FROM public.questions;
END;
$$;

-- Function to import a batch of questions
CREATE OR REPLACE FUNCTION public.import_questions_batch(questions_batch jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.questions (
    id, 
    text, 
    section, 
    sub_section, 
    is_reversed, 
    negative_score
  )
  SELECT 
    q->>'id', 
    q->>'text', 
    q->>'section', 
    q->>'sub_section', 
    (q->>'is_reversed')::boolean, 
    (q->>'negative_score')::boolean
  FROM jsonb_array_elements(questions_batch) AS q;
END;
$$;
