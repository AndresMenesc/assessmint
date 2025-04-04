
-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questions table if it doesn't exist
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

-- Insert default admin users if they don't exist
INSERT INTO public.admin_users (email, name, role, password)
VALUES 
  ('super@orbit.com', 'Super Admin', 'super_admin', 'super123'),
  ('admin@orbit.com', 'Admin User', 'admin', 'admin123')
ON CONFLICT (email) DO NOTHING;
