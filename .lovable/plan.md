

# Säkerhetsfix för WorkBuddy

## Sammanfattning
Vi kommer att skydda känslig data i `workplaces` och `invite_codes`-tabellerna genom att ersätta de öppna RLS-policyerna med säkra verifieringsfunktioner. Login-flödet fortsätter fungera - men utan att exponera all data publikt.

## Vad som fixas

| Problem | Nuvarande risk | Lösning |
|---------|---------------|---------|
| **Arbetsplatser publikt läsbara** | Konkurrenter kan se alla företagsnamn, priser och inställningar | Endast verifiera platskod - inte läsa all data |
| **Inbjudningskoder publikt läsbara** | Vem som helst kan lista alla aktiva koder | Endast verifiera enskild kod |
| **Läckt lösenordsskydd av** | Användare kan välja komprometterade lösenord | Aktivera HaveIBeenPwned-kontroll |

## Implementationsplan

### Steg 1: Skapa säkra verifieringsfunktioner

Två nya databasfunktioner som returnerar **endast nödvändig data**:

**`verify_workplace_code(code)`**
- Input: platskod (t.ex. "WBPRIX8")
- Output: `{id, name, company_name}` eller `null`
- Körs som `SECURITY DEFINER` - bypasses RLS säkert

**`verify_invite_code(code)`**
- Input: inbjudningskod
- Output: `{workplace_id, name}` eller `null`
- Ökar `uses_count` automatiskt vid lyckad verifiering

### Steg 2: Uppdatera RLS-policyer

**Workplaces-tabellen:**
- ❌ Ta bort: "Anyone can verify workplace codes" (`USING (true)`)
- ✅ Lägg till: Endast inloggade användare kan se sin egen arbetsplats
- ✅ Lägg till: Super admin kan se alla

**Invite_codes-tabellen:**
- ❌ Ta bort: "Anyone can verify invite codes" (`USING (true)`)
- ✅ Behåll: Workplace admin kan hantera koder (redan finns)

### Steg 3: Uppdatera Login-komponenten

Ändra från direkta databasanrop till att använda de nya säkra funktionerna:

```text
Före: supabase.from("workplaces").select("*").eq("workplace_code", code)
Efter: supabase.rpc("verify_workplace_code", { code })
```

### Steg 4: Aktivera läckt lösenordsskydd

Aktivera HaveIBeenPwned-integrationen så att användare varnas om de försöker använda ett komprometterat lösenord.

---

## Teknisk detalj

### Databasmigration

```sql
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

-- Invite codes behåller admin-policyn (redan korrekt)
```

### Filer som uppdateras

| Fil | Ändring |
|-----|---------|
| `src/pages/Login.tsx` | Använd `rpc("verify_workplace_code")` istället för direkt SELECT |
| Databasmigration | Skapa funktioner + uppdatera RLS-policyer |

---

## Resultat efter implementation

✅ Obehöriga kan **inte** lista alla arbetsplatser eller inbjudningskoder  
✅ Login-flödet fungerar som tidigare (via säkra funktioner)  
✅ Inloggade användare ser endast sin egen arbetsplats  
✅ Admins behåller full hantering av koder  
✅ Komprometterade lösenord blockeras  

