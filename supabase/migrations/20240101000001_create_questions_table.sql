
-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  section TEXT NOT NULL,
  sub_section TEXT NOT NULL,
  is_reversed BOOLEAN NOT NULL DEFAULT false,
  negative_score BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to view questions
CREATE POLICY "Allow anyone to view questions" 
  ON public.questions 
  FOR SELECT 
  TO PUBLIC 
  USING (true);

-- Create policy to allow admins to modify questions
CREATE POLICY "Allow admins to modify questions" 
  ON public.questions 
  FOR ALL 
  TO PUBLIC 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = auth.jwt() ->> 'email' 
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Create admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'rater')),
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow super admins to manage all admin users
CREATE POLICY "Allow super admins to manage all admin users" 
  ON public.admin_users 
  FOR ALL 
  TO PUBLIC 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = auth.jwt() ->> 'email' 
      AND role = 'super_admin'
    )
  );

-- Create policy to allow admins to view all admin users
CREATE POLICY "Allow admins to view all admin users" 
  ON public.admin_users 
  FOR SELECT 
  TO PUBLIC 
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = auth.jwt() ->> 'email' 
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Insert initial admin users (same as the hard-coded ones in the AuthContext)
INSERT INTO public.admin_users (email, name, role, password) 
VALUES 
  ('super@orbit.com', 'Super Admin', 'super_admin', 'super123'),
  ('admin@orbit.com', 'Admin User', 'admin', 'admin123'),
  ('rater1@example.com', 'Rater One', 'rater', 'rater123'),
  ('rater2@example.com', 'Rater Two', 'rater', 'rater123')
ON CONFLICT (email) DO NOTHING;
