
-- Create raters table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.raters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id),
  rater_type TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create responses table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rater_id UUID NOT NULL REFERENCES public.raters(id),
  question_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS raters_assessment_id_idx ON public.raters(assessment_id);
CREATE INDEX IF NOT EXISTS responses_rater_id_idx ON public.responses(rater_id);
CREATE INDEX IF NOT EXISTS responses_question_id_idx ON public.responses(question_id);
