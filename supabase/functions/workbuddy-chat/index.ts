import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const tools = [
  // Query schedule tool
  {
    type: "function",
    function: {
      name: "query_schedule",
      description: "Search and query schedules for specific dates, people, or periods. Use this when user asks about who is working, available shifts, or hours worked.",
      parameters: {
        type: "object",
        properties: {
          start_date: { type: "string", description: "Start date in YYYY-MM-DD format" },
          end_date: { type: "string", description: "End date in YYYY-MM-DD format (optional, defaults to start_date)" },
          user_name: { type: "string", description: "Filter by person name (optional)" },
          only_current_user: { type: "boolean", description: "If true, only return shifts for the authenticated user" }
        },
        required: ["start_date"]
      }
    }
  },
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
          category: { type: "string", description: "Category like 'Säkerhet', 'Planering', 'Kvalitet', 'Logistik', etc." }
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
  },
  // Certificate tools
  {
    type: "function",
    function: {
      name: "query_certificates",
      description: "Search and query certificates/credentials for employees. Use when user asks about certifications, safety credentials, who has valid certificates, or expiring certificates.",
      parameters: {
        type: "object",
        properties: {
          user_name: { type: "string", description: "Filter by person name (optional)" },
          certificate_type: { type: "string", description: "Filter by type like 'Fallskydd', 'Heta arbeten', 'Truck', 'Lift', 'El', 'ID06' (optional)" },
          status: { type: "string", description: "Filter by status: 'valid', 'expiring_soon', 'expired' (optional)" },
          expiring_within_days: { type: "number", description: "Find certificates expiring within N days (optional)" }
        }
      }
    }
  },
  // Incident tools
  {
    type: "function",
    function: {
      name: "create_incident",
      description: "Report a workplace incident/deviation. Use when user wants to report safety issues, quality problems, delays, or environmental concerns.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Short title of the incident" },
          description: { type: "string", description: "Detailed description" },
          severity: { type: "string", description: "Severity: 'low', 'medium', 'critical'" },
          category: { type: "string", description: "Category: 'safety', 'quality', 'environment', 'delay'" }
        },
        required: ["title", "severity", "category"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "query_incidents",
      description: "Search and query workplace incidents/deviations. Use when user asks about open incidents, safety issues, or deviation history.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", description: "Filter by status: 'open', 'investigating', 'resolved', 'closed' (optional)" },
          category: { type: "string", description: "Filter by category: 'safety', 'quality', 'environment', 'delay' (optional)" },
          severity: { type: "string", description: "Filter by severity: 'low', 'medium', 'critical' (optional)" }
        }
      }
    }
  },
];

// ========== HQ SUPER ADMIN TOOLS ==========
const superAdminTools = [
  // Workplace management
  {
    type: "function",
    function: {
      name: "create_workplace",
      description: "Create a new workplace. Only super_admin can use this.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Workplace name" },
          company_name: { type: "string", description: "Company name" },
          industry: { type: "string", description: "Industry (optional)" },
          workplace_type: { type: "string", description: "Workplace type (optional)" },
          workplace_code: { type: "string", description: "Custom workplace code (optional, auto-generated if not provided)" }
        },
        required: ["name", "company_name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "list_workplaces",
      description: "List all workplaces with basic stats (employee count). Only super_admin can use this.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "update_workplace_settings",
      description: "Update workplace settings like hourly_rate, ob_rate, max_hours_per_week, min_rest_hours, custom_prompt. Only super_admin.",
      parameters: {
        type: "object",
        properties: {
          workplace_id: { type: "string", description: "Workplace UUID to update (use list_workplaces to find)" },
          settings: {
            type: "object",
            description: "Key-value pairs to merge into settings, e.g. {hourly_rate: 280, ob_rate: 100}",
          }
        },
        required: ["workplace_id", "settings"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "toggle_features",
      description: "Enable or disable feature modules for a workplace. Available features: dashboard, team-chat, schedule, checklists, routines, announcements, incidents, certificates, employees, documents, photos. Only super_admin.",
      parameters: {
        type: "object",
        properties: {
          workplace_id: { type: "string", description: "Workplace UUID" },
          enabled_features: {
            type: "array",
            items: { type: "string" },
            description: "Array of feature IDs to enable. Features NOT in the list will be disabled."
          }
        },
        required: ["workplace_id", "enabled_features"]
      }
    }
  },
  // User management
  {
    type: "function",
    function: {
      name: "create_user",
      description: "Create a new user account and assign to a workplace. Only super_admin.",
      parameters: {
        type: "object",
        properties: {
          email: { type: "string", description: "User email" },
          password: { type: "string", description: "Initial password (min 6 chars)" },
          full_name: { type: "string", description: "Full name" },
          role: { type: "string", description: "Role: 'employee' or 'workplace_admin'" },
          workplace_id: { type: "string", description: "Workplace UUID to assign the user to" }
        },
        required: ["email", "password", "full_name", "role", "workplace_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "list_users",
      description: "List users/employees for a specific workplace. Only super_admin.",
      parameters: {
        type: "object",
        properties: {
          workplace_id: { type: "string", description: "Workplace UUID (optional, defaults to current)" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "change_user_role",
      description: "Change a user's role. Only super_admin.",
      parameters: {
        type: "object",
        properties: {
          user_id: { type: "string", description: "User UUID" },
          new_role: { type: "string", description: "New role: 'employee' or 'workplace_admin'" },
          workplace_id: { type: "string", description: "Workplace context for the role" }
        },
        required: ["user_id", "new_role", "workplace_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "reset_user_password",
      description: "Reset a user's password. Only super_admin.",
      parameters: {
        type: "object",
        properties: {
          user_id: { type: "string", description: "User UUID" },
          new_password: { type: "string", description: "New password (min 6 chars)" }
        },
        required: ["user_id", "new_password"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "move_user_to_workplace",
      description: "Move a user to a different workplace. Only super_admin.",
      parameters: {
        type: "object",
        properties: {
          user_id: { type: "string", description: "User UUID" },
          new_workplace_id: { type: "string", description: "Target workplace UUID" }
        },
        required: ["user_id", "new_workplace_id"]
      }
    }
  },
  // System configuration
  {
    type: "function",
    function: {
      name: "update_ai_prompt",
      description: "Update the custom AI prompt for a workplace. This changes how WorkBuddy behaves for that workplace. Only super_admin.",
      parameters: {
        type: "object",
        properties: {
          workplace_id: { type: "string", description: "Workplace UUID" },
          custom_prompt: { type: "string", description: "The new custom prompt text" }
        },
        required: ["workplace_id", "custom_prompt"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "manage_demo_prompts",
      description: "Create, update, or delete demo prompts for a workplace. Only super_admin.",
      parameters: {
        type: "object",
        properties: {
          action: { type: "string", description: "'create', 'update', or 'delete'" },
          workplace_id: { type: "string", description: "Workplace UUID" },
          prompt_text: { type: "string", description: "Prompt text (for create/update)" },
          category: { type: "string", description: "Category (optional)" },
          prompt_id: { type: "string", description: "Prompt UUID (for update/delete)" }
        },
        required: ["action", "workplace_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "manage_contacts",
      description: "Create or delete contacts for a workplace. Only super_admin.",
      parameters: {
        type: "object",
        properties: {
          action: { type: "string", description: "'create' or 'delete'" },
          workplace_id: { type: "string", description: "Workplace UUID" },
          name: { type: "string", description: "Contact name (for create)" },
          role: { type: "string", description: "Contact role (for create)" },
          phone: { type: "string", description: "Phone number (optional)" },
          email: { type: "string", description: "Email (optional)" },
          is_emergency: { type: "boolean", description: "Is emergency contact (optional)" },
          contact_id: { type: "string", description: "Contact UUID (for delete)" }
        },
        required: ["action", "workplace_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "manage_important_times",
      description: "Create or delete important times for a workplace. Only super_admin.",
      parameters: {
        type: "object",
        properties: {
          action: { type: "string", description: "'create' or 'delete'" },
          workplace_id: { type: "string", description: "Workplace UUID" },
          time_value: { type: "string", description: "Time value, e.g. '07:00' (for create)" },
          description: { type: "string", description: "Description (for create)" },
          time_id: { type: "string", description: "Time UUID (for delete)" }
        },
        required: ["action", "workplace_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "manage_invite_codes",
      description: "Create or deactivate invite codes for a workplace. Only super_admin.",
      parameters: {
        type: "object",
        properties: {
          action: { type: "string", description: "'create' or 'deactivate'" },
          workplace_id: { type: "string", description: "Workplace UUID" },
          name: { type: "string", description: "Invite code display name (for create)" },
          code: { type: "string", description: "Custom code (for create, optional - auto-generated if not provided)" },
          invite_code_id: { type: "string", description: "Invite code UUID (for deactivate)" }
        },
        required: ["action", "workplace_id"]
      }
    }
  },
];

// ========== TOOL EXECUTION ==========

async function executeToolCall(
  toolName: string,
  args: any,
  workplaceId: string,
  userId: string,
  supabaseAdmin: any,
  isSuperAdmin: boolean
): Promise<{ success: boolean; message: string; data?: any }> {
  
  // Guard: super admin only tools
  const superAdminOnlyTools = [
    "create_workplace", "list_workplaces", "update_workplace_settings", "toggle_features",
    "create_user", "list_users", "change_user_role", "reset_user_password", "move_user_to_workplace",
    "update_ai_prompt", "manage_demo_prompts", "manage_contacts", "manage_important_times", "manage_invite_codes"
  ];
  if (superAdminOnlyTools.includes(toolName) && !isSuperAdmin) {
    return { success: false, message: "Denna åtgärd kräver super_admin-behörighet." };
  }

  switch (toolName) {
    // ========== EXISTING TOOLS ==========

    case "query_schedule": {
      let query = supabaseAdmin
        .from("schedules")
        .select("shift_date, start_time, end_time, user_name, role, notes, is_approved")
        .eq("workplace_id", workplaceId)
        .gte("shift_date", args.start_date)
        .order("shift_date")
        .order("start_time");

      const endDate = args.end_date || args.start_date;
      query = query.lte("shift_date", endDate);

      if (args.user_name) {
        query = query.ilike("user_name", `%${args.user_name}%`);
      }

      const { data, error } = await query;
      if (error) return { success: false, message: error.message };

      const totalHours = (data || []).reduce((sum: number, shift: { start_time: string; end_time: string }) => {
        const [startH, startM] = shift.start_time.split(":").map(Number);
        const [endH, endM] = shift.end_time.split(":").map(Number);
        let hours = endH - startH + (endM - startM) / 60;
        if (hours < 0) hours += 24;
        return sum + hours;
      }, 0);

      return {
        success: true,
        message: `Hittade ${data?.length || 0} pass (totalt ${totalHours.toFixed(1)} timmar)`,
        data: { action: "query_schedule", shifts: data || [], total_shifts: data?.length || 0, total_hours: totalHours }
      };
    }

    case "create_schedule": {
      const shiftsToInsert = args.shifts.map((shift: any) => ({
        workplace_id: workplaceId,
        shift_date: shift.shift_date,
        start_time: shift.start_time,
        end_time: shift.end_time,
        user_name: shift.user_name,
        role: shift.role || "Byggarbetare",
        notes: shift.notes || null,
        created_by: userId,
        is_approved: false,
      }));

      const { data, error } = await supabaseAdmin.from("schedules").insert(shiftsToInsert).select();
      if (error) return { success: false, message: error.message };
      return { success: true, message: `Skapade ${data.length} pass`, data: { action: "create_schedule", shifts: data } };
    }

    case "delete_schedule": {
      let query = supabaseAdmin.from("schedules").delete().eq("workplace_id", workplaceId).eq("shift_date", args.shift_date);
      if (!args.delete_all_for_date && args.user_name) {
        query = query.ilike("user_name", `%${args.user_name}%`);
      }
      const { data, error } = await query.select();
      if (error) return { success: false, message: error.message };
      return { success: true, message: `Tog bort ${data?.length || 0} pass`, data: { action: "delete_schedule", deleted_count: data?.length || 0 } };
    }

    case "update_schedule": {
      const { data: existing } = await supabaseAdmin.from("schedules").select("id").eq("workplace_id", workplaceId).eq("shift_date", args.shift_date).ilike("user_name", `%${args.user_name}%`).limit(1).single();
      if (!existing) return { success: false, message: "Hittade inget pass att uppdatera" };

      const updates: any = {};
      if (args.new_start_time) updates.start_time = args.new_start_time;
      if (args.new_end_time) updates.end_time = args.new_end_time;
      if (args.new_user_name) updates.user_name = args.new_user_name;
      if (args.new_role) updates.role = args.new_role;
      if (args.new_date) updates.shift_date = args.new_date;

      const { data, error } = await supabaseAdmin.from("schedules").update(updates).eq("id", existing.id).select();
      if (error) return { success: false, message: error.message };
      return { success: true, message: "Uppdaterade passet", data: { action: "update_schedule", shift: data?.[0] } };
    }

    case "create_checklist": {
      const { data, error } = await supabaseAdmin.from("checklists").insert({
        workplace_id: workplaceId, title: args.title, description: args.description || null,
        items: args.items.map((item: any) => ({ text: item.text, checked: item.checked || false })),
        is_template: args.is_template || false, for_date: args.for_date || null, created_by: userId,
      }).select().single();
      if (error) return { success: false, message: error.message };
      return { success: true, message: `Skapade checklista "${args.title}"`, data: { action: "create_checklist", checklist: data } };
    }

    case "update_checklist": {
      const { data: existing } = await supabaseAdmin.from("checklists").select("id").eq("workplace_id", workplaceId).ilike("title", `%${args.title}%`).limit(1).single();
      if (!existing) return { success: false, message: "Hittade ingen checklista" };
      const updates: any = {};
      if (args.new_title) updates.title = args.new_title;
      if (args.new_description) updates.description = args.new_description;
      if (args.items) updates.items = args.items.map((item: any) => ({ text: item.text, checked: item.checked || false }));
      const { data, error } = await supabaseAdmin.from("checklists").update(updates).eq("id", existing.id).select();
      if (error) return { success: false, message: error.message };
      return { success: true, message: `Uppdaterade checklistan`, data: { action: "update_checklist", checklist: data?.[0] } };
    }

    case "delete_checklist": {
      const { data, error } = await supabaseAdmin.from("checklists").delete().eq("workplace_id", workplaceId).ilike("title", `%${args.title}%`).select();
      if (error) return { success: false, message: error.message };
      return { success: true, message: `Tog bort ${data?.length || 0} checklista`, data: { action: "delete_checklist", deleted_count: data?.length || 0 } };
    }

    case "create_routine": {
      const { data, error } = await supabaseAdmin.from("routines").insert({
        workplace_id: workplaceId, title: args.title, content: args.content, category: args.category || null, created_by: userId,
      }).select().single();
      if (error) return { success: false, message: error.message };
      return { success: true, message: `Skapade rutin "${args.title}"`, data: { action: "create_routine", routine: data } };
    }

    case "update_routine": {
      const { data: existing } = await supabaseAdmin.from("routines").select("id").eq("workplace_id", workplaceId).ilike("title", `%${args.title}%`).limit(1).single();
      if (!existing) return { success: false, message: "Hittade ingen rutin" };
      const updates: any = {};
      if (args.new_title) updates.title = args.new_title;
      if (args.new_content) updates.content = args.new_content;
      if (args.new_category) updates.category = args.new_category;
      const { data, error } = await supabaseAdmin.from("routines").update(updates).eq("id", existing.id).select();
      if (error) return { success: false, message: error.message };
      return { success: true, message: `Uppdaterade rutinen`, data: { action: "update_routine", routine: data?.[0] } };
    }

    case "delete_routine": {
      const { data, error } = await supabaseAdmin.from("routines").delete().eq("workplace_id", workplaceId).ilike("title", `%${args.title}%`).select();
      if (error) return { success: false, message: error.message };
      return { success: true, message: `Tog bort ${data?.length || 0} rutin`, data: { action: "delete_routine", deleted_count: data?.length || 0 } };
    }

    case "create_announcement": {
      const { data, error } = await supabaseAdmin.from("announcements").insert({
        workplace_id: workplaceId, title: args.title, content: args.content, is_pinned: args.is_pinned || false, created_by: userId,
      }).select().single();
      if (error) return { success: false, message: error.message };
      return { success: true, message: `Skapade nyhet "${args.title}"`, data: { action: "create_announcement", announcement: data } };
    }

    case "update_announcement": {
      const { data: existing } = await supabaseAdmin.from("announcements").select("id").eq("workplace_id", workplaceId).ilike("title", `%${args.title}%`).limit(1).single();
      if (!existing) return { success: false, message: "Hittade ingen nyhet" };
      const updates: any = {};
      if (args.new_title) updates.title = args.new_title;
      if (args.new_content) updates.content = args.new_content;
      if (typeof args.is_pinned === "boolean") updates.is_pinned = args.is_pinned;
      const { data, error } = await supabaseAdmin.from("announcements").update(updates).eq("id", existing.id).select();
      if (error) return { success: false, message: error.message };
      return { success: true, message: `Uppdaterade nyheten`, data: { action: "update_announcement", announcement: data?.[0] } };
    }

    case "delete_announcement": {
      const { data, error } = await supabaseAdmin.from("announcements").delete().eq("workplace_id", workplaceId).ilike("title", `%${args.title}%`).select();
      if (error) return { success: false, message: error.message };
      return { success: true, message: `Tog bort ${data?.length || 0} nyhet`, data: { action: "delete_announcement", deleted_count: data?.length || 0 } };
    }

    case "query_certificates": {
      let query = supabaseAdmin.from("certificates")
        .select("user_name, certificate_type, issued_date, expiry_date, issuer, certificate_number, status, notes")
        .eq("workplace_id", workplaceId).order("expiry_date", { ascending: true });
      if (args.user_name) query = query.ilike("user_name", `%${args.user_name}%`);
      if (args.certificate_type) query = query.ilike("certificate_type", `%${args.certificate_type}%`);
      if (args.status) query = query.eq("status", args.status);
      if (args.expiring_within_days) {
        const futureDate = new Date(Date.now() + args.expiring_within_days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        query = query.lte("expiry_date", futureDate);
      }
      const { data, error } = await query;
      if (error) return { success: false, message: error.message };
      return { success: true, message: `Hittade ${data?.length || 0} certifikat`, data: { action: "query_certificates", certificates: data || [], total: data?.length || 0 } };
    }

    case "create_incident": {
      const { data: reporter } = await supabaseAdmin.from("profiles").select("full_name, email").eq("id", userId).single();
      const { data, error } = await supabaseAdmin.from("incidents").insert({
        workplace_id: workplaceId, title: args.title, description: args.description || null,
        severity: args.severity || "medium", category: args.category || "safety",
        reported_by: userId, reported_by_name: reporter?.full_name || reporter?.email || "Okänd",
      }).select().single();
      if (error) return { success: false, message: error.message };
      return { success: true, message: `Avvikelse rapporterad: "${args.title}"`, data: { action: "create_incident", incident: data } };
    }

    case "query_incidents": {
      let query = supabaseAdmin.from("incidents")
        .select("title, description, severity, category, reported_by_name, status, created_at")
        .eq("workplace_id", workplaceId).order("created_at", { ascending: false });
      if (args.status) query = query.eq("status", args.status);
      if (args.category) query = query.eq("category", args.category);
      if (args.severity) query = query.eq("severity", args.severity);
      const { data, error } = await query.limit(20);
      if (error) return { success: false, message: error.message };
      return { success: true, message: `Hittade ${data?.length || 0} avvikelser`, data: { action: "query_incidents", incidents: data || [], total: data?.length || 0 } };
    }

    // ========== HQ SUPER ADMIN TOOLS ==========

    case "create_workplace": {
      const code = args.workplace_code?.trim().toUpperCase() ||
        args.name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 6).toUpperCase() +
        Math.random().toString(36).substring(2, 5).toUpperCase();

      const { data: existing } = await supabaseAdmin.from("workplaces").select("id").eq("workplace_code", code).maybeSingle();
      if (existing) return { success: false, message: "Platskoden finns redan, välj en annan" };

      const { data, error } = await supabaseAdmin.from("workplaces").insert({
        name: args.name.trim(), company_name: args.company_name.trim(),
        industry: args.industry?.trim() || null, workplace_type: args.workplace_type?.trim() || null,
        workplace_code: code,
      }).select().single();
      if (error) return { success: false, message: error.message };
      return { success: true, message: `Skapade arbetsplats "${data.name}" med kod ${data.workplace_code}`, data: { action: "create_workplace", workplace: data } };
    }

    case "list_workplaces": {
      const { data: workplaces, error } = await supabaseAdmin.from("workplaces").select("id, name, company_name, industry, workplace_type, workplace_code, settings, created_at").order("name");
      if (error) return { success: false, message: error.message };

      // Get employee counts per workplace
      const { data: profiles } = await supabaseAdmin.from("profiles").select("workplace_id");
      const counts: Record<string, number> = {};
      (profiles || []).forEach((p: any) => { if (p.workplace_id) counts[p.workplace_id] = (counts[p.workplace_id] || 0) + 1; });

      const enriched = (workplaces || []).map((w: any) => ({ ...w, employee_count: counts[w.id] || 0 }));
      return { success: true, message: `Hittade ${enriched.length} arbetsplatser`, data: { action: "list_workplaces", workplaces: enriched } };
    }

    case "update_workplace_settings": {
      const wpId = args.workplace_id;
      const { data: current } = await supabaseAdmin.from("workplaces").select("settings").eq("id", wpId).single();
      if (!current) return { success: false, message: "Arbetsplatsen hittades inte" };

      const merged = { ...(current.settings as Record<string, unknown> || {}), ...args.settings };
      const { error } = await supabaseAdmin.from("workplaces").update({ settings: merged }).eq("id", wpId);
      if (error) return { success: false, message: error.message };
      return { success: true, message: "Inställningar uppdaterade", data: { action: "update_workplace_settings", settings: merged } };
    }

    case "toggle_features": {
      const wpId = args.workplace_id;
      const { data: current } = await supabaseAdmin.from("workplaces").select("settings").eq("id", wpId).single();
      if (!current) return { success: false, message: "Arbetsplatsen hittades inte" };

      const merged = { ...(current.settings as Record<string, unknown> || {}), enabled_features: args.enabled_features };
      const { error } = await supabaseAdmin.from("workplaces").update({ settings: merged }).eq("id", wpId);
      if (error) return { success: false, message: error.message };
      return { success: true, message: `Funktioner uppdaterade: ${args.enabled_features.join(", ")}`, data: { action: "toggle_features", enabled_features: args.enabled_features } };
    }

    case "create_user": {
      if (args.password.length < 6) return { success: false, message: "Lösenordet måste vara minst 6 tecken" };

      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: args.email,
        password: args.password,
        email_confirm: true,
        user_metadata: { full_name: args.full_name },
      });
      if (authError) return { success: false, message: authError.message };

      // Create profile
      await supabaseAdmin.from("profiles").insert({
        id: authUser.user.id, email: args.email, full_name: args.full_name, workplace_id: args.workplace_id,
      });

      // Assign role
      const role = args.role === "workplace_admin" ? "workplace_admin" : "employee";
      await supabaseAdmin.from("user_roles").insert({
        user_id: authUser.user.id, role, workplace_id: args.workplace_id,
      });

      return { success: true, message: `Skapade användare ${args.full_name} (${args.email}) som ${role}`, data: { action: "create_user", user_id: authUser.user.id, email: args.email, role } };
    }

    case "list_users": {
      const targetWp = args.workplace_id || workplaceId;
      const { data: users, error } = await supabaseAdmin.from("profiles").select("id, email, full_name, workplace_id").eq("workplace_id", targetWp);
      if (error) return { success: false, message: error.message };

      // Get roles
      const userIds = (users || []).map((u: any) => u.id);
      const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role").in("user_id", userIds);
      const roleMap: Record<string, string[]> = {};
      (roles || []).forEach((r: any) => { if (!roleMap[r.user_id]) roleMap[r.user_id] = []; roleMap[r.user_id].push(r.role); });

      const enriched = (users || []).map((u: any) => ({ ...u, roles: roleMap[u.id] || ["employee"] }));
      return { success: true, message: `Hittade ${enriched.length} användare`, data: { action: "list_users", users: enriched } };
    }

    case "change_user_role": {
      // Remove old non-super_admin roles for the workplace
      await supabaseAdmin.from("user_roles").delete().eq("user_id", args.user_id).eq("workplace_id", args.workplace_id).neq("role", "super_admin");

      // Insert new role
      const { error } = await supabaseAdmin.from("user_roles").insert({
        user_id: args.user_id, role: args.new_role, workplace_id: args.workplace_id,
      });
      if (error) return { success: false, message: error.message };
      return { success: true, message: `Ändrade roll till ${args.new_role}`, data: { action: "change_user_role", user_id: args.user_id, new_role: args.new_role } };
    }

    case "reset_user_password": {
      if (args.new_password.length < 6) return { success: false, message: "Lösenordet måste vara minst 6 tecken" };
      const { error } = await supabaseAdmin.auth.admin.updateUserById(args.user_id, { password: args.new_password });
      if (error) return { success: false, message: error.message };
      return { success: true, message: "Lösenordet har återställts", data: { action: "reset_user_password" } };
    }

    case "move_user_to_workplace": {
      // Verify target workplace exists
      const { data: targetWp } = await supabaseAdmin.from("workplaces").select("id, name").eq("id", args.new_workplace_id).single();
      if (!targetWp) return { success: false, message: "Målarbetsplatsen hittades inte" };

      // Update profile
      const { error: profileErr } = await supabaseAdmin.from("profiles").update({ workplace_id: args.new_workplace_id }).eq("id", args.user_id);
      if (profileErr) return { success: false, message: profileErr.message };

      // Update user_roles workplace_id (non-super_admin roles)
      await supabaseAdmin.from("user_roles").update({ workplace_id: args.new_workplace_id }).eq("user_id", args.user_id).neq("role", "super_admin");

      return { success: true, message: `Flyttade användaren till ${targetWp.name}`, data: { action: "move_user_to_workplace", new_workplace: targetWp.name } };
    }

    case "update_ai_prompt": {
      const wpId = args.workplace_id;
      const { data: current } = await supabaseAdmin.from("workplaces").select("settings").eq("id", wpId).single();
      if (!current) return { success: false, message: "Arbetsplatsen hittades inte" };

      const merged = { ...(current.settings as Record<string, unknown> || {}), custom_prompt: args.custom_prompt };
      const { error } = await supabaseAdmin.from("workplaces").update({ settings: merged }).eq("id", wpId);
      if (error) return { success: false, message: error.message };
      return { success: true, message: "AI-prompt uppdaterad", data: { action: "update_ai_prompt" } };
    }

    case "manage_demo_prompts": {
      if (args.action === "create") {
        const { data, error } = await supabaseAdmin.from("demo_prompts").insert({
          workplace_id: args.workplace_id, prompt_text: args.prompt_text, category: args.category || null,
        }).select().single();
        if (error) return { success: false, message: error.message };
        return { success: true, message: `Skapade demoprompt`, data: { action: "manage_demo_prompts", prompt: data } };
      } else if (args.action === "update" && args.prompt_id) {
        const updates: any = {};
        if (args.prompt_text) updates.prompt_text = args.prompt_text;
        if (args.category !== undefined) updates.category = args.category;
        const { error } = await supabaseAdmin.from("demo_prompts").update(updates).eq("id", args.prompt_id);
        if (error) return { success: false, message: error.message };
        return { success: true, message: "Demoprompt uppdaterad", data: { action: "manage_demo_prompts" } };
      } else if (args.action === "delete" && args.prompt_id) {
        const { error } = await supabaseAdmin.from("demo_prompts").delete().eq("id", args.prompt_id);
        if (error) return { success: false, message: error.message };
        return { success: true, message: "Demoprompt borttagen", data: { action: "manage_demo_prompts" } };
      }
      return { success: false, message: "Ogiltigt action eller saknar prompt_id" };
    }

    case "manage_contacts": {
      if (args.action === "create") {
        const { data, error } = await supabaseAdmin.from("contacts").insert({
          workplace_id: args.workplace_id, name: args.name, role: args.role || null,
          phone: args.phone || null, email: args.email || null, is_emergency: args.is_emergency || false,
        }).select().single();
        if (error) return { success: false, message: error.message };
        return { success: true, message: `Skapade kontakt "${args.name}"`, data: { action: "manage_contacts", contact: data } };
      } else if (args.action === "delete" && args.contact_id) {
        const { error } = await supabaseAdmin.from("contacts").delete().eq("id", args.contact_id);
        if (error) return { success: false, message: error.message };
        return { success: true, message: "Kontakt borttagen", data: { action: "manage_contacts" } };
      }
      return { success: false, message: "Ogiltigt action eller saknar contact_id" };
    }

    case "manage_important_times": {
      if (args.action === "create") {
        const { data, error } = await supabaseAdmin.from("important_times").insert({
          workplace_id: args.workplace_id, time_value: args.time_value, description: args.description,
        }).select().single();
        if (error) return { success: false, message: error.message };
        return { success: true, message: `Lade till viktig tid: ${args.time_value}`, data: { action: "manage_important_times", time: data } };
      } else if (args.action === "delete" && args.time_id) {
        const { error } = await supabaseAdmin.from("important_times").delete().eq("id", args.time_id);
        if (error) return { success: false, message: error.message };
        return { success: true, message: "Viktig tid borttagen", data: { action: "manage_important_times" } };
      }
      return { success: false, message: "Ogiltigt action eller saknar time_id" };
    }

    case "manage_invite_codes": {
      if (args.action === "create") {
        const code = args.code?.trim().toUpperCase() || Math.random().toString(36).substring(2, 8).toUpperCase();
        const { data, error } = await supabaseAdmin.from("invite_codes").insert({
          workplace_id: args.workplace_id, code, name: args.name || code, created_by: userId,
        }).select().single();
        if (error) return { success: false, message: error.message };
        return { success: true, message: `Skapade inbjudningskod: ${code}`, data: { action: "manage_invite_codes", invite_code: data } };
      } else if (args.action === "deactivate" && args.invite_code_id) {
        const { error } = await supabaseAdmin.from("invite_codes").update({ status: "paused" }).eq("id", args.invite_code_id);
        if (error) return { success: false, message: error.message };
        return { success: true, message: "Inbjudningskod inaktiverad", data: { action: "manage_invite_codes" } };
      }
      return { success: false, message: "Ogiltigt action eller saknar invite_code_id" };
    }

    default:
      return { success: false, message: `Okänt verktyg: ${toolName}` };
  }
}

function generateByggSystemPrompt(
  workplace: any,
  employees: any[],
  checklists: any[],
  routines: any[],
  announcements: any[],
  importantTimes: any[],
  contacts: any[],
  schedules: any[],
  isAdmin: boolean,
  today: string,
  certificates: any[],
  incidents: any[],
  isSuperAdmin: boolean,
  allWorkplaces?: any[]
): string {
  const projects = workplace?.settings?.projects || [];
  
  const projectsInfo = projects.length > 0 
    ? projects.map((p: any) => {
        const blockersInfo = p.blockers?.length > 0 
          ? `\n    BLOCKERS: ${p.blockers.map((b: any) => `- ${b.issue} (${b.owner})`).join(", ")}`
          : "";
        return `  - "${p.name}" | Status: ${p.status} | Progress: ${p.progress}% | Risk: ${p.risk_level} | Nästa milstolpe: ${p.next_milestone}${blockersInfo}`;
      }).join("\n")
    : "Inga objekt/projekt registrerade.";

  const superAdminSection = isSuperAdmin ? `

HQ SUPER ADMIN VERKTYG (kräver bekräftelse):
Du har tillgång till kraftfulla administrationsverktyg:

ARBETSPLATSHANTERING:
  • create_workplace - Skapa ny arbetsplats
  • list_workplaces - Lista alla arbetsplatser med statistik
  • update_workplace_settings - Ändra inställningar (timlön, OB, max timmar etc.)
  • toggle_features - Slå av/på moduler (schema, certifikat, teamchatt etc.)

ANVÄNDARHANTERING:
  • create_user - Skapa ny användare (e-post, lösenord, namn, roll, arbetsplats)
  • list_users - Lista personal per arbetsplats
  • change_user_role - Ändra roll (employee/workplace_admin)
  • reset_user_password - Återställa lösenord
  • move_user_to_workplace - Flytta användare mellan arbetsplatser

SYSTEMKONFIGURATION:
  • update_ai_prompt - Ändra arbetsplatsens AI-prompt
  • manage_demo_prompts - Skapa/redigera/ta bort demoprompter
  • manage_contacts - Lägga till/ta bort kontakter
  • manage_important_times - Ändra viktiga tider
  • manage_invite_codes - Skapa/inaktivera inbjudningskoder

${allWorkplaces && allWorkplaces.length > 0 ? `ALLA ARBETSPLATSER:
${allWorkplaces.map((w: any) => `  • "${w.name}" (${w.company_name}) - ID: ${w.id} - Kod: ${w.workplace_code}`).join("\n")}` : ""}

VIKTIGT FÖR HQ-VERKTYG:
- Fråga ALLTID om bekräftelse innan du utför HQ-åtgärder
- Vid create_user: föreslå alltid ett starkt lösenord
- Vid move_user: informera om att detta påverkar användarens åtkomst
- Vid toggle_features: lista tydligt vilka moduler som slås av/på
` : "";

  return `Du är WorkBuddy, en platsbaserad digital kollega för byggarbetsplatser. Du arbetar alltid inom den aktuella arbetsplatsens och aktuella objektets data.

DAGENS DATUM: ${today}
ARBETSPLATS: ${workplace?.name} (${workplace?.company_name})
ANVÄNDARROLL: ${isSuperAdmin ? "SUPER ADMIN (full kontroll över hela systemet)" : isAdmin ? "ADMIN/PLATSCHEF (kan skapa, redigera och ta bort innehåll)" : "ANSTÄLLD (endast läsbehörighet)"}

MÅL:
1) Minska avbrott för platschef: svara direkt på frågor om schema, rutiner, säkerhet, kontaktvägar och dagens plan.
2) Planera och föreslå: skapa schemaförslag utifrån tillgänglighet, behörigheter och regler.
3) Exekvera: skapa checklistor, uppdatera progress, skapa nyheter/notiser.
4) Säkra: lyft risker, saknade kontroller och beroenden. Prioritera arbetsmiljö och säkerhet.

ARBETSPLATSINSTÄLLNINGAR:
- Typ: ${workplace?.workplace_type || "Byggarbetsplats"}
- Bransch: ${workplace?.industry || "Bygg & Anläggning"}
- Timlön: ${workplace?.settings?.hourly_rate || 245} kr
- OB-tillägg: ${workplace?.settings?.ob_rate || 75} kr/h
- Max timmar/vecka: ${workplace?.settings?.max_hours_per_week || 50}
- Minsta vilotid: ${workplace?.settings?.min_rest_hours || 11}h

OBJEKT/PROJEKT:
${projectsInfo}

PERSONAL PÅ ARBETSPLATSEN:
${employees?.map(e => `- ${e.full_name || e.email}`).join("\n") || "Ingen registrerad."}

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
${schedules?.slice(0, 15).map(s => `- ${s.shift_date}: ${s.user_name || "Okänd"} ${s.start_time}-${s.end_time} (${s.role || "Byggarbetare"})`).join("\n") || "Inga."}

CERTIFIKAT (utgångna/snart utgående):
${(() => {
  const expiring = certificates?.filter(c => c.status === "expired" || c.status === "expiring_soon") || [];
  return expiring.length > 0
    ? expiring.map(c => `- ${c.user_name}: ${c.certificate_type} (${c.status === "expired" ? "UTGÅNGET" : "utgår " + c.expiry_date})`).join("\n")
    : "Inga utgångna eller snart utgående certifikat.";
})()}

ÖPPNA AVVIKELSER:
${(() => {
  const open = incidents?.filter(i => i.status === "open" || i.status === "investigating") || [];
  return open.length > 0
    ? open.map(i => `- [${i.severity.toUpperCase()}] ${i.title} (${i.category}) - rapporterad av ${i.reported_by_name || "Okänd"}`).join("\n")
    : "Inga öppna avvikelser.";
})()}

KÄRNREGLER:
- Arbeta alltid inom vald arbetsplats. Om du inte vet vilket objekt det gäller, fråga användaren.
- Svara aldrig med generella råd när du kan vara konkret. Använd data från rutiner/checklistor/objekt.
- Om en uppgift rör risk (fallrisk, heta arbeten, el, maskiner): fråga alltid om behörighet/PPE och hänvisa till relevant rutin/checklista.
- KORSREFERERA alltid certifikat med schema: om någon ska jobba på höjd, kontrollera att de har giltigt fallskyddscertifikat.
- Alltid föreslå nästa konkreta steg: "Vill du att jag skapar checklista?" / "Vill du att jag lägger detta som nyhet?"

INSTRUKTIONER:
- Svara alltid på svenska
- Var koncis och praktiskt – använd punktlistor
- Ingen "AI-hype" – rak kommunikation
${isAdmin ? `
SOM ADMIN KAN DU:
  • Schemalägga, ändra och ta bort pass (create_schedule, update_schedule, delete_schedule)
  • Skapa, redigera och ta bort checklistor (create_checklist, update_checklist, delete_checklist)
  • Skapa, redigera och ta bort rutiner (create_routine, update_routine, delete_routine)
  • Skapa, redigera och ta bort nyheter (create_announcement, update_announcement, delete_announcement)
  • Fråga om certifikat (query_certificates)
  • Rapportera avvikelser (create_incident)
  • Fråga om avvikelser (query_incidents)

VIKTIGT - BEKRÄFTELSE KRÄVS:
- FRÅGA ALLTID användaren om bekräftelse INNAN du skapar, ändrar eller tar bort data
- Presentera först vad du planerar göra, t.ex. "Jag föreslår att skapa ett pass för Anna 08:00-16:00 den 10 februari. Ska jag lägga in det?"
- Vänta på tydligt "ja", "gör det", "lägg in det", "kör" innan du utför verktyget
- Om användaren säger "nej" eller "avbryt", lägg INTE in något
- Utför ALDRIG verktyg automatiskt utan bekräftelse från användaren
` : `- Användaren har inte admin-behörighet. Svara på frågor men gör inga ändringar.
- Användaren kan fråga om certifikat (query_certificates) och avvikelser (query_incidents).
- Användaren kan rapportera avvikelser (create_incident).`}
${superAdminSection}
OUTPUTFORMAT:
1) Kort svar (1–2 meningar)
2) Detaljer i punktlista
3) Rekommenderad åtgärd (1 rad)
4) "Vill du att jag…" (skapa checklista / uppdatera progress / skapa schemaförslag / etc.)

VIKTIGT VID SÄKERHETSFRÅGOR:
- Om data saknas: föreslå att lägga till rutin (t.ex. "Arbete på höjd") eller checklista (t.ex. "Daglig säkerhetskontroll")
- Prioritera alltid arbetsmiljö och säkerhet

${workplace?.settings?.custom_prompt ? `\nARBETSPLATSSPECIFIKA INSTRUKTIONER (från arbetsplatsadmin):\n${workplace.settings.custom_prompt}\n` : ""}`;
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
    const isSuperAdmin = userRoles?.some(r => r.role === "super_admin") || false;

    // Get request body
    const { messages, workplaceId: requestedWorkplaceId } = await req.json();

    // Get user's workplace
    const { data: profile } = await supabase
      .from("profiles")
      .select("workplace_id")
      .eq("id", userId)
      .single();

    let workplaceId = profile?.workplace_id;

    // Super admin can specify a different workplace
    if (isSuperAdmin && requestedWorkplaceId) {
      const { data: targetWorkplace } = await supabase
        .from("workplaces")
        .select("id")
        .eq("id", requestedWorkplaceId)
        .single();
      
      if (targetWorkplace) {
        workplaceId = targetWorkplace.id;
      }
    }

    // Fallback for super admin without workplace
    if (!workplaceId && isSuperAdmin) {
      const { data: firstWorkplace } = await supabase
        .from("workplaces")
        .select("id")
        .limit(1)
        .single();
      
      if (firstWorkplace) {
        workplaceId = firstWorkplace.id;
      }
    }

    if (!workplaceId) {
      return new Response(JSON.stringify({ error: "No workplace assigned" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all workplaces for super admin context
    let allWorkplaces: any[] = [];
    if (isSuperAdmin) {
      const { data: wps } = await supabaseAdmin.from("workplaces").select("id, name, company_name, workplace_code").order("name");
      allWorkplaces = wps || [];
    }

    // Get workplace data for context
    const [workplaceRes, routinesRes, timesRes, contactsRes, schedulesRes, employeesRes, checklistsRes, announcementsRes, certificatesRes, incidentsRes] = await Promise.all([
      supabase.from("workplaces").select("*").eq("id", workplaceId).single(),
      supabase.from("routines").select("title, content, category").eq("workplace_id", workplaceId),
      supabase.from("important_times").select("time_value, description").eq("workplace_id", workplaceId).order("sort_order"),
      supabase.from("contacts").select("name, role, phone, email, is_emergency").eq("workplace_id", workplaceId),
      supabase.from("schedules").select("*").eq("workplace_id", workplaceId).gte("shift_date", new Date().toISOString().split("T")[0]),
      supabase.from("profiles").select("full_name, email").eq("workplace_id", workplaceId),
      supabase.from("checklists").select("title, description, is_template").eq("workplace_id", workplaceId).limit(10),
      supabase.from("announcements").select("title, is_pinned").eq("workplace_id", workplaceId).order("created_at", { ascending: false }).limit(5),
      supabaseAdmin.from("certificates").select("user_name, certificate_type, expiry_date, status").eq("workplace_id", workplaceId),
      supabaseAdmin.from("incidents").select("title, severity, category, status, reported_by_name, created_at").eq("workplace_id", workplaceId).order("created_at", { ascending: false }).limit(20),
    ]);

    const workplace = workplaceRes.data;
    const routines = routinesRes.data;
    const importantTimes = timesRes.data;
    const contacts = contactsRes.data;
    const schedules = schedulesRes.data;
    const employees = employeesRes.data;
    const checklists = checklistsRes.data;
    const announcements = announcementsRes.data;
    const certificates = certificatesRes.data;
    const incidents = incidentsRes.data;

    const today = new Date().toISOString().split("T")[0];

    const systemPrompt = generateByggSystemPrompt(
      workplace,
      employees || [],
      checklists || [],
      routines || [],
      announcements || [],
      importantTimes || [],
      contacts || [],
      schedules || [],
      isAdmin || false,
      today,
      certificates || [],
      incidents || [],
      isSuperAdmin,
      allWorkplaces
    );

    // Build tool set based on role
    const readOnlyTools = tools.filter(t => 
      ["query_schedule", "query_certificates", "query_incidents", "create_incident"].includes(t.function.name)
    );
    
    let activeTools;
    if (isSuperAdmin) {
      activeTools = [...tools, ...superAdminTools];
    } else if (isAdmin) {
      activeTools = tools;
    } else {
      activeTools = readOnlyTools;
    }

    const aiPayload: any = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      tools: activeTools,
      tool_choice: "auto",
    };

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
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
          supabaseAdmin,
          isSuperAdmin
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
