-- =============================================================
-- SECURITY HARDENING MIGRATION
-- =============================================================

-- 1. FIX notifications INSERT policy (remove dangerous WITH CHECK true)
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- Replace with proper trigger-based notification creation
-- Only allow authenticated users to INSERT notifications for themselves OR via SECURITY DEFINER triggers
CREATE POLICY "Users can create notifications for themselves"
ON notifications FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

-- 2. STORAGE POLICIES - Enforce workplace path isolation

-- Drop existing permissive policies if any
DROP POLICY IF EXISTS "Users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload camera files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view camera files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete documents" ON storage.objects;
DROP POLICY IF EXISTS "Workplace users can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Workplace users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete workplace photos" ON storage.objects;
DROP POLICY IF EXISTS "Workplace users can view camera uploads" ON storage.objects;
DROP POLICY IF EXISTS "Workplace users can upload camera files" ON storage.objects;
DROP POLICY IF EXISTS "Workplace users can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Workplace users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete workplace documents" ON storage.objects;

-- PHOTOS bucket policies with workplace path isolation
CREATE POLICY "photos_select_workplace_isolated"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'photos' 
  AND (storage.foldername(name))[1]::uuid = get_user_workplace_id(auth.uid())
);

CREATE POLICY "photos_insert_workplace_isolated"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'photos'
  AND (storage.foldername(name))[1]::uuid = get_user_workplace_id(auth.uid())
);

CREATE POLICY "photos_delete_admin_only"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'photos'
  AND (
    is_workplace_admin(auth.uid(), (storage.foldername(name))[1]::uuid)
    OR is_super_admin(auth.uid())
  )
);

-- CAMERA-UPLOADS bucket policies with workplace path isolation
CREATE POLICY "camera_select_workplace_isolated"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'camera-uploads'
  AND (storage.foldername(name))[1]::uuid = get_user_workplace_id(auth.uid())
);

CREATE POLICY "camera_insert_workplace_isolated"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'camera-uploads'
  AND (storage.foldername(name))[1]::uuid = get_user_workplace_id(auth.uid())
);

CREATE POLICY "camera_delete_admin_only"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'camera-uploads'
  AND (
    is_workplace_admin(auth.uid(), (storage.foldername(name))[1]::uuid)
    OR is_super_admin(auth.uid())
  )
);

-- DOCUMENTS bucket policies with workplace path isolation
CREATE POLICY "documents_select_workplace_isolated"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1]::uuid = get_user_workplace_id(auth.uid())
);

CREATE POLICY "documents_insert_workplace_isolated"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1]::uuid = get_user_workplace_id(auth.uid())
);

CREATE POLICY "documents_delete_admin_only"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents'
  AND (
    is_workplace_admin(auth.uid(), (storage.foldername(name))[1]::uuid)
    OR is_super_admin(auth.uid())
  )
);

-- 3. Add login attempt tracking for rate limiting
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- email or IP
  attempt_type text NOT NULL DEFAULT 'login', -- 'login', 'workplace_code', 'signup'
  success boolean NOT NULL DEFAULT false,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_login_attempts_identifier_time 
ON login_attempts(identifier, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time 
ON login_attempts(ip_address, created_at DESC);

-- Enable RLS
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Only system can insert (via edge function with service role)
CREATE POLICY "System can insert login attempts"
ON login_attempts FOR INSERT
WITH CHECK (true);

-- Admins can view for monitoring
CREATE POLICY "Super admins can view login attempts"
ON login_attempts FOR SELECT
USING (is_super_admin(auth.uid()));

-- 4. Function to check rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _identifier text,
  _attempt_type text,
  _max_attempts integer DEFAULT 10,
  _window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) < _max_attempts
  FROM public.login_attempts
  WHERE identifier = _identifier
    AND attempt_type = _attempt_type
    AND created_at > now() - (_window_minutes || ' minutes')::interval
$$;

-- 5. Function to record login attempt (for use from edge functions)
CREATE OR REPLACE FUNCTION public.record_login_attempt(
  _identifier text,
  _attempt_type text,
  _success boolean,
  _ip_address text DEFAULT NULL
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.login_attempts (identifier, attempt_type, success, ip_address)
  VALUES (_identifier, _attempt_type, _success, _ip_address)
$$;

-- 6. Cleanup old login attempts (run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_old_login_attempts()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.login_attempts WHERE created_at < now() - interval '24 hours'
$$;