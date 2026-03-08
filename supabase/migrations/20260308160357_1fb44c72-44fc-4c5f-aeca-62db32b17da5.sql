-- Add audit triggers to all security-sensitive tables that are missing them

-- user_roles - critical for role change tracking
CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- profiles - track profile changes
CREATE TRIGGER audit_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- documents - track document uploads/deletions
CREATE TRIGGER audit_documents
  AFTER INSERT OR UPDATE OR DELETE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- photos - track photo uploads/deletions
CREATE TRIGGER audit_photos
  AFTER INSERT OR UPDATE OR DELETE ON public.photos
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- finance_income - track financial changes
CREATE TRIGGER audit_finance_income
  AFTER INSERT OR UPDATE OR DELETE ON public.finance_income
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- finance_expenses - track expense changes
CREATE TRIGGER audit_finance_expenses
  AFTER INSERT OR UPDATE OR DELETE ON public.finance_expenses
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- finance_receipts - track receipt changes
CREATE TRIGGER audit_finance_receipts
  AFTER INSERT OR UPDATE OR DELETE ON public.finance_receipts
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- invite_codes - track invite code creation/deactivation
CREATE TRIGGER audit_invite_codes
  AFTER INSERT OR UPDATE OR DELETE ON public.invite_codes
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- workplaces - track workplace config changes
CREATE TRIGGER audit_workplaces
  AFTER INSERT OR UPDATE OR DELETE ON public.workplaces
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- direct_messages - track DM deletions (important for compliance)
CREATE TRIGGER audit_direct_messages
  AFTER INSERT OR DELETE ON public.direct_messages
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- team_messages - track team message deletions
CREATE TRIGGER audit_team_messages
  AFTER INSERT OR DELETE ON public.team_messages
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- admin_requests - track admin request status changes
CREATE TRIGGER audit_admin_requests
  AFTER INSERT OR UPDATE OR DELETE ON public.admin_requests
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- notifications - track notification creation
CREATE TRIGGER audit_notifications
  AFTER INSERT OR DELETE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- finance_settings - track settings changes
CREATE TRIGGER audit_finance_settings
  AFTER INSERT OR UPDATE OR DELETE ON public.finance_settings
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- invoice_settings - track invoice config changes
CREATE TRIGGER audit_invoice_settings
  AFTER INSERT OR UPDATE OR DELETE ON public.invoice_settings
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- finance_vat_deposits - track VAT deposits
CREATE TRIGGER audit_finance_vat_deposits
  AFTER INSERT OR UPDATE OR DELETE ON public.finance_vat_deposits
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();