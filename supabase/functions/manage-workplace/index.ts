import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check super_admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "super_admin");

    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: "Only super admins can perform this action" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    if (action === "create") {
      const { name, company_name, industry, workplace_type, workplace_code } = body;

      if (!name || !company_name) {
        return new Response(JSON.stringify({ error: "Namn och företagsnamn krävs" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Validate lengths
      if (name.length > 100 || company_name.length > 100) {
        return new Response(JSON.stringify({ error: "Namn får vara max 100 tecken" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Generate or use provided workplace code
      const code = workplace_code?.trim().toUpperCase() || 
        name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 6).toUpperCase() + 
        Math.random().toString(36).substring(2, 5).toUpperCase();

      // Check code uniqueness
      const { data: existing } = await supabaseAdmin
        .from("workplaces")
        .select("id")
        .eq("workplace_code", code)
        .maybeSingle();

      if (existing) {
        return new Response(JSON.stringify({ error: "Platskoden finns redan, välj en annan" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: workplace, error: insertError } = await supabaseAdmin
        .from("workplaces")
        .insert({
          name: name.trim(),
          company_name: company_name.trim(),
          industry: industry?.trim() || null,
          workplace_type: workplace_type?.trim() || null,
          workplace_code: code,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
        return new Response(JSON.stringify({ error: insertError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, workplace }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "reset-password") {
      const { user_id, new_password } = body;

      if (!user_id || !new_password) {
        return new Response(JSON.stringify({ error: "user_id och new_password krävs" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (new_password.length < 6) {
        return new Response(JSON.stringify({ error: "Lösenordet måste vara minst 6 tecken" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
        password: new_password,
      });

      if (updateError) {
        console.error("Password reset error:", updateError);
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, message: "Lösenordet har återställts" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "update-settings") {
      const { workplace_id: wpId, settings } = body;

      if (!wpId || !settings) {
        return new Response(JSON.stringify({ error: "workplace_id och settings krävs" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get current settings and merge
      const { data: current } = await supabaseAdmin
        .from("workplaces")
        .select("settings")
        .eq("id", wpId)
        .single();

      const mergedSettings = { ...(current?.settings as Record<string, unknown> || {}), ...settings };

      const { error: updateError } = await supabaseAdmin
        .from("workplaces")
        .update({ settings: mergedSettings })
        .eq("id", wpId);

      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, message: "Inställningar uppdaterade" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
