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

    const { email, password, full_name } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);
    
    if (existingUser) {
      // User exists - check if they have super_admin role
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", existingUser.id)
        .eq("role", "super_admin")
        .maybeSingle();

      if (existingRole) {
        return new Response(JSON.stringify({ 
          success: true, 
          message: "Super admin already exists",
          userId: existingUser.id 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Add super_admin role to existing user
      await supabase.from("user_roles").insert({
        user_id: existingUser.id,
        role: "super_admin",
        workplace_id: null
      });

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Super admin role added to existing user",
        userId: existingUser.id 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create the user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name || "Super Admin" }
    });

    if (authError) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = authData.user.id;

    // Create profile (no workplace_id for super admin)
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email,
        full_name: full_name || "Super Admin",
        workplace_id: null
      });

    if (profileError) {
      console.error("Profile error:", profileError);
    }

    // Create super_admin role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: userId,
        role: "super_admin",
        workplace_id: null
      });

    if (roleError) {
      console.error("Role error:", roleError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Super admin created successfully",
      userId 
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
