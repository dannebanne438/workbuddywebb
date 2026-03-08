-- ============================================================
-- SECURITY HARDENING MIGRATION
-- ============================================================

-- DEL 1: Make storage buckets PRIVATE
UPDATE storage.buckets SET public = false WHERE id IN ('photos', 'camera-uploads');
-- documents bucket is already private

-- DEL 2: Drop existing storage policies and create secure ones with workplace isolation
-- First drop existing policies on storage.objects
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Storage: Users can upload to their workplace folder only
CREATE POLICY "Users upload to workplace folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  (bucket_id IN ('photos', 'camera-uploads', 'documents'))
  AND (storage.foldername(name))[1] = (SELECT workplace_id::text FROM public.profiles WHERE id = auth.uid())
);

-- Storage: Users can read files from their workplace folder
CREATE POLICY "Users read own workplace files"
ON storage.objects FOR SELECT TO authenticated
USING (
  (bucket_id IN ('photos', 'camera-uploads', 'documents'))
  AND (
    (storage.foldername(name))[1] = (SELECT workplace_id::text FROM public.profiles WHERE id = auth.uid())
    OR public.is_super_admin(auth.uid())
  )
);

-- Storage: Admins can delete files from their workplace folder
CREATE POLICY "Admins delete workplace files"
ON storage.objects FOR DELETE TO authenticated
USING (
  (bucket_id IN ('photos', 'camera-uploads', 'documents'))
  AND (
    public.is_workplace_admin(auth.uid(), ((storage.foldername(name))[1])::uuid)
    OR public.is_super_admin(auth.uid())
  )
);

-- DEL 3: Create security_events table for audit logging
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  workplace_id uuid REFERENCES public.workplaces(id),
  action text NOT NULL,
  result text NOT NULL DEFAULT 'success',
  details jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only super admins can read security events
CREATE POLICY "Super admins can view security events"
ON public.security_events FOR SELECT TO authenticated
USING (public.is_super_admin(auth.uid()));

-- System can insert security events (via triggers/functions)
CREATE POLICY "System can insert security events"
ON public.security_events FOR INSERT TO authenticated
WITH CHECK (true);

-- DEL 4: Fix invoice_settings RLS to use PERMISSIVE (same pattern as finance tables)
DROP POLICY IF EXISTS "Super admin full access on invoice_settings" ON public.invoice_settings;
DROP POLICY IF EXISTS "Workplace admin can manage invoice_settings" ON public.invoice_settings;

CREATE POLICY "Super admin full access on invoice_settings"
ON public.invoice_settings FOR ALL TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Workplace admin can manage invoice_settings"
ON public.invoice_settings FOR ALL TO authenticated
USING (public.is_workplace_admin(auth.uid(), workplace_id))
WITH CHECK (public.is_workplace_admin(auth.uid(), workplace_id));

-- DEL 5: Add file validation function
CREATE OR REPLACE FUNCTION public.validate_storage_upload()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  file_ext text;
  allowed_image_types text[] := ARRAY['jpg', 'jpeg', 'png', 'webp'];
  allowed_doc_types text[] := ARRAY['pdf'];
  max_size bigint := 10485760; -- 10MB
BEGIN
  -- Check file size
  IF NEW.metadata->>'size' IS NOT NULL AND (NEW.metadata->>'size')::bigint > max_size THEN
    RAISE EXCEPTION 'File size exceeds 10MB limit';
  END IF;

  -- Extract file extension
  file_ext := lower(split_part(NEW.name, '.', array_length(string_to_array(NEW.name, '.'), 1)));

  -- Validate by bucket
  IF NEW.bucket_id IN ('photos', 'camera-uploads') THEN
    IF NOT (file_ext = ANY(allowed_image_types)) THEN
      RAISE EXCEPTION 'Only image files (jpg, png, webp) are allowed in this bucket';
    END IF;
  ELSIF NEW.bucket_id = 'documents' THEN
    IF NOT (file_ext = ANY(allowed_image_types) OR file_ext = ANY(allowed_doc_types)) THEN
      RAISE EXCEPTION 'Only images and PDFs are allowed in documents bucket';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
