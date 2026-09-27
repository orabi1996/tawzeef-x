import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { trackingCode, date, time } = await req.json();

    const code = typeof trackingCode === "string" ? trackingCode.trim().toUpperCase() : "";
    const requestedDate = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T12:00:00Z`) : null;
    const daysAhead = requestedDate ? (requestedDate.getTime() - Date.now()) / 86400000 : -1;
    if (!/^TX-[0-9A-F]{32}$/.test(code) || !requestedDate || Number.isNaN(daysAhead) ||
        daysAhead < 0 || daysAhead > 11 || [5, 6].includes(requestedDate.getUTCDay()) ||
        !["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"].includes(time)) {
      return new Response(JSON.stringify({ error: "رمز التتبع أو موعد الحجز غير صالح" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // A public candidate UUID does not authorize a booking. The private code does.
    const { data: candidate, error: candidateError } = await supabase.from("candidates")
      .select("id, user_id, name, role, stage, company_id").eq("tracking_code", code).limit(1).maybeSingle();
    if (candidateError) throw candidateError;

    if (!candidate) {
      // Create interview without candidate link - use a system approach
      return new Response(JSON.stringify({ error: "المرشح غير موجود. يرجى التحقق من رمز التتبع." }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existing, error: existingError } = await supabase.from("interviews")
      .select("id").eq("candidate_id", candidate.id).eq("date", date).eq("time", time).eq("status", "مجدولة").limit(1);
    if (existingError) throw existingError;
    if (existing?.length) return new Response(JSON.stringify({ error: "تم حجز هذا الموعد بالفعل" }), {
      status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

    // Create interview record
    const { data: interview, error } = await supabase.from("interviews").insert({
      user_id: candidate.user_id,
      candidate_id: candidate.id,
      candidate_name: candidate.name,
      position: candidate.role || "غير محدد",
      date,
      time,
      type: "عن بُعد",
      status: "مجدولة",
      notes: "تم الحجز ذاتياً بواسطة المرشح باستخدام رمز التتبع",
    }).select().single();

    if (error) {
      console.error("Insert error:", error);
      throw new Error("فشل حجز المقابلة");
    }

    // Update candidate stage if still at early stages
    const earlyStages = ["تقديم الطلب", "مراجعة السيرة"];
    if (earlyStages.includes(candidate.stage || "تقديم الطلب")) {
      await supabase.from("candidates").update({ stage: "فحص هاتفي" }).eq("id", candidate.id);
    }

    // Create notification for the recruiter
    await supabase.from("notifications").insert({
      user_id: candidate.user_id,
      title: `${candidate.name} حجز موعد مقابلة`,
      description: `حجز المرشح ${candidate.name} موعد مقابلة يوم ${date} الساعة ${time}`,
      type: "interview",
    });

    return new Response(JSON.stringify({ success: true, interviewId: interview.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("book-interview error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
