import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getExtendedCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getExtendedCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { candidateId, jobId } = await req.json();

    if (typeof candidateId !== "string" || !/^[0-9a-f-]{36}$/i.test(candidateId)) {
      return new Response(JSON.stringify({ error: "Invalid candidate" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const authHeader = req.headers.get("Authorization") || "";
    const tokenStr = authHeader.replace(/^Bearer\s+/i, "").trim();
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!tokenStr || tokenStr === anonKey || tokenStr === Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || tokenStr === supabaseKey) {
      return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const authClient = createClient(supabaseUrl, anonKey);
    const { data: { user }, error: userError } = await authClient.auth.getUser(tokenStr);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const callerId = user.id;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch candidate
    const { data: candidate, error: candErr } = await supabase
      .from("candidates")
      .select("*")
      .eq("id", candidateId)
      .single();
    if (candErr || !candidate) throw new Error("المرشح غير موجود");

    const [{ data: platformRole, error: roleError }, { data: member, error: memberError }] = await Promise.all([
      supabase.from("platform_roles").select("role").eq("user_id", callerId).eq("role", "super_admin").maybeSingle(),
      candidate.company_id
        ? supabase.from("company_members").select("id").eq("company_id", candidate.company_id).eq("user_id", callerId).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);
    if (roleError || memberError) throw roleError || memberError;
    if (!platformRole && !member && !(candidate.user_id === callerId && !candidate.company_id)) {
      return new Response(JSON.stringify({ error: "Forbidden: candidate belongs to another company" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (jobId && jobId !== candidate.job_id) {
      return new Response(JSON.stringify({ error: "Job does not match candidate" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch job if provided
    let job = null;
    if (jobId) {
      const { data } = await supabase.from("jobs").select("*").eq("id", jobId).single();
      job = data;
    } else if (candidate.job_id) {
      const { data } = await supabase.from("jobs").select("*").eq("id", candidate.job_id).single();
      job = data;
    }

    let evaluation = null;

    // Try External LLM Gateway
    const LOVABLE_API_KEY = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("LOVABLE_API_KEY");
    if (LOVABLE_API_KEY) {
      try {
        const isDirectGemini = (LOVABLE_API_KEY.startsWith("AIza") || LOVABLE_API_KEY.startsWith("AQ."));
        const API_URL = isDirectGemini
          ? `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`
          : "https://api.lovable.dev/v1/chat/completions";

        const candidateInfo = `
الاسم: ${candidate.name}
الدور: ${candidate.role || "غير محدد"}
المهارات: ${(candidate.skills || []).join(", ") || "غير محددة"}
الخبرة: ${candidate.experience || "غير محددة"}
التعليم: ${candidate.education || "غير محدد"}
الملخص: ${candidate.summary || "غير متوفر"}
`;

        const jobInfo = job ? `
المسمى الوظيفي: ${job.title}
القسم: ${job.department}
الموقع: ${job.location}
نوع العمل: ${job.type}
مستوى الخبرة: ${job.experience_level || "غير محدد"}
الوصف: ${job.description || "غير متوفر"}
المتطلبات: ${(job.requirements || []).join(", ") || "غير محددة"}
` : "لا توجد وظيفة محددة للمقارنة";

        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: isDirectGemini ? "gemini-2.0-flash" : "google/gemini-2.0-flash",
            tools: [
              {
                type: "function",
                function: {
                  name: "evaluate_candidate",
                  description: "تقييم عالي الدقة لمدى توافق المرشح مع الوظيفة",
                  parameters: {
                    type: "object",
                    properties: {
                      score: { type: "integer", description: "نسبة التوافق الكلية من 0 إلى 100" },
                      skillsMatchScore: { type: "integer", description: "درجة مطابقة المهارات (0-100)" },
                      experienceMatchScore: { type: "integer", description: "درجة مطابقة سنوات وتخصص الخبرة (0-100)" },
                      educationMatchScore: { type: "integer", description: "درجة مطابقة المؤهل العلمي (0-100)" },
                      culturalFitScore: { type: "integer", description: "درجة التوافق التنظيمي والمالي (0-100)" },
                      summary: { type: "string", description: "ملخص التقييم التحليلي في 2-3 جمل بالعربية" },
                      strengths: { type: "array", items: { type: "string" }, description: "أهم نقاط القوة البارزة (3-5 نقاط)" },
                      weaknesses: { type: "array", items: { type: "string" }, description: "الفجوات والمخاطر المتوقعة (2-4 نقاط)" },
                      recommendation: { type: "string", description: "التوصية النهائية باللغة العربية" },
                      tailoredInterviewQuestions: { type: "array", items: { type: "string" }, description: "3 أسئلة مقابلة تقنية مخصصة لهذا المرشح" },
                    },
                    required: ["score", "summary", "strengths", "weaknesses", "recommendation"],
                    additionalProperties: false,
                  },
                },
              },
            ],
            tool_choice: { type: "function", function: { name: "evaluate_candidate" } },
            messages: [
              {
                role: "system",
                content: `أنت خبير كبار الموارد البشرية ومحلل جدارات التوظيف بالذكاء الاصطناعي. قيّم المرشح التالي بدقة متناهية بناءً على معلوماته ومدى توافقه مع الوظيفة.`,
              },
              {
                role: "user",
                content: `قيّم هذا المرشح:\n\n--- معلومات المرشح ---${candidateInfo}\n--- معلومات الوظيفة ---${jobInfo}`,
              },
            ],
          }),
        });

        if (response.ok) {
          const aiData = await response.json();
          const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
          if (toolCall) {
            evaluation = JSON.parse(toolCall.function.arguments);
          }
        } else {
          console.warn("AI Gateway response not ok, status:", response.status, await response.text());
        }
      } catch (aiErr) {
        console.warn("LLM API call exception, falling back to smart evaluation:", aiErr);
      }
    }

    if (!evaluation) {
      return new Response(JSON.stringify({ error: "AI evaluation is currently unavailable" }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (typeof evaluation.score !== "number" || !Number.isFinite(evaluation.score) || evaluation.score < 0 || evaluation.score > 100) {
      throw new Error("Invalid AI evaluation score");
    }

    // Save evaluation to DB
    const { error: updateError } = await supabase
      .from("candidates")
      .update({
        ai_score: evaluation.score,
        ai_evaluation: JSON.stringify(evaluation),
      })
      .eq("id", candidateId);
    if (updateError) throw updateError;

    return new Response(JSON.stringify(evaluation), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("evaluate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
