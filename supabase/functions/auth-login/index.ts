import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Use service role client for rate limiting checks
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check rate limit before attempting login (10 attempts per 15 minutes per email)
    const { data: allowed, error: rlError } = await adminClient.rpc(
      "check_rate_limit",
      {
        _identifier: email.toLowerCase(),
        _attempt_type: "login",
        _max_attempts: 10,
        _window_minutes: 15,
      }
    );

    if (rlError) {
      console.error("Rate limit check error:", rlError);
      // Fail open but log the error — don't block login if rate limit check fails
    }

    if (allowed === false) {
      // Record the blocked attempt
      await adminClient.rpc("record_login_attempt", {
        _identifier: email.toLowerCase(),
        _attempt_type: "login",
        _success: false,
        _ip_address: req.headers.get("x-forwarded-for") || "unknown",
      });

      return new Response(
        JSON.stringify({
          error: "Too many login attempts. Please try again in 15 minutes.",
          code: "RATE_LIMITED",
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Attempt login using anon client (same as client-side would)
    const anonClient = createClient(supabaseUrl, anonKey);
    const { data, error } = await anonClient.auth.signInWithPassword({
      email,
      password,
    });

    // Record the attempt
    await adminClient.rpc("record_login_attempt", {
      _identifier: email.toLowerCase(),
      _attempt_type: "login",
      _success: !error,
      _ip_address: req.headers.get("x-forwarded-for") || "unknown",
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        session: data.session,
        user: data.user,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Auth login error:", err);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
