-- Fix security warnings

-- 1. Fix function search_path for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Fix overly permissive INSERT policy on contact_leads
-- First drop the old policy
DROP POLICY IF EXISTS "Anyone can submit leads" ON public.contact_leads;

-- Create a more specific policy that still allows public submissions
-- but validates required fields are present
CREATE POLICY "Public can submit contact leads"
  ON public.contact_leads FOR INSERT
  WITH CHECK (
    company IS NOT NULL 
    AND contact_person IS NOT NULL 
    AND email IS NOT NULL
  );