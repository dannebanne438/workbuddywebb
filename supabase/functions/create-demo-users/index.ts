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

    const workplaceId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    
    // Demo users to create
    const demoUsers = [
      {
        email: "admin@workbuddy.demo",
        password: "WorkBuddy123!",
        full_name: "Super Admin",
        role: "super_admin" as const,
        workplace_id: null // Super admin is global
      },
      {
        email: "chef@nns.demo",
        password: "Chef123!",
        full_name: "Erik Johansson",
        role: "employee" as const, // Starts as employee, must request admin
        workplace_id: workplaceId
      },
      {
        email: "vakt1@nns.demo",
        password: "Vakt123!",
        full_name: "Anna Karlsson",
        role: "employee" as const,
        workplace_id: workplaceId
      }
    ];

    const results = [];

    for (const user of demoUsers) {
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === user.email);
      
      if (existingUser) {
        results.push({ email: user.email, status: "already exists" });
        continue;
      }

      // Create the user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { full_name: user.full_name }
      });

      if (authError) {
        results.push({ email: user.email, status: "error", error: authError.message });
        continue;
      }

      const userId = authData.user.id;

      // Create profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          email: user.email,
          full_name: user.full_name,
          workplace_id: user.workplace_id
        });

      if (profileError) {
        console.error("Profile error:", profileError);
      }

      // Create role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role: user.role,
          workplace_id: user.workplace_id
        });

      if (roleError) {
        console.error("Role error:", roleError);
      }

      results.push({ email: user.email, status: "created", userId });
    }

    return new Response(JSON.stringify({ success: true, results }), {
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
