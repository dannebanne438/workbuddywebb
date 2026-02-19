

# Utöka WorkBuddy AI till ett HQ-verktyg

## Vad som redan finns
WorkBuddy AI kan idag hantera: schema, checklistor, rutiner, nyheter, avvikelser och certifikat via tool calling (AI anropar funktioner i backend).

## Vad vi kan lägga till

### 1. Hantera arbetsplatser via chatten
Nya AI-verktyg i `workbuddy-chat` edge function:
- **create_workplace** - Skapa ny arbetsplats (namn, företag, bransch, typ)
- **update_workplace_settings** - Ändra inställningar (timlön, OB, max timmar, etc.)
- **toggle_features** - Slå av/på moduler (schema, certifikat, teamchatt etc.)
- **list_workplaces** - Lista alla arbetsplatser med statistik

Dessa anropar befintliga `manage-workplace` edge function-logiken internt.

### 2. Hantera användare via chatten
Nya AI-verktyg:
- **create_user** - Skapa ny användare (e-post, namn, lösenord, roll, arbetsplats)
- **list_users** - Lista personal per arbetsplats
- **change_user_role** - Ändra roll (anställd/admin)
- **reset_user_password** - Återställa lösenord
- **move_user_to_workplace** - Flytta användare mellan arbetsplatser

Dessa använder `supabaseAdmin` (service role) och är strikt begränsade till super_admin.

### 3. Konfigurera systemet via chatten
Nya AI-verktyg:
- **update_ai_prompt** - Ändra arbetsplatsens AI-prompt
- **manage_demo_prompts** - Skapa/redigera/ta bort demoprompter
- **manage_contacts** - Lägga till/ta bort kontakter
- **manage_important_times** - Ändra viktiga tider
- **manage_invite_codes** - Skapa/inaktivera inbjudningskoder

### 4. Kodgenerering - Begränsning
Att faktiskt generera kod och skapa nya vyer/funktioner som Lovable gör kräver en fullständig utvecklingsmiljö med filsystem, deployment-pipeline och versionshantering. Det kan vi inte replikera i en chattbot.

**Vad vi KAN göra istället:**
- AI:n kan skapa och konfigurera nya **checklistmallar**, **rutindokument**, **arbetsplatsregler** etc. - alltså "funktioner" i verksamhetsmening
- AI:n kan anpassa sitt eget beteende per arbetsplats via custom prompts

## Teknisk implementation

### Steg 1: Utöka tool-definitionen i `workbuddy-chat/index.ts`
- Lägga till ca 12 nya tool-definitioner med parametrar
- Alla nya verktyg kräver `super_admin`-roll

### Steg 2: Implementera `executeToolCall` för nya verktyg
- Arbetsplatshantering: direkt CRUD via `supabaseAdmin`
- Användarhantering: använda `supabaseAdmin.auth.admin` API:et
- Konfiguration: uppdatera `workplaces.settings` JSONB-fältet

### Steg 3: Uppdatera systemprompt
- Lägga till instruktioner för super_admin om nya verktyg
- Lista tillgängliga arbetsplatser i kontexten
- Bekräftelsekrav gäller även här

### Steg 4: Uppdatera ChatView UI
- Nya action-ikoner för arbetsplats/användare/konfigurationsändringar
- Visuella bekräftelser för admin-åtgärder

## Säkerhet
- Alla nya verktyg kontrolleras med `isSuperAdmin`-flaggan
- Befintlig "Confirmation First"-policy gäller
- Alla operationer loggas via befintlig konversationshistorik

## Sammanfattning
Vi kan göra WorkBuddy till en kraftfull HQ-styrcentral via chatten - skapa arbetsplatser, hantera användare, konfigurera moduler och inställningar. Det enda vi inte kan göra är att generera faktisk appkod som Lovable.

