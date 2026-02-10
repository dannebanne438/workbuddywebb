
# Funktionshantering per arbetsplats

## Oversikt
Lagg till mojlighet for super admin att aktivera/inaktivera specifika moduler (funktioner) per arbetsplats. Till exempel kan ett sakerhetsbolag stanga av "Certifikat" medan ett gym har det aktiverat. Dessa installningar sparas i arbetsplatsens `settings`-kolumn (JSON) och styr vilka menyval som syns i sidomenyn.

## Hur det fungerar

1. **Ny flik "Funktioner" i WorkplaceDetailView** -- en lista med alla tillgangliga moduler (Schema, Checklistor, Rutiner, Nyheter, Avvikelser, Certifikat, Teamchatt, Dashboard) dar varje modul har en toggle (switch) for att aktivera/inaktivera.

2. **Sparas i settings-kolumnen** -- nar super admin andrar en toggle anropas edge function `manage-workplace` med action `update-settings` och sparar t.ex.:
```text
settings: {
  "custom_prompt": "...",
  "enabled_features": ["schedule", "checklists", "routines", "announcements", "incidents", "team-chat", "dashboard"]
}
```
Nar `enabled_features` saknas (befintliga arbetsplatser) aktiveras alla funktioner som standard.

3. **Sidomenyn filtreras** -- `PortalSidebar`, `MobileNav` och `MobileBottomNav` laser `activeWorkplace.settings.enabled_features` och doljer menyval som inte ar aktiverade. Super admins ser alltid alla menyval.

4. **PortalContent blockerar vy** -- om en anvandare forsaker navigera till en inaktiverad funktion visas ett meddelande ("Denna funktion ar inte aktiverad for din arbetsplats").

## Tekniska detaljer

### Komponenter som andras

**Ny komponent:** `src/components/portal/superadmin/WorkplaceFeatureManager.tsx`
- Lista med alla moduler, varje med namn, ikon och Switch-komponent
- Anropar `manage-workplace` edge function med `update-settings` (redan implementerad)
- Default: alla features aktiverade

**`WorkplaceDetailView.tsx`**
- Lagg till ny TabsTrigger "Funktioner" med Settings-ikon
- Renderar WorkplaceFeatureManager-komponenten

**`PortalSidebar.tsx`**
- Lasa `activeWorkplace?.settings?.enabled_features` fran WorkplaceContext
- Filtrera `navItems` och `adminItems` baserat pa enabled_features
- Om enabled_features ar `undefined`/`null`, visa alla (bakatkompabilitet)

**`MobileBottomNav.tsx` och `MobileNav.tsx`**
- Samma filtrering som PortalSidebar

**`WorkplaceContext.tsx`**
- Kontrollera att `settings` hamtas och ar tillgangligt via kontexten (verifiera att `workplaces`-queryn inkluderar settings)

### Feature-ID-mappning
```text
Modul             | Feature ID
------------------|------------
Dashboard         | dashboard
WorkBuddy (chat)  | camera (alltid aktiv, kan inte inaktiveras)
Teamchatt         | team-chat
Schema            | schedule
Checklistor       | checklists
Rutiner           | routines
Nyheter           | announcements
Avvikelser        | incidents
Certifikat        | certificates
Personal          | employees
```

### Ingen databasmigration kravs
Allt sparas i den befintliga `settings` JSONB-kolumnen via den redan existerande `update-settings`-operationen i `manage-workplace` edge function.
