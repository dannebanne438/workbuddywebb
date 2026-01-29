import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const workplaceId = "b1c2d3e4-f5a6-7890-bcde-fa2345678901";
    const workplaceCode = "BYGGDEMO";
    
    // Create workplace
    const { error: workplaceError } = await supabase
      .from("workplaces")
      .upsert({
        id: workplaceId,
        name: "Byggplats Solna 12",
        company_name: "Bygg & Anlägg AB",
        industry: "Bygg & Anläggning",
        workplace_type: "Byggarbetsplats",
        workplace_code: workplaceCode,
        settings: {
          hourly_rate: 245,
          ob_rate: 75,
          max_hours_per_week: 50,
          min_rest_hours: 11,
          projects: [
            {
              id: "proj-1",
              name: "Bostadsprojekt – Solna 12",
              status: "active",
              progress: 45,
              risk_level: "medium",
              next_milestone: "Stomme klar",
              milestones: [
                { name: "Grundläggning", status: "done", date: "2025-01-10" },
                { name: "Stomme klar", status: "in_progress", date: "2025-02-15" },
                { name: "Tak & Fasad", status: "pending", date: "2025-03-20" },
                { name: "Inredning", status: "pending", date: "2025-05-01" },
                { name: "Slutbesiktning", status: "pending", date: "2025-06-15" }
              ],
              blockers: [
                { issue: "Leveransförsening på prefab-element", owner: "Johan L", created: "2025-01-25" }
              ]
            },
            {
              id: "proj-2",
              name: "Kontorsanpassning – Sundbyberg",
              status: "active",
              progress: 70,
              risk_level: "low",
              next_milestone: "El & VVS klart",
              milestones: [
                { name: "Rivning", status: "done", date: "2025-01-05" },
                { name: "El & VVS", status: "in_progress", date: "2025-02-01" },
                { name: "Ytskikt", status: "pending", date: "2025-02-20" },
                { name: "Slutstädning", status: "pending", date: "2025-03-01" }
              ],
              blockers: []
            },
            {
              id: "proj-3",
              name: "Fasaderenovering – Vasastan",
              status: "blocked",
              progress: 25,
              risk_level: "high",
              next_milestone: "Ställning uppsatt",
              milestones: [
                { name: "Planering & Tillstånd", status: "done", date: "2025-01-08" },
                { name: "Ställning uppsatt", status: "blocked", date: "2025-02-01" },
                { name: "Putslagning", status: "pending", date: "2025-03-15" },
                { name: "Målning", status: "pending", date: "2025-04-20" }
              ],
              blockers: [
                { issue: "Väntar på kommunalt tillstånd för gatuavstängning", owner: "Maria S", created: "2025-01-20" }
              ]
            }
          ]
        }
      }, { onConflict: "id" });

    if (workplaceError) {
      console.error("Workplace error:", workplaceError);
    }

    // Demo users - 10 construction workers
    const demoUsers = [
      {
        email: "platschef@byggdemo.test",
        password: "Bygg123!",
        full_name: "Johan Lindqvist",
        role: "super_admin" as const,
        profile_role: "Platschef"
      },
      {
        email: "arbetsledare@byggdemo.test",
        password: "Bygg123!",
        full_name: "Maria Svensson",
        role: "workplace_admin" as const,
        profile_role: "Arbetsledare"
      },
      {
        email: "snickare1@byggdemo.test",
        password: "Bygg123!",
        full_name: "Erik Johansson",
        role: "employee" as const,
        profile_role: "Snickare"
      },
      {
        email: "snickare2@byggdemo.test",
        password: "Bygg123!",
        full_name: "Anna Karlsson",
        role: "employee" as const,
        profile_role: "Snickare"
      },
      {
        email: "snickare3@byggdemo.test",
        password: "Bygg123!",
        full_name: "Per Andersson",
        role: "employee" as const,
        profile_role: "Snickare"
      },
      {
        email: "betong1@byggdemo.test",
        password: "Bygg123!",
        full_name: "Anders Nilsson",
        role: "employee" as const,
        profile_role: "Betongarbetare"
      },
      {
        email: "betong2@byggdemo.test",
        password: "Bygg123!",
        full_name: "Karin Bergström",
        role: "employee" as const,
        profile_role: "Betongarbetare"
      },
      {
        email: "elektriker@byggdemo.test",
        password: "Bygg123!",
        full_name: "Mikael Öberg",
        role: "employee" as const,
        profile_role: "Elektriker (UE)"
      },
      {
        email: "maskinforare@byggdemo.test",
        password: "Bygg123!",
        full_name: "Lars Eriksson",
        role: "employee" as const,
        profile_role: "Maskinförare"
      },
      {
        email: "praktikant@byggdemo.test",
        password: "Bygg123!",
        full_name: "Sofia Lund",
        role: "employee" as const,
        profile_role: "Byggpraktikant"
      }
    ];

    const userResults = [];

    for (const user of demoUsers) {
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === user.email);
      
      if (existingUser) {
        userResults.push({ email: user.email, status: "already exists" });
        continue;
      }

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { full_name: user.full_name, role: user.profile_role }
      });

      if (authError) {
        userResults.push({ email: user.email, status: "error", error: authError.message });
        continue;
      }

      const userId = authData.user.id;

      await supabase.from("profiles").insert({
        id: userId,
        email: user.email,
        full_name: user.full_name,
        workplace_id: workplaceId
      });

      await supabase.from("user_roles").insert({
        user_id: userId,
        role: user.role,
        workplace_id: user.role === "super_admin" ? null : workplaceId
      });

      userResults.push({ email: user.email, status: "created", userId });
    }

    // Create contacts
    const contacts = [
      { name: "Johan Lindqvist", role: "Platschef", phone: "070-123 45 67", is_emergency: true },
      { name: "Maria Svensson", role: "Arbetsledare", phone: "070-234 56 78", is_emergency: true },
      { name: "Byggkonsult AB", role: "Konstruktör", phone: "08-555 12 34", email: "kontakt@byggkonsult.se" },
      { name: "El-Säkerhet AB", role: "Elanläggning", phone: "08-666 22 33", email: "jour@elsak.se", is_emergency: true },
      { name: "Räddningstjänsten", role: "Nödnummer", phone: "112", is_emergency: true },
      { name: "Arbetsmiljöverket", role: "Myndighet", phone: "010-730 90 00" },
      { name: "Prefab Leverans AB", role: "Leverantör", phone: "08-777 88 99", email: "order@prefab.se" }
    ];

    for (const contact of contacts) {
      await supabase.from("contacts").upsert({
        ...contact,
        workplace_id: workplaceId
      }, { onConflict: "id", ignoreDuplicates: true });
    }

    // Create important times
    const importantTimes = [
      { time_value: "06:30", description: "Arbetsplats öppnar, säkerhetskoll", sort_order: 1 },
      { time_value: "07:00", description: "Arbetsstart – morgonmöte/briefing", sort_order: 2 },
      { time_value: "09:30", description: "Fikarast (15 min)", sort_order: 3 },
      { time_value: "12:00", description: "Lunchrast", sort_order: 4 },
      { time_value: "14:30", description: "Fikarast (15 min)", sort_order: 5 },
      { time_value: "16:00", description: "Arbetsslut – städning & avslutsrapport", sort_order: 6 },
      { time_value: "16:30", description: "Arbetsplats stänger", sort_order: 7 }
    ];

    for (const time of importantTimes) {
      await supabase.from("important_times").upsert({
        ...time,
        workplace_id: workplaceId
      }, { onConflict: "id", ignoreDuplicates: true });
    }

    // Create routines
    const routines = [
      {
        title: "Daglig säkerhetskontroll",
        category: "Säkerhet",
        content: `## Daglig säkerhetskontroll

### Innan arbetsstart
1. Kontrollera väder och vindförhållanden
2. Inspektera ställningar och fallskydd
3. Verifiera att alla har rätt PPE (hjälm, skyddsskor, väst)
4. Kontrollera elsäkerhet vid våta förhållanden

### Under dagen
- Rapportera risker omedelbart till arbetsledare
- Håll arbetsytan ren och fri från hinder
- Följ markerade gångvägar

### Vid arbetsslut
- Säkra alla maskiner och verktyg
- Rapportera avvikelser i dagbok
- Låt ej obehöriga på platsen`
      },
      {
        title: "Arbete på höjd",
        category: "Säkerhet",
        content: `## Rutin: Arbete på höjd

### Krav
- Godkänd utbildning för arbete på höjd
- Fallskyddsutrustning kontrollerad senast 12 mån
- Skriftligt arbetstillstånd för höjder > 2m

### Före start
1. Inspektera ställning/lift
2. Kontrollera fallskyddssele
3. Säkra verktyg mot fall
4. Markera område nedanför

### Förbjudet
- Arbeta ensam på höjd
- Arbeta vid vind > 15 m/s
- Använda stege som arbetsplattform`
      },
      {
        title: "Heta arbeten",
        category: "Säkerhet",
        content: `## Rutin: Heta arbeten

### Behörighetskrav
- Giltigt certifikat för heta arbeten
- Tillstånd från platschef/arbetsledare

### Innan start
1. Fyll i tillståndsformulär
2. Avlägsna brännbart material 10m runt arbetsplatsen
3. Placera ut brandsläckare
4. Utse brandvakt

### Under arbete
- Håll brandvakt hela tiden
- Kontrollera kontinuerligt

### Efter arbete
- Brandvakt minst 1 timme efter avslut
- Dokumentera i loggbok`
      },
      {
        title: "Leveransmottagning",
        category: "Logistik",
        content: `## Rutin: Leveransmottagning

### Före leverans
1. Bekräfta leveranstid med leverantör
2. Säkerställ fri avlastningsyta
3. Boka lyftkran/truck om behövs

### Vid mottagning
1. Kontrollera följesedel mot order
2. Inspektera gods för transportskador
3. Fotografera skador
4. Signera följesedel med anmärkning vid avvikelse

### Dokumentation
- Spara följesedel
- Rapportera avvikelser samma dag
- Uppdatera materiallista`
      },
      {
        title: "Morgonmöte",
        category: "Planering",
        content: `## Rutin: Morgonmöte

### Tid
Varje arbetsdag kl 07:00 (ca 10-15 min)

### Deltagare
Alla på plats + arbetsledare

### Agenda
1. Genomgång av dagens arbete per lag
2. Säkerhetsinformation – risker idag
3. Leveranser och transporter
4. Samordning mellan yrkesgrupper
5. Frågor och synpunkter

### Dokumentation
Korta noteringar i dagsloggen`
      },
      {
        title: "Avvikelserapportering",
        category: "Kvalitet",
        content: `## Rutin: Avvikelserapportering

### När rapportera
- Arbetsskada eller tillbud
- Kvalitetsavvikelse
- Leveransproblem
- Säkerhetsrisk

### Hur rapportera
1. Muntligt till arbetsledare omedelbart
2. Skriftligt i avvikelsesystem inom 24h

### Innehåll
- Vad hände
- När och var
- Vilka var inblandade
- Åtgärder vidtagna
- Förslag på förebyggande åtgärd`
      }
    ];

    for (const routine of routines) {
      await supabase.from("routines").insert({
        ...routine,
        workplace_id: workplaceId
      });
    }

    // Create checklists
    const checklists = [
      {
        title: "Daglig säkerhetschecklista",
        description: "Ska fyllas i varje morgon innan arbetsstart",
        is_template: true,
        items: [
          { text: "Kontrollerat väderförhållanden", checked: false },
          { text: "Inspekterat ställningar och fallskydd", checked: false },
          { text: "Alla har hjälm, skyddsskor och synväst", checked: false },
          { text: "Första hjälpen-utrustning tillgänglig", checked: false },
          { text: "Brandsläckare på plats och kontrollerad", checked: false },
          { text: "Tillfartvägar fria för räddningsfordon", checked: false },
          { text: "Elcentraler kontrollerade", checked: false },
          { text: "Morgonmöte genomfört", checked: false }
        ]
      },
      {
        title: "Checklista: Arbete på höjd",
        description: "Obligatorisk före varje arbetsmoment på höjd",
        is_template: true,
        items: [
          { text: "Arbetstillstånd utfärdat", checked: false },
          { text: "Fallskyddssele kontrollerad (datum inom 12 mån)", checked: false },
          { text: "Ställning/lift inspekterad", checked: false },
          { text: "Verktyg säkrade mot fall", checked: false },
          { text: "Område nedanför avspärrat", checked: false },
          { text: "Kollega informerad (ej arbeta ensam)", checked: false },
          { text: "Vindstyrka < 15 m/s", checked: false }
        ]
      },
      {
        title: "Checklista: Heta arbeten",
        description: "Svetsning, skärning, slipning m.m.",
        is_template: true,
        items: [
          { text: "Tillståndsformulär ifyllt och signerat", checked: false },
          { text: "Certifikat för heta arbeten kontrollerat", checked: false },
          { text: "Brännbart material avlägsnat 10m", checked: false },
          { text: "Brandsläckare placerad inom 5m", checked: false },
          { text: "Brandvakt utsedd", checked: false },
          { text: "Ventilation säkerställd", checked: false }
        ]
      },
      {
        title: "Leveranskontroll",
        description: "Vid mottagning av material",
        is_template: true,
        items: [
          { text: "Följesedel mottagen", checked: false },
          { text: "Antal kollin stämmer", checked: false },
          { text: "Visuell inspektion – inga transportskador", checked: false },
          { text: "Material stämmer mot order", checked: false },
          { text: "Gods placerat på avsedd plats", checked: false },
          { text: "Fotograferat och dokumenterat avvikelser", checked: false }
        ]
      },
      {
        title: "Arbetsslut – daglig",
        description: "Innan man lämnar arbetsplatsen",
        is_template: true,
        items: [
          { text: "Verktyg och maskiner säkrade", checked: false },
          { text: "Arbetsyta städad", checked: false },
          { text: "El avstängd där det går", checked: false },
          { text: "Rapporterat avvikelser", checked: false },
          { text: "Grind låst", checked: false }
        ]
      }
    ];

    for (const checklist of checklists) {
      await supabase.from("checklists").insert({
        ...checklist,
        workplace_id: workplaceId
      });
    }

    // Create demo prompts for construction
    const demoPrompts = [
      { prompt_text: "Vilka kan jobba imorgon?", category: "Schema", sort_order: 1 },
      { prompt_text: "Skapa schemaförslag för nästa vecka", category: "Schema", sort_order: 2 },
      { prompt_text: "Vad är dagens plan för Solna 12?", category: "Planering", sort_order: 3 },
      { prompt_text: "Visa objektvy – vad är blockerat?", category: "Progress", sort_order: 4 },
      { prompt_text: "Skapa checklista för arbete på höjd", category: "Säkerhet", sort_order: 5 },
      { prompt_text: "Vilka säkerhetsrutiner gäller för heta arbeten?", category: "Säkerhet", sort_order: 6 },
      { prompt_text: "Hur rapporterar jag en avvikelse?", category: "Kvalitet", sort_order: 7 },
      { prompt_text: "Vem kontaktar jag vid nödsituation?", category: "Kontakt", sort_order: 8 }
    ];

    for (const prompt of demoPrompts) {
      await supabase.from("demo_prompts").insert({
        ...prompt,
        workplace_id: workplaceId
      });
    }

    // Create some sample schedules for the coming week
    const today = new Date();
    const scheduleData = [];
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      if (date.getDay() === 0 || date.getDay() === 6) continue; // Skip weekends
      
      const dateStr = date.toISOString().split("T")[0];
      
      scheduleData.push(
        { shift_date: dateStr, start_time: "07:00", end_time: "16:00", user_name: "Johan Lindqvist", role: "Platschef" },
        { shift_date: dateStr, start_time: "07:00", end_time: "16:00", user_name: "Maria Svensson", role: "Arbetsledare" },
        { shift_date: dateStr, start_time: "07:00", end_time: "16:00", user_name: "Erik Johansson", role: "Snickare" },
        { shift_date: dateStr, start_time: "07:00", end_time: "16:00", user_name: "Anna Karlsson", role: "Snickare" },
        { shift_date: dateStr, start_time: "07:00", end_time: "16:00", user_name: "Anders Nilsson", role: "Betong" }
      );
    }

    for (const shift of scheduleData) {
      await supabase.from("schedules").insert({
        ...shift,
        workplace_id: workplaceId,
        is_approved: true
      });
    }

    // Create announcements
    const announcements = [
      {
        title: "Leveransförsening – Prefab-element",
        content: "**OBS!** Leveransen av prefab-vägglement (Solna 12) är försenad med ca 1 vecka. Ny ETA: 5 februari.\n\nPåverkar: Stommontering plan 3-4.\n\nÅtgärd: Vi omplanerar så att VVS-arbeten på plan 1-2 körs parallellt. Mer info på morgonmötet.",
        is_pinned: true
      },
      {
        title: "Säkerhetsinformation: Halkrisk",
        content: "Vintern är här! Tänk på:\n\n- Halkbekämpning sker kl 06:30\n- Extra försiktighet vid ramper och trappor\n- Rapportera isbeläggning till arbetsledare\n- Använd broddar om det behövs",
        is_pinned: false
      },
      {
        title: "Ny elektriker på plats",
        content: "Från och med måndag har vi **Mikael Öberg** från El-Säkerhet AB på plats för elinstallation på Sundbybergsprojektet.\n\nKontakt: 070-567 89 01",
        is_pinned: false
      }
    ];

    for (const announcement of announcements) {
      await supabase.from("announcements").insert({
        ...announcement,
        workplace_id: workplaceId
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      workplaceCode,
      workplaceId,
      users: userResults,
      message: "Byggdemo skapad! Logga in med platschef@byggdemo.test / Bygg123!"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
