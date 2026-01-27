import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const tools = [
  // Schedule tools
  {
    type: "function",
    function: {
      name: "create_schedule",
      description: "Create one or more work schedule shifts. Use this when the user wants to schedule shifts, add people to the schedule, or create a work roster.",
      parameters: {
        type: "object",
        properties: {
          shifts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                shift_date: { type: "string", description: "Date in YYYY-MM-DD format" },
                start_time: { type: "string", description: "Start time in HH:MM format" },
                end_time: { type: "string", description: "End time in HH:MM format" },
                user_name: { type: "string", description: "Name of the person" },
                role: { type: "string", description: "Role/position" },
                notes: { type: "string", description: "Optional notes" }
              },
              required: ["shift_date", "start_time", "end_time", "user_name"]
            }
          }
        },
        required: ["shifts"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_schedule",
      description: "Delete shifts from the schedule. Use when user wants to remove, cancel, or delete scheduled shifts. Can match by date, person name, or time.",
      parameters: {
        type: "object",
        properties: {
          shift_date: { type: "string", description: "Date in YYYY-MM-DD format to delete shifts for" },
          user_name: { type: "string", description: "Name of person whose shift to delete (optional)" },
          delete_all_for_date: { type: "boolean", description: "If true, delete ALL shifts for that date" }
        },
        required: ["shift_date"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_schedule",
      description: "Update an existing shift. Use when user wants to change time, person, or role for an existing shift.",
      parameters: {
        type: "object",
        properties: {
          shift_date: { type: "string", description: "Original date of the shift" },
          user_name: { type: "string", description: "Original person name to identify the shift" },
          new_start_time: { type: "string", description: "New start time (optional)" },
          new_end_time: { type: "string", description: "New end time (optional)" },
          new_user_name: { type: "string", description: "New person name (optional)" },
          new_role: { type: "string", description: "New role (optional)" },
          new_date: { type: "string", description: "New date if moving the shift (optional)" }
        },
        required: ["shift_date", "user_name"]
      }
    }
  },
  // Checklist tools
  {
    type: "function",
    function: {
      name: "create_checklist",
      description: "Create a new checklist with items. Use when user wants to create a task list, checklist, or todo list.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Checklist title" },
          description: { type: "string", description: "Optional description" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                text: { type: "string", description: "Item text" },
                checked: { type: "boolean", description: "Is item checked" }
              },
              required: ["text"]
            }
          },
          is_template: { type: "boolean", description: "If true, this is a reusable template" },
          for_date: { type: "string", description: "Date this checklist is for (YYYY-MM-DD)" }
        },
        required: ["title", "items"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_checklist",
      description: "Update an existing checklist by title. Use when user wants to add/remove items or change a checklist.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Title of checklist to update" },
          new_title: { type: "string", description: "New title (optional)" },
          new_description: { type: "string", description: "New description (optional)" },
          items: {
            type: "array",
            description: "New complete list of items (replaces existing)",
            items: {
              type: "object",
              properties: {
                text: { type: "string" },
                checked: { type: "boolean" }
              },
              required: ["text"]
            }
          }
        },
        required: ["title"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_checklist",
      description: "Delete a checklist by title.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Title of the checklist to delete" }
        },
        required: ["title"]
      }
    }
  },
  // Routine tools
  {
    type: "function",
    function: {
      name: "create_routine",
      description: "Create a new routine/procedure document. Use when user wants to add a new routine, SOP, or procedure.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Routine title" },
          content: { type: "string", description: "Routine content in markdown format" },
          category: { type: "string", description: "Category like 'Öppning', 'Stängning', 'Säkerhet', etc." }
        },
        required: ["title", "content"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_routine",
      description: "Update an existing routine by title.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Current title of routine to update" },
          new_title: { type: "string", description: "New title (optional)" },
          new_content: { type: "string", description: "New content in markdown (optional)" },
          new_category: { type: "string", description: "New category (optional)" }
        },
        required: ["title"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_routine",
      description: "Delete a routine by title.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Title of routine to delete" }
        },
        required: ["title"]
      }
    }
  },
  // Announcement tools
  {
    type: "function",
    function: {
      name: "create_announcement",
      description: "Create a news announcement. Use when user wants to post news, updates, or announcements.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Announcement title" },
          content: { type: "string", description: "Announcement content in markdown" },
          is_pinned: { type: "boolean", description: "Pin to top of announcements" }
        },
        required: ["title", "content"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_announcement",
      description: "Update an existing announcement by title.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Current title to find" },
          new_title: { type: "string", description: "New title (optional)" },
          new_content: { type: "string", description: "New content (optional)" },
          is_pinned: { type: "boolean", description: "Pin status (optional)" }
        },
        required: ["title"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_announcement",
      description: "Delete an announcement by title.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Title of announcement to delete" }
        },
        required: ["title"]
      }
    }
  }
];

async function executeToolCall(
  toolName: string,
  args: any,
  workplaceId: string,
  userId: string,
  supabaseAdmin: any
): Promise<{ success: boolean; message: string; data?: any }> {
  
  switch (toolName) {
    // SCHEDULE OPERATIONS
    case "create_schedule": {
      const shiftsToInsert = args.shifts.map((shift: any) => ({
        workplace_id: workplaceId,
        shift_date: shift.shift_date,
        start_time: shift.start_time,
        end_time: shift.end_time,
        user_name: shift.user_name,
        role: shift.role || "Vakt",
        notes: shift.notes || null,
        created_by: userId,
        is_approved: false,
      }));

      const { data, error } = await supabaseAdmin
        .from("schedules")
        .insert(shiftsToInsert)
        .select();

      if (error) return { success: false, message: error.message };
      return { 
        success: true, 
        message: `Skapade ${data.length} pass`, 
        data: { action: "create_schedule", shifts: data }
      };
    }

    case "delete_schedule": {
      let query = supabaseAdmin
        .from("schedules")
        .delete()
        .eq("workplace_id", workplaceId)
        .eq("shift_date", args.shift_date);

      if (!args.delete_all_for_date && args.user_name) {
        query = query.ilike("user_name", `%${args.user_name}%`);
      }

      const { data, error } = await query.select();

      if (error) return { success: false, message: error.message };
      return { 
        success: true, 
        message: `Tog bort ${data?.length || 0} pass`,
        data: { action: "delete_schedule", deleted_count: data?.length || 0 }
      };
    }

    case "update_schedule": {
      // Find the shift first
      const { data: existing } = await supabaseAdmin
        .from("schedules")
        .select("id")
        .eq("workplace_id", workplaceId)
        .eq("shift_date", args.shift_date)
        .ilike("user_name", `%${args.user_name}%`)
        .limit(1)
        .single();

      if (!existing) return { success: false, message: "Hittade inget pass att uppdatera" };

      const updates: any = {};
      if (args.new_start_time) updates.start_time = args.new_start_time;
      if (args.new_end_time) updates.end_time = args.new_end_time;
      if (args.new_user_name) updates.user_name = args.new_user_name;
      if (args.new_role) updates.role = args.new_role;
      if (args.new_date) updates.shift_date = args.new_date;

      const { data, error } = await supabaseAdmin
        .from("schedules")
        .update(updates)
        .eq("id", existing.id)
        .select();

      if (error) return { success: false, message: error.message };
      return { 
        success: true, 
        message: "Uppdaterade passet",
        data: { action: "update_schedule", shift: data?.[0] }
      };
    }

    // CHECKLIST OPERATIONS
    case "create_checklist": {
      const { data, error } = await supabaseAdmin
        .from("checklists")
        .insert({
          workplace_id: workplaceId,
          title: args.title,
          description: args.description || null,
          items: args.items.map((item: any) => ({ text: item.text, checked: item.checked || false })),
          is_template: args.is_template || false,
          for_date: args.for_date || null,
          created_by: userId,
        })
        .select()
        .single();

      if (error) return { success: false, message: error.message };
      return { 
        success: true, 
        message: `Skapade checklista "${args.title}"`,
        data: { action: "create_checklist", checklist: data }
      };
    }

    case "update_checklist": {
      const { data: existing } = await supabaseAdmin
        .from("checklists")
        .select("id")
        .eq("workplace_id", workplaceId)
        .ilike("title", `%${args.title}%`)
        .limit(1)
        .single();

      if (!existing) return { success: false, message: "Hittade ingen checklista" };

      const updates: any = {};
      if (args.new_title) updates.title = args.new_title;
      if (args.new_description) updates.description = args.new_description;
      if (args.items) updates.items = args.items.map((item: any) => ({ text: item.text, checked: item.checked || false }));

      const { data, error } = await supabaseAdmin
        .from("checklists")
        .update(updates)
        .eq("id", existing.id)
        .select();

      if (error) return { success: false, message: error.message };
      return { 
        success: true, 
        message: `Uppdaterade checklistan`,
        data: { action: "update_checklist", checklist: data?.[0] }
      };
    }

    case "delete_checklist": {
      const { data, error } = await supabaseAdmin
        .from("checklists")
        .delete()
        .eq("workplace_id", workplaceId)
        .ilike("title", `%${args.title}%`)
        .select();

      if (error) return { success: false, message: error.message };
      return { 
        success: true, 
        message: `Tog bort ${data?.length || 0} checklista`,
        data: { action: "delete_checklist", deleted_count: data?.length || 0 }
      };
    }

    // ROUTINE OPERATIONS
    case "create_routine": {
      const { data, error } = await supabaseAdmin
        .from("routines")
        .insert({
          workplace_id: workplaceId,
          title: args.title,
          content: args.content,
          category: args.category || null,
          created_by: userId,
        })
        .select()
        .single();

      if (error) return { success: false, message: error.message };
      return { 
        success: true, 
        message: `Skapade rutin "${args.title}"`,
        data: { action: "create_routine", routine: data }
      };
    }

    case "update_routine": {
      const { data: existing } = await supabaseAdmin
        .from("routines")
        .select("id")
        .eq("workplace_id", workplaceId)
        .ilike("title", `%${args.title}%`)
        .limit(1)
        .single();

      if (!existing) return { success: false, message: "Hittade ingen rutin" };

      const updates: any = {};
      if (args.new_title) updates.title = args.new_title;
      if (args.new_content) updates.content = args.new_content;
      if (args.new_category) updates.category = args.new_category;

      const { data, error } = await supabaseAdmin
        .from("routines")
        .update(updates)
        .eq("id", existing.id)
        .select();

      if (error) return { success: false, message: error.message };
      return { 
        success: true, 
        message: `Uppdaterade rutinen`,
        data: { action: "update_routine", routine: data?.[0] }
      };
    }

    case "delete_routine": {
      const { data, error } = await supabaseAdmin
        .from("routines")
        .delete()
        .eq("workplace_id", workplaceId)
        .ilike("title", `%${args.title}%`)
        .select();

      if (error) return { success: false, message: error.message };
      return { 
        success: true, 
        message: `Tog bort ${data?.length || 0} rutin`,
        data: { action: "delete_routine", deleted_count: data?.length || 0 }
      };
    }

    // ANNOUNCEMENT OPERATIONS
    case "create_announcement": {
      const { data, error } = await supabaseAdmin
        .from("announcements")
        .insert({
          workplace_id: workplaceId,
          title: args.title,
          content: args.content,
          is_pinned: args.is_pinned || false,
          created_by: userId,
        })
        .select()
        .single();

      if (error) return { success: false, message: error.message };
      return { 
        success: true, 
        message: `Skapade nyhet "${args.title}"`,
        data: { action: "create_announcement", announcement: data }
      };
    }

    case "update_announcement": {
      const { data: existing } = await supabaseAdmin
        .from("announcements")
        .select("id")
        .eq("workplace_id", workplaceId)
        .ilike("title", `%${args.title}%`)
        .limit(1)
        .single();

      if (!existing) return { success: false, message: "Hittade ingen nyhet" };

      const updates: any = {};
      if (args.new_title) updates.title = args.new_title;
      if (args.new_content) updates.content = args.new_content;
      if (typeof args.is_pinned === "boolean") updates.is_pinned = args.is_pinned;

      const { data, error } = await supabaseAdmin
        .from("announcements")
        .update(updates)
        .eq("id", existing.id)
        .select();

      if (error) return { success: false, message: error.message };
      return { 
        success: true, 
        message: `Uppdaterade nyheten`,
        data: { action: "update_announcement", announcement: data?.[0] }
      };
    }

    case "delete_announcement": {
      const { data, error } = await supabaseAdmin
        .from("announcements")
        .delete()
        .eq("workplace_id", workplaceId)
        .ilike("title", `%${args.title}%`)
        .select();

      if (error) return { success: false, message: error.message };
      return { 
        success: true, 
        message: `Tog bort ${data?.length || 0} nyhet`,
        data: { action: "delete_announcement", deleted_count: data?.length || 0 }
      };
    }

    default:
      return { success: false, message: `Unknown tool: ${toolName}` };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    if (claimsError || !claimsData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.user.id;

    // Check if user is admin (required for write operations)
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const isAdmin = userRoles?.some(r => r.role === "super_admin" || r.role === "workplace_admin");

    // Get user's workplace
    const { data: profile } = await supabase
      .from("profiles")
      .select("workplace_id")
      .eq("id", userId)
      .single();

    let workplaceId = profile?.workplace_id;

    if (!workplaceId) {
      const isSuperAdmin = userRoles?.some(r => r.role === "super_admin");
      if (isSuperAdmin) {
        const { data: firstWorkplace } = await supabase
          .from("workplaces")
          .select("id")
          .limit(1)
          .single();
        
        if (firstWorkplace) {
          workplaceId = firstWorkplace.id;
        }
      }
    }

    if (!workplaceId) {
      return new Response(JSON.stringify({ error: "No workplace assigned" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get workplace data for context
    const [workplaceRes, routinesRes, timesRes, contactsRes, schedulesRes, employeesRes, checklistsRes, announcementsRes] = await Promise.all([
      supabase.from("workplaces").select("*").eq("id", workplaceId).single(),
      supabase.from("routines").select("title, content, category").eq("workplace_id", workplaceId),
      supabase.from("important_times").select("time_value, description").eq("workplace_id", workplaceId).order("sort_order"),
      supabase.from("contacts").select("name, role, phone, email, is_emergency").eq("workplace_id", workplaceId),
      supabase.from("schedules").select("*").eq("workplace_id", workplaceId).gte("shift_date", new Date().toISOString().split("T")[0]),
      supabase.from("profiles").select("full_name, email").eq("workplace_id", workplaceId),
      supabase.from("checklists").select("title, description, is_template").eq("workplace_id", workplaceId).limit(10),
      supabase.from("announcements").select("title, is_pinned").eq("workplace_id", workplaceId).order("created_at", { ascending: false }).limit(5),
    ]);

    const workplace = workplaceRes.data;
    const routines = routinesRes.data;
    const importantTimes = timesRes.data;
    const contacts = contactsRes.data;
    const schedules = schedulesRes.data;
    const employees = employeesRes.data;
    const checklists = checklistsRes.data;
    const announcements = announcementsRes.data;

    const today = new Date().toISOString().split("T")[0];

    const systemPrompt = `Du är WorkBuddy, en hjälpsam digital kollega för arbetsplatsen "${workplace?.name}" (${workplace?.company_name}).

DAGENS DATUM: ${today}
ANVÄNDARROLL: ${isAdmin ? "ADMIN (kan skapa, redigera och ta bort innehåll)" : "ANSTÄLLD (endast läsbehörighet)"}

ARBETSPLATSINFO:
- Typ: ${workplace?.workplace_type || "Okänd"}
- Bransch: ${workplace?.industry || "Okänd"}
${workplace?.settings ? `- Inställningar: Timlön ${workplace.settings.hourly_rate} kr, OB-tillägg ${workplace.settings.ob_rate} kr/h, Max ${workplace.settings.max_hours_per_week}h/vecka` : ""}

ANSTÄLLDA:
${employees?.map(e => `- ${e.full_name || e.email}`).join("\n") || "Inga registrerade."}

BEFINTLIGA CHECKLISTOR:
${checklists?.map(c => `- "${c.title}"${c.is_template ? " (mall)" : ""}`).join("\n") || "Inga."}

BEFINTLIGA RUTINER:
${routines?.map(r => `- "${r.title}" (${r.category || "Okategoriserad"})`).join("\n") || "Inga."}

SENASTE NYHETER:
${announcements?.map(a => `- "${a.title}"${a.is_pinned ? " [FÄST]" : ""}`).join("\n") || "Inga."}

VIKTIGA TIDER:
${importantTimes?.map(t => `- ${t.time_value}: ${t.description}`).join("\n") || "Inga."}

KONTAKTER:
${contacts?.map(c => `- ${c.name} (${c.role}): ${c.phone || c.email}${c.is_emergency ? " [AKUT]" : ""}`).join("\n") || "Inga."}

KOMMANDE SCHEMALAGDA PASS:
${schedules?.slice(0, 15).map(s => `- ${s.shift_date}: ${s.user_name || "Okänd"} ${s.start_time}-${s.end_time} (${s.role || "Vakt"})`).join("\n") || "Inga."}

INSTRUKTIONER:
- Svara alltid på svenska
- Var koncis och hjälpsam
${isAdmin ? `- Som admin kan du:
  • Schemalägga, ändra och ta bort pass (create_schedule, update_schedule, delete_schedule)
  • Skapa, redigera och ta bort checklistor (create_checklist, update_checklist, delete_checklist)
  • Skapa, redigera och ta bort rutiner (create_routine, update_routine, delete_routine)
  • Skapa, redigera och ta bort nyheter (create_announcement, update_announcement, delete_announcement)
- Använd ALLTID rätt verktyg när användaren vill göra ändringar` : "- Användaren har inte admin-behörighet. Svara på frågor men gör inga ändringar."}
- Vid lönefrågor: använd timlön ${workplace?.settings?.hourly_rate || 165} kr
- Om du inte hittar något att ta bort eller redigera, fråga användaren om förtydligande`;

    const { messages } = await req.json();

    // First call with tools (only if admin)
    const aiPayload: any = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    };

    if (isAdmin) {
      aiPayload.tools = tools;
      aiPayload.tool_choice = "auto";
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(aiPayload),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await response.json();
    const choice = aiResponse.choices?.[0];

    // Check if the AI wants to call tools
    if (choice?.message?.tool_calls && choice.message.tool_calls.length > 0) {
      const toolResults: any[] = [];
      
      for (const toolCall of choice.message.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments);
        const result = await executeToolCall(
          toolCall.function.name,
          args,
          workplaceId,
          userId,
          supabaseAdmin
        );
        toolResults.push({
          tool_call_id: toolCall.id,
          result
        });
      }

      // Get follow-up response from AI with tool results
      const toolMessages = toolResults.map(tr => ({
        role: "tool",
        tool_call_id: tr.tool_call_id,
        content: JSON.stringify(tr.result)
      }));

      const followUpResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
            choice.message,
            ...toolMessages
          ],
        }),
      });

      let finalContent = toolResults.map(tr => tr.result.message).join("\n");
      
      if (followUpResponse.ok) {
        const followUp = await followUpResponse.json();
        finalContent = followUp.choices?.[0]?.message?.content || finalContent;
      }

      // Aggregate tool results for frontend
      const aggregatedResults = toolResults.map(tr => tr.result.data).filter(Boolean);
      
      return new Response(JSON.stringify({ 
        response: finalContent,
        tool_results: aggregatedResults
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // No tool call, return the text response
    const content = choice?.message?.content || "Jag kunde inte generera ett svar.";
    
    return new Response(JSON.stringify({ response: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Chat error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
