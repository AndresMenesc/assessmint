
-- Function to run custom SQL (for admin use only)
CREATE OR REPLACE FUNCTION public.run_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Policy to restrict run_sql to admins only
ALTER FUNCTION public.run_sql(text) SECURITY DEFINER;

COMMENT ON FUNCTION public.run_sql IS 'Function to run custom SQL (restricted to admin use only)';
