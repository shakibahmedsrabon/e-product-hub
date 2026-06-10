import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      "https://jqxesguuoxgithnqdtgl.supabase.co",
      Deno.env.get("EXTERNAL_SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const email = body.email?.trim()?.toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: "invalid_email", message: "Please enter a valid email address." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const allowedDomains = ["gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "live.com", "msn.com"];
    const domain = email.split("@")[1];
    if (!allowedDomains.includes(domain)) {
      return new Response(
        JSON.stringify({ error: "invalid_email", message: "Only Gmail and Outlook emails are accepted." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error } = await supabase.from("Subscribers").insert({ email });

    if (error) {
      console.error("Insert error:", JSON.stringify(error));
      if (error.message.includes("duplicate") || error.code === "23505") {
        return new Response(
          JSON.stringify({ error: "duplicate", message: "This email is already subscribed." }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, message: "Subscribed successfully!" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Server error:", err);
    return new Response(
      JSON.stringify({ error: "server_error", message: "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
