-- Säker verifieringsfunktion för arbetsplatskoder
CREATE OR REPLACE FUNCTION public.verify_workplace_code(_code text)
RETURNS TABLE(id uuid, name text, company_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT w.id, w.name, w.company_name
  FROM public.workplaces w
  WHERE UPPER(w.workplace_code) = UPPER(_code)
  LIMIT 1
$$;

-- Säker verifieringsfunktion för inbjudningskoder
CREATE OR REPLACE FUNCTION public.verify_invite_code(_code text)
RETURNS TABLE(workplace_id uuid, name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT ic.workplace_id, ic.name
  FROM public.invite_codes ic
  WHERE ic.code = _code AND ic.status = 'active'
  LIMIT 1;
  
  -- Öka användningsräknaren om koden hittades
  IF FOUND THEN
    UPDATE public.invite_codes SET uses_count = uses_count + 1 WHERE code = _code;
  END IF;
END;
$$;

-- Ta bort osäkra policyer
DROP POLICY IF EXISTS "Anyone can verify workplace codes" ON public.workplaces;
DROP POLICY IF EXISTS "Anyone can verify invite codes" ON public.invite_codes;

-- Nya säkra policyer för workplaces
CREATE POLICY "Users can view own workplace"
  ON public.workplaces FOR SELECT
  USING (id = get_user_workplace_id(auth.uid()) OR is_super_admin(auth.uid()));