import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, fullName, secretKey } = await req.json();

    // Verify bootstrap secret to prevent unauthorized admin creation
    const expectedSecret = Deno.env.get("ADMIN_BOOTSTRAP_SECRET");
    if (!expectedSecret || secretKey !== expectedSecret) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.email === email);

    if (existingUser) {
      // User exists, just ensure they have admin role and are approved
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: existingUser.id, role: "admin" }, { onConflict: "user_id,role" });

      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ approval_status: "approved" })
        .eq("user_id", existingUser.id);

      // Ensure credits record exists
      await supabaseAdmin
        .from("user_credits")
        .upsert({ user_id: existingUser.id, balance: 1000 }, { onConflict: "user_id" });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Admin user updated",
          user_id: existingUser.id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create new user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError) {
      throw createError;
    }

    // Assign admin role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: newUser.user.id, role: "admin" });

    if (roleError) {
      console.error("Role error:", roleError);
    }

    // Update profile to approved
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ approval_status: "approved" })
      .eq("user_id", newUser.user.id);

    if (profileError) {
      console.error("Profile error:", profileError);
    }

    // Add initial credits
    await supabaseAdmin
      .from("user_credits")
      .upsert({ user_id: newUser.user.id, balance: 1000 }, { onConflict: "user_id" });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Admin user created",
        user_id: newUser.user.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Bootstrap error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
