

# Super Admin: Arbetsplatshantering och Losenordsaterst allning

## Oversikt
Utoka SuperAdminView (WorkBuddy HQ) med tva nya funktioner:
1. **Skapa nya arbetsplatser** direkt fran portalen
2. **Per arbetsplats: hantera anstallda** (aterstalla losenord, se platskoder)

## Nuvarande situation
- SuperAdminView visar arbetsplatser med platskoder, men kan inte skapa nya
- WorkplaceDetailView visar data per arbetsplats men saknar losenordshantering
- Edge function `create-workplace-user` finns redan for att skapa anvandare
- RLS pa `workplaces`-tabellen tillater INTE insert/update (maste fixas via edge function eller migration)

## Plan

### 1. Lagg till "Skapa arbetsplats"-dialog i SuperAdminView
- En "Ny arbetsplats"-knapp i oversikten
- Dialog med falten: Namn, Foretagsnamn, Bransch, Arbetsplatstyp, Platskod
- Platskod auto-genereras men kan anpassas
- Skapar via en ny edge function `manage-workplace` (eftersom RLS blockerar INSERT pa workplaces-tabellen fran klienten)

### 2. Ny edge function: `manage-workplace`
- Verifierar att anroparen ar super_admin
- Stodjer tva operationer:
  - `create`: Skapar ny arbetsplats i workplaces-tabellen
  - `reset-password`: Aterstaller losenord for en anvandare via `supabase.auth.admin.updateUserById()`
- Anvander service role key (redan tillganglig)

### 3. Utoka WorkplaceDetailView med losenordshantering
- I anstallda-fliken: lagg till en "Aterstall losenord"-knapp per anvandare
- Oppnar en dialog dar super admin anger nytt losenord
- Anropar edge function `manage-workplace` med `reset-password`-operationen
- Visar bekraftelse efter lyckad aterstallning

### 4. Visa platskod tydligare
- Platskoden visas redan i bade SuperAdminView och WorkplaceDetailView
- Lagg till kopiera-knapp pa platskoden i WorkplaceDetailView-headern

## Tekniska detaljer

### Edge function: `manage-workplace`
```text
POST /manage-workplace
Authorization: Bearer <token>

// Skapa arbetsplats:
{
  "action": "create",
  "name": "Gym Solna",
  "company_name": "FitLife AB",
  "industry": "Halsa & Fitness",
  "workplace_type": "Gym",
  "workplace_code": "FITSOLNA"  // valfritt, auto-genereras annars
}

// Aterstalla losenord:
{
  "action": "reset-password",
  "user_id": "uuid",
  "new_password": "nyttlosenord123"
}
```

### Komponenter som andras
- `SuperAdminView.tsx` -- lagg till "Ny arbetsplats"-knapp + dialog
- `WorkplaceDetailView.tsx` -- lagg till losenordsknapp per anvandare i anstallda-tabellen
- Ny fil: `supabase/functions/manage-workplace/index.ts`

### Databasandringar
Inga migrationer behovs -- edge function anvander service role som kringgar RLS.

