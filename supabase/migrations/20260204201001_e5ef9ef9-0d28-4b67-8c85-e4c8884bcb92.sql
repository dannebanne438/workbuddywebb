-- Skapa tabell för AI-genererade prospekt-leads
CREATE TABLE public.prospect_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Företagsinfo
  company_name TEXT NOT NULL,
  industry TEXT,
  address TEXT,
  city TEXT,
  
  -- Storlek och relevans
  estimated_employees INTEGER,
  relevance_notes TEXT,
  lead_score INTEGER,
  
  -- Kontaktpersoner (JSON-array)
  contacts JSONB DEFAULT '[]',
  
  -- Sökparametrar
  search_area TEXT,
  search_coordinates JSONB,
  search_radius_km NUMERIC,
  
  -- Status
  status TEXT DEFAULT 'new',
  notes TEXT
);

-- Skapa validerings-trigger för lead_score istället för CHECK constraint
CREATE OR REPLACE FUNCTION public.validate_lead_score()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lead_score IS NOT NULL AND (NEW.lead_score < 0 OR NEW.lead_score > 100) THEN
    RAISE EXCEPTION 'lead_score must be between 0 and 100';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_lead_score_trigger
  BEFORE INSERT OR UPDATE ON public.prospect_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_lead_score();

-- Index för sökning
CREATE INDEX idx_prospect_leads_city ON public.prospect_leads(city);
CREATE INDEX idx_prospect_leads_industry ON public.prospect_leads(industry);
CREATE INDEX idx_prospect_leads_status ON public.prospect_leads(status);
CREATE INDEX idx_prospect_leads_created_by ON public.prospect_leads(created_by);

-- RLS: Endast super admins har åtkomst
ALTER TABLE public.prospect_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage prospect leads"
  ON public.prospect_leads FOR ALL
  USING (is_super_admin(auth.uid()));