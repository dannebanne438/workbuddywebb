
-- Create certificates table
CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workplace_id uuid NOT NULL REFERENCES public.workplaces(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name text NOT NULL,
  certificate_type text NOT NULL,
  issued_date date,
  expiry_date date,
  issuer text,
  certificate_number text,
  status text NOT NULL DEFAULT 'valid',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

-- Create incidents table
CREATE TABLE public.incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workplace_id uuid NOT NULL REFERENCES public.workplaces(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  severity text NOT NULL DEFAULT 'medium',
  category text NOT NULL DEFAULT 'safety',
  reported_by uuid,
  reported_by_name text,
  status text NOT NULL DEFAULT 'open',
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Certificates RLS: Admins can CRUD for their workplace
CREATE POLICY "Admins can manage certificates"
  ON public.certificates FOR ALL
  USING (is_workplace_admin(auth.uid(), workplace_id) OR is_super_admin(auth.uid()));

-- Certificates RLS: Employees can read their workplace certificates
CREATE POLICY "Users can view workplace certificates"
  ON public.certificates FOR SELECT
  USING (workplace_id = get_user_workplace_id(auth.uid()) OR is_super_admin(auth.uid()));

-- Incidents RLS: Employees can create and read
CREATE POLICY "Users can view workplace incidents"
  ON public.incidents FOR SELECT
  USING (workplace_id = get_user_workplace_id(auth.uid()) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create incidents"
  ON public.incidents FOR INSERT
  WITH CHECK (workplace_id = get_user_workplace_id(auth.uid()) OR is_super_admin(auth.uid()));

-- Incidents RLS: Admins can update and delete
CREATE POLICY "Admins can manage incidents"
  ON public.incidents FOR ALL
  USING (is_workplace_admin(auth.uid(), workplace_id) OR is_super_admin(auth.uid()));

-- Enable realtime for incidents
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
