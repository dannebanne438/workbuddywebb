
-- Fix finance_income: drop restrictive, recreate as permissive
DROP POLICY IF EXISTS "Super admin full access on finance_income" ON public.finance_income;
DROP POLICY IF EXISTS "Workplace admin can manage finance_income" ON public.finance_income;
DROP POLICY IF EXISTS "Workplace admin can view finance_income" ON public.finance_income;

CREATE POLICY "Super admin full access on finance_income"
  ON public.finance_income FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Workplace admin can manage finance_income"
  ON public.finance_income FOR ALL
  TO authenticated
  USING (public.is_workplace_admin(auth.uid(), workplace_id))
  WITH CHECK (public.is_workplace_admin(auth.uid(), workplace_id));

-- Fix finance_expenses
DROP POLICY IF EXISTS "Super admin full access on finance_expenses" ON public.finance_expenses;
DROP POLICY IF EXISTS "Workplace admin can manage finance_expenses" ON public.finance_expenses;

CREATE POLICY "Super admin full access on finance_expenses"
  ON public.finance_expenses FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Workplace admin can manage finance_expenses"
  ON public.finance_expenses FOR ALL
  TO authenticated
  USING (public.is_workplace_admin(auth.uid(), workplace_id))
  WITH CHECK (public.is_workplace_admin(auth.uid(), workplace_id));

-- Fix finance_receipts
DROP POLICY IF EXISTS "Super admin full access on finance_receipts" ON public.finance_receipts;
DROP POLICY IF EXISTS "Workplace admin can manage finance_receipts" ON public.finance_receipts;

CREATE POLICY "Super admin full access on finance_receipts"
  ON public.finance_receipts FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Workplace admin can manage finance_receipts"
  ON public.finance_receipts FOR ALL
  TO authenticated
  USING (public.is_workplace_admin(auth.uid(), workplace_id))
  WITH CHECK (public.is_workplace_admin(auth.uid(), workplace_id));

-- Fix finance_settings
DROP POLICY IF EXISTS "Super admin full access on finance_settings" ON public.finance_settings;
DROP POLICY IF EXISTS "Workplace admin can manage finance_settings" ON public.finance_settings;

CREATE POLICY "Super admin full access on finance_settings"
  ON public.finance_settings FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Workplace admin can manage finance_settings"
  ON public.finance_settings FOR ALL
  TO authenticated
  USING (public.is_workplace_admin(auth.uid(), workplace_id))
  WITH CHECK (public.is_workplace_admin(auth.uid(), workplace_id));

-- Fix finance_vat_deposits
DROP POLICY IF EXISTS "Super admin full access on finance_vat_deposits" ON public.finance_vat_deposits;
DROP POLICY IF EXISTS "Workplace admin can manage finance_vat_deposits" ON public.finance_vat_deposits;

CREATE POLICY "Super admin full access on finance_vat_deposits"
  ON public.finance_vat_deposits FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Workplace admin can manage finance_vat_deposits"
  ON public.finance_vat_deposits FOR ALL
  TO authenticated
  USING (public.is_workplace_admin(auth.uid(), workplace_id))
  WITH CHECK (public.is_workplace_admin(auth.uid(), workplace_id));

-- Create invoice_settings table for storing bank details, logo etc.
CREATE TABLE IF NOT EXISTS public.invoice_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workplace_id uuid NOT NULL REFERENCES public.workplaces(id) ON DELETE CASCADE,
  company_name text,
  org_number text,
  address text,
  postal_code text,
  city text,
  phone text,
  email text,
  website text,
  bank_name text,
  bank_account text,
  bank_reference text,
  bg_number text,
  pg_number text,
  logo_url text,
  payment_terms_days integer DEFAULT 30,
  default_currency text DEFAULT 'SEK',
  footer_text text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workplace_id)
);

ALTER TABLE public.invoice_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin full access on invoice_settings"
  ON public.invoice_settings FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Workplace admin can manage invoice_settings"
  ON public.invoice_settings FOR ALL
  TO authenticated
  USING (public.is_workplace_admin(auth.uid(), workplace_id))
  WITH CHECK (public.is_workplace_admin(auth.uid(), workplace_id));
