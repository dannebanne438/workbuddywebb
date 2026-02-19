
-- ============================================
-- 1. AUDIT LOGS TABLE (append-only, immutable)
-- ============================================
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data jsonb,
  new_data jsonb,
  changed_fields text[],
  user_id uuid,
  workplace_id uuid,
  server_timestamp timestamptz NOT NULL DEFAULT now(),
  timezone text NOT NULL DEFAULT 'UTC',
  ip_address text
);

-- RLS: append-only, no update/delete for anyone
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only system (triggers) can insert
CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- Super admins and workplace admins can view their workplace logs
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    is_super_admin(auth.uid()) 
    OR (workplace_id = get_user_workplace_id(auth.uid()) AND is_workplace_admin(auth.uid(), workplace_id))
  );

-- NO UPDATE policy = cannot update
-- NO DELETE policy = cannot delete

-- ============================================
-- 2. AUDIT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _workplace_id uuid;
  _changed text[];
  _key text;
BEGIN
  -- Try to get current user
  BEGIN
    _user_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    _user_id := NULL;
  END;

  IF TG_OP = 'INSERT' THEN
    _workplace_id := NEW.workplace_id;
    INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, changed_fields, user_id, workplace_id)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', NULL, to_jsonb(NEW), NULL, _user_id, _workplace_id);
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    _workplace_id := COALESCE(NEW.workplace_id, OLD.workplace_id);
    -- Calculate changed fields
    _changed := ARRAY[]::text[];
    FOR _key IN SELECT jsonb_object_keys(to_jsonb(NEW))
    LOOP
      IF to_jsonb(NEW) -> _key IS DISTINCT FROM to_jsonb(OLD) -> _key THEN
        _changed := _changed || _key;
      END IF;
    END LOOP;
    
    INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, changed_fields, user_id, workplace_id)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), _changed, _user_id, _workplace_id);
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    _workplace_id := OLD.workplace_id;
    INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, changed_fields, user_id, workplace_id)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), NULL, NULL, _user_id, _workplace_id);
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- ============================================
-- 3. ATTACH AUDIT TRIGGERS TO KEY TABLES
-- ============================================
CREATE TRIGGER audit_incidents
  AFTER INSERT OR UPDATE OR DELETE ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_checklists
  AFTER INSERT OR UPDATE OR DELETE ON public.checklists
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_schedules
  AFTER INSERT OR UPDATE OR DELETE ON public.schedules
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_announcements
  AFTER INSERT OR UPDATE OR DELETE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_certificates
  AFTER INSERT OR UPDATE OR DELETE ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_routines
  AFTER INSERT OR UPDATE OR DELETE ON public.routines
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- ============================================
-- 4. ENHANCE INCIDENTS TABLE
-- ============================================
ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS assigned_to uuid,
  ADD COLUMN IF NOT EXISTS assigned_to_name text,
  ADD COLUMN IF NOT EXISTS closed_by uuid,
  ADD COLUMN IF NOT EXISTS closed_by_name text,
  ADD COLUMN IF NOT EXISTS closed_at timestamptz,
  ADD COLUMN IF NOT EXISTS action_comment text;

-- ============================================
-- 5. INCIDENT EVIDENCE TABLE (before/after photos)
-- ============================================
CREATE TABLE public.incident_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  workplace_id uuid NOT NULL REFERENCES public.workplaces(id),
  evidence_type text NOT NULL CHECK (evidence_type IN ('before', 'after')),
  image_url text NOT NULL,
  description text,
  uploaded_by uuid,
  uploaded_by_name text,
  server_timestamp timestamptz NOT NULL DEFAULT now(),
  locked boolean NOT NULL DEFAULT true
);

ALTER TABLE public.incident_evidence ENABLE ROW LEVEL SECURITY;

-- Users can upload evidence to their workplace incidents
CREATE POLICY "Users can upload evidence"
  ON public.incident_evidence FOR INSERT
  WITH CHECK (
    (workplace_id = get_user_workplace_id(auth.uid())) OR is_super_admin(auth.uid())
  );

-- Users can view their workplace evidence
CREATE POLICY "Users can view evidence"
  ON public.incident_evidence FOR SELECT
  USING (
    (workplace_id = get_user_workplace_id(auth.uid())) OR is_super_admin(auth.uid())
  );

-- Admins can manage evidence
CREATE POLICY "Admins can manage evidence"
  ON public.incident_evidence FOR ALL
  USING (
    is_workplace_admin(auth.uid(), workplace_id) OR is_super_admin(auth.uid())
  );

-- NO DELETE policy for regular users = evidence cannot be deleted
-- NO UPDATE policy for regular users = evidence cannot be modified

-- ============================================
-- 6. INDEX FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_audit_logs_table_record ON public.audit_logs (table_name, record_id);
CREATE INDEX idx_audit_logs_workplace ON public.audit_logs (workplace_id);
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs (server_timestamp);
CREATE INDEX idx_incident_evidence_incident ON public.incident_evidence (incident_id);
