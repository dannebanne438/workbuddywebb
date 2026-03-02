
-- Finance Income (Invoices)
CREATE TABLE public.finance_income (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workplace_id uuid NOT NULL REFERENCES public.workplaces(id) ON DELETE CASCADE,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  customer_name text NOT NULL,
  invoice_number text,
  service_description text,
  amount_excl_vat numeric(12,2) NOT NULL DEFAULT 0,
  vat_rate numeric(5,2) NOT NULL DEFAULT 25.00,
  vat_amount numeric(12,2) GENERATED ALWAYS AS (amount_excl_vat * vat_rate / 100) STORED,
  amount_incl_vat numeric(12,2) GENERATED ALWAYS AS (amount_excl_vat * (1 + vat_rate / 100)) STORED,
  is_paid boolean NOT NULL DEFAULT false
);

ALTER TABLE public.finance_income ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin full access on finance_income" ON public.finance_income FOR ALL USING (is_super_admin(auth.uid()));
CREATE POLICY "Workplace admin can view finance_income" ON public.finance_income FOR SELECT USING (is_workplace_admin(auth.uid(), workplace_id));
CREATE POLICY "Workplace admin can manage finance_income" ON public.finance_income FOR ALL USING (is_workplace_admin(auth.uid(), workplace_id));

-- Finance Expenses
CREATE TABLE public.finance_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workplace_id uuid NOT NULL REFERENCES public.workplaces(id) ON DELETE CASCADE,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  supplier_name text NOT NULL,
  category text,
  description text,
  amount_excl_vat numeric(12,2) NOT NULL DEFAULT 0,
  vat_rate numeric(5,2) NOT NULL DEFAULT 25.00,
  vat_amount numeric(12,2) GENERATED ALWAYS AS (amount_excl_vat * vat_rate / 100) STORED,
  amount_incl_vat numeric(12,2) GENERATED ALWAYS AS (amount_excl_vat * (1 + vat_rate / 100)) STORED,
  is_personal_withdrawal boolean NOT NULL DEFAULT false,
  is_paid boolean NOT NULL DEFAULT false,
  receipt_id uuid
);

ALTER TABLE public.finance_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin full access on finance_expenses" ON public.finance_expenses FOR ALL USING (is_super_admin(auth.uid()));
CREATE POLICY "Workplace admin can manage finance_expenses" ON public.finance_expenses FOR ALL USING (is_workplace_admin(auth.uid(), workplace_id));

-- Finance Receipts
CREATE TABLE public.finance_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workplace_id uuid NOT NULL REFERENCES public.workplaces(id) ON DELETE CASCADE,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  receipt_date date,
  supplier_name text,
  amount numeric(12,2),
  vat_amount numeric(12,2),
  category text,
  image_url text NOT NULL,
  ai_parsed_data jsonb,
  is_processed boolean NOT NULL DEFAULT false
);

ALTER TABLE public.finance_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin full access on finance_receipts" ON public.finance_receipts FOR ALL USING (is_super_admin(auth.uid()));
CREATE POLICY "Workplace admin can manage finance_receipts" ON public.finance_receipts FOR ALL USING (is_workplace_admin(auth.uid(), workplace_id));

-- Finance Settings (per workplace)
CREATE TABLE public.finance_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workplace_id uuid NOT NULL UNIQUE REFERENCES public.workplaces(id) ON DELETE CASCADE,
  vat_account_deposited numeric(12,2) NOT NULL DEFAULT 0,
  default_vat_rate numeric(5,2) NOT NULL DEFAULT 25.00,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.finance_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin full access on finance_settings" ON public.finance_settings FOR ALL USING (is_super_admin(auth.uid()));
CREATE POLICY "Workplace admin can manage finance_settings" ON public.finance_settings FOR ALL USING (is_workplace_admin(auth.uid(), workplace_id));

-- Finance VAT Deposits
CREATE TABLE public.finance_vat_deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workplace_id uuid NOT NULL REFERENCES public.workplaces(id) ON DELETE CASCADE,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  deposit_date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric(12,2) NOT NULL,
  note text
);

ALTER TABLE public.finance_vat_deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin full access on finance_vat_deposits" ON public.finance_vat_deposits FOR ALL USING (is_super_admin(auth.uid()));
CREATE POLICY "Workplace admin can manage finance_vat_deposits" ON public.finance_vat_deposits FOR ALL USING (is_workplace_admin(auth.uid(), workplace_id));

-- Triggers for updated_at
CREATE TRIGGER update_finance_income_updated_at BEFORE UPDATE ON public.finance_income FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_finance_expenses_updated_at BEFORE UPDATE ON public.finance_expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_finance_settings_updated_at BEFORE UPDATE ON public.finance_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
