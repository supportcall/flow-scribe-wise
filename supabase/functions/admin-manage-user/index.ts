import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ManageUserRequest {
  action: "reset_password" | "update_profile" | "disable" | "enable" | "delete";
  user_id: string;
  data?: {
    full_name?: string;
    email?: string;
    phone?: string;
    notes?: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create client with user's token to verify they're admin
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user is admin
    const { data: { user: callingUser }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !callingUser) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check admin role
    const { data: adminRole } = await supabaseUser
      .from("user_roles")
      .select("role")
      .eq("user_id", callingUser.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminRole) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { action, user_id, data }: ManageUserRequest = await req.json();

    if (!action || !user_id) {
      return new Response(
        JSON.stringify({ error: "Missing action or user_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result: any = { success: true };

    switch (action) {
      case "reset_password": {
        // Generate password reset link
        const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
          type: "recovery",
          email: data?.email || "",
        });

        if (resetError) throw resetError;

        // Return the recovery link - in production you'd email this
        result = { 
          success: true, 
          message: "Password reset link generated",
          // In a real app, you'd send this via email instead of returning it
          resetLink: resetData?.properties?.action_link 
        };
        break;
      }

      case "update_profile": {
        if (!data) {
          return new Response(
            JSON.stringify({ error: "Missing profile data" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Update profile in profiles table
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .update({
            full_name: data.full_name,
            phone: data.phone,
            notes: data.notes,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user_id);

        if (profileError) throw profileError;

        // Update email in auth if changed
        if (data.email) {
          const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
            user_id,
            { email: data.email }
          );
          if (authUpdateError) throw authUpdateError;

          // Also update email in profiles
          await supabaseAdmin
            .from("profiles")
            .update({ email: data.email })
            .eq("user_id", user_id);
        }

        result = { success: true, message: "Profile updated" };
        break;
      }

      case "disable": {
        // Ban user in Supabase Auth
        const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(
          user_id,
          { ban_duration: "876000h" } // ~100 years
        );
        if (banError) throw banError;

        // Mark as disabled in profiles
        await supabaseAdmin
          .from("profiles")
          .update({ is_disabled: true })
          .eq("user_id", user_id);

        result = { success: true, message: "User disabled" };
        break;
      }

      case "enable": {
        // Unban user
        const { error: unbanError } = await supabaseAdmin.auth.admin.updateUserById(
          user_id,
          { ban_duration: "none" }
        );
        if (unbanError) throw unbanError;

        // Mark as enabled in profiles
        await supabaseAdmin
          .from("profiles")
          .update({ is_disabled: false })
          .eq("user_id", user_id);

        result = { success: true, message: "User enabled" };
        break;
      }

      case "delete": {
        // Delete user from auth (cascades to profiles due to trigger/FK)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id);
        if (deleteError) throw deleteError;

        result = { success: true, message: "User deleted" };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Admin manage user error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
