import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendEmail(supabaseUrl: string, to: string, subject: string, html: string, userId?: string) {
  try {
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resp = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ to, subject, html, user_id: userId }),
    });
    if (!resp.ok) {
      console.error("Email send failed:", await resp.text());
    }
  } catch (e) {
    console.error("Email send error:", e);
  }
}

function buildApprovalEmail(
  candidateName: string,
  newStage: string,
  jobTitle: string,
  meetingUrl?: string,
  interviewDate?: string,
  interviewTime?: string
): string {
  return `
  <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
    <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">✅ تحديث حالة طلبك</h1>
    </div>
    <div style="padding: 30px;">
      <p style="font-size: 16px; color: #374151;">مرحباً <strong>${candidateName}</strong>،</p>
      <p style="font-size: 16px; color: #374151;">يسعدنا إبلاغك بأنه تم نقلك إلى مرحلة جديدة في عملية التوظيف:</p>
      <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
        <p style="font-size: 14px; color: #6b7280; margin: 0 0 5px;">المرحلة الحالية</p>
        <p style="font-size: 20px; font-weight: bold; color: #059669; margin: 0;">${newStage}</p>
        ${jobTitle ? `<p style="font-size: 14px; color: #6b7280; margin: 10px 0 0;">الوظيفة: ${jobTitle}</p>` : ''}
      </div>

      ${meetingUrl ? `
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
        <p style="font-size: 16px; font-weight: bold; color: #166534; margin: 0 0 8px;">🎥 موعد المقابلة واجتماع الفيديو (Jitsi Meet)</p>
        ${interviewDate ? `<p style="font-size: 14px; color: #374151; margin: 0 0 12px;">الموعد: <strong>${interviewDate}</strong> الساعة <strong>${interviewTime || '10:00 صباحاً'}</strong></p>` : ''}
        <a href="${meetingUrl}" target="_blank" style="display: inline-block; background: #059669; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 15px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">انضم للاجتماع المباشر (Jitsi Meet) 🎥</a>
      </div>
      ` : ''}

      <p style="font-size: 14px; color: #6b7280;">سيتم التواصل معك قريباً بخصوص الخطوات التالية.</p>
      <p style="font-size: 14px; color: #6b7280;">مع تحيات فريق التوظيف</p>
    </div>
  </div>`;
}

function buildRejectionEmail(candidateName: string, stage: string, reason: string, jobTitle: string): string {
  return `
  <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
    <div style="background: linear-gradient(135deg, #6b7280, #4b5563); padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">تحديث حالة طلبك</h1>
    </div>
    <div style="padding: 30px;">
      <p style="font-size: 16px; color: #374151;">مرحباً <strong>${candidateName}</strong>،</p>
      <p style="font-size: 16px; color: #374151;">نشكرك على اهتمامك والوقت الذي استثمرته في عملية التقديم${jobTitle ? ` لوظيفة ${jobTitle}` : ''}.</p>
      <p style="font-size: 16px; color: #374151;">نأسف لإبلاغك بأنه لم يتم المضي قدماً في طلبك في هذه المرحلة.</p>
      ${reason ? `<div style="background: #f9fafb; border-radius: 8px; padding: 15px; margin: 15px 0;"><p style="font-size: 14px; color: #6b7280; margin: 0;"><strong>ملاحظة:</strong> ${reason}</p></div>` : ''}
      <p style="font-size: 14px; color: #6b7280;">نتمنى لك كل التوفيق في مسيرتك المهنية.</p>
      <p style="font-size: 14px; color: #6b7280;">مع تحيات فريق التوظيف</p>
    </div>
  </div>`;
}

function buildAssessmentEmail(candidateName: string, assessmentTitle: string, assessmentUrl: string, jobTitle: string): string {
  return `
  <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
    <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">📝 اختبار مطلوب</h1>
    </div>
    <div style="padding: 30px;">
      <p style="font-size: 16px; color: #374151;">مرحباً <strong>${candidateName}</strong>،</p>
      <p style="font-size: 16px; color: #374151;">كجزء من عملية التوظيف${jobTitle ? ` لوظيفة ${jobTitle}` : ''}، نرجو منك إكمال الاختبار التالي:</p>
      <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
        <p style="font-size: 14px; color: #6b7280; margin: 0 0 10px;">الاختبار</p>
        <p style="font-size: 18px; font-weight: bold; color: #4f46e5; margin: 0 0 15px;">${assessmentTitle}</p>
        <a href="${assessmentUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-size: 16px; font-weight: bold;">ابدأ الاختبار الآن</a>
      </div>
      <p style="font-size: 14px; color: #6b7280;">يرجى إكمال الاختبار في أقرب وقت ممكن.</p>
      <p style="font-size: 14px; color: #6b7280;">مع تحيات فريق التوظيف</p>
    </div>
  </div>`;
}

async function getCustomTemplate(
  supabase: any,
  companyId: string | null,
  templateType: "approval" | "rejection" | "assessment"
) {
  if (!companyId) return null;

  const companyIds = [companyId];
  try {
    const { data: comp } = await supabase
      .from("companies")
      .select("parent_company_id")
      .eq("id", companyId)
      .maybeSingle();
    if (comp?.parent_company_id) {
      companyIds.push(comp.parent_company_id);
    }
  } catch (e) {
    console.error("Failed to query parent company for template inheritance:", e);
  }

  for (const cid of companyIds.filter(Boolean)) {
    const { data, error } = await supabase
      .from("notification_templates")
      .select("subject, body_html")
      .eq("company_id", cid)
      .eq("type", templateType)
      .maybeSingle();
    if (!error && data) {
      return data;
    }
  }
  return null;
}

function compileTemplate(
  bodyHtml: string,
  subjectText: string,
  vars: {
    candidateName: string;
    stageName: string;
    jobTitle: string;
    rejectionReason?: string;
    assessmentUrl?: string;
    assessmentTitle?: string;
  }
) {
  const replaceAll = (text: string) => {
    return text
      .replace(/{candidate_name}/g, vars.candidateName)
      .replace(/{stage_name}/g, vars.stageName)
      .replace(/{job_title}/g, vars.jobTitle)
      .replace(/{rejection_reason}/g, vars.rejectionReason || "")
      .replace(/{assessment_url}/g, vars.assessmentUrl || "")
      .replace(/{assessment_title}/g, vars.assessmentTitle || "");
  };

  return {
    subject: replaceAll(subjectText),
    html: replaceAll(bodyHtml),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { candidateId, newStage, action, rejectionReason } = await req.json();

    if (typeof candidateId !== "string" || !/^[0-9a-f-]{36}$/i.test(candidateId) ||
        !["approve", "reject"].includes(action) ||
        (action === "approve" && (typeof newStage !== "string" || !newStage.trim()))) {
      return new Response(JSON.stringify({ error: "Invalid candidate or stage change" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token || token === anonKey || token === Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || token === serviceKey) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authClient = createClient(supabaseUrl, anonKey);
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = user.id;

    const supabase = createClient(supabaseUrl, serviceKey);

    let candidate: any = null;
    let application: any = null;
    const { data: candData, error: candidateError } = await supabase
      .from("candidates")
      .select("*, jobs(title, user_id)")
      .eq("id", candidateId)
      .maybeSingle();

    if (candidateError) throw candidateError;

    if (candData) {
      candidate = candData;
    } else {
      // Look up in applications table
      const { data: appData, error: applicationError } = await supabase
        .from("applications")
        .select("*, jobs(title, user_id, company_id)")
        .eq("id", candidateId)
        .maybeSingle();
      if (applicationError) throw applicationError;
      application = appData;
    }

    if (!candidate && !application) {
      return new Response(JSON.stringify({ error: "Candidate not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const companyId = candidate?.company_id || application?.company_id || application?.jobs?.company_id;
    const [{ data: platformRole, error: roleError }, { data: membership, error: memberError }] = await Promise.all([
      supabase.from("platform_roles").select("role").eq("user_id", callerId).eq("role", "super_admin").maybeSingle(),
      companyId
        ? supabase.from("company_members").select("company_id").eq("company_id", companyId).eq("user_id", callerId).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);
    if (roleError || memberError) throw roleError || memberError;
    if (!platformRole && !membership && !(candidate && !companyId && candidate.user_id === callerId)) {
      return new Response(JSON.stringify({ error: "Forbidden: candidate belongs to another company" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only an authorized recruiter can create a candidate from an application.
    if (application) {
      const { data: createdCand, error: createError } = await supabase.from("candidates").upsert({
        id: application.id,
        user_id: application.jobs?.user_id || callerId,
        company_id: companyId || null,
        job_id: application.job_id,
        name: application.name,
        email: application.email,
        phone: application.phone,
        role: application.jobs?.title || application.specialty || "مرشح",
        stage: "تقديم الطلب",
        status: "قيد المراجعة",
        tracking_code: application.tracking_code || null,
        experience: application.experience || null,
        resume_url: application.resume_url || null,
        skills: application.skills || null,
        summary: application.cover_letter || null,
        source: "رابط التقديم المباشر",
      }, { onConflict: "id", ignoreDuplicates: true }).select("*, jobs(title, user_id)").single();
      if (createError) throw createError;
      candidate = createdCand;
    }

    const oldStage = candidate.stage;
    const jobTitle = candidate.jobs?.title || "";
    const updates: Record<string, any> = {};

    if (action === "reject") {
      updates.status = "مرفوض";
      updates.stage = oldStage;
    } else if (action === "approve") {
      updates.stage = newStage;
      if (newStage === "العرض الوظيفي") {
        updates.status = "مقبول";
      }
    }

    const { error: updateError } = await supabase
      .from("candidates")
      .update(updates)
      .eq("id", candidateId);

    if (updateError) throw updateError;

    // Stage labels
    const stageLabels: Record<string, string> = {
      "تقديم الطلب": "تقديم الطلب",
      "مراجعة السيرة": "مراجعة السيرة الذاتية",
      "فحص هاتفي": "الفحص الهاتفي",
      "مقابلة تقنية": "المقابلة التقنية",
      "مقابلة نهائية": "المقابلة النهائية",
      "العرض الوظيفي": "العرض الوظيفي",
    };

    let notifTitle: string;
    let notifDesc: string;

    if (action === "reject") {
      notifTitle = `تم رفض المرشح: ${candidate.name}`;
      notifDesc = `تم رفض ${candidate.name} في مرحلة "${stageLabels[oldStage] || oldStage}"${rejectionReason ? ` - السبب: ${rejectionReason}` : ""}`;
    } else {
      notifTitle = `تم نقل ${candidate.name} إلى "${stageLabels[newStage] || newStage}"`;
      notifDesc = `انتقل المرشح ${candidate.name} من "${stageLabels[oldStage] || oldStage}" إلى "${stageLabels[newStage] || newStage}"`;
    }

    await supabase.from("notifications").insert({
      user_id: candidate.user_id,
      title: notifTitle,
      description: notifDesc,
      type: action === "reject" ? "rejection" : "stage_change",
    });

    await supabase.from("activity_log").insert({
      user_id: candidate.user_id,
      action: action === "reject" ? "رفض مرشح" : "نقل مرشح",
      entity_type: "candidate",
      entity_id: candidateId,
      details: action === "reject"
        ? `تم رفض ${candidate.name}${rejectionReason ? `: ${rejectionReason}` : ""}`
        : `تم نقل ${candidate.name} من "${oldStage}" إلى "${newStage}"`,
    });

    // Send email to candidate
    if (candidate.email) {
      if (action === "reject") {
        const customTpl = await getCustomTemplate(supabase, candidate.company_id, "rejection");
        let subject = `تحديث حالة طلبك${jobTitle ? ` - ${jobTitle}` : ''}`;
        let html = buildRejectionEmail(candidate.name, oldStage, rejectionReason || "", jobTitle);
        
        if (customTpl) {
          const compiled = compileTemplate(customTpl.body_html, customTpl.subject, {
            candidateName: candidate.name,
            stageName: stageLabels[oldStage] || oldStage,
            jobTitle,
            rejectionReason: rejectionReason || "",
          });
          subject = compiled.subject;
          html = compiled.html;
        }
        await sendEmail(supabaseUrl, candidate.email, subject, html, candidate.user_id);
      } else if (action === "approve") {
        // Fetch latest candidate interview if present
        const { data: interviewData } = await supabase
          .from("interviews")
          .select("meeting_url, date, time")
          .eq("candidate_id", candidateId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const customTpl = await getCustomTemplate(supabase, candidate.company_id, "approval");
        let subject = `تحديث حالة طلبك - ${stageLabels[newStage] || newStage}`;
        let html = buildApprovalEmail(
          candidate.name,
          newStage,
          jobTitle,
          interviewData?.meeting_url || undefined,
          interviewData?.date || undefined,
          interviewData?.time || undefined
        );

        if (customTpl) {
          const compiled = compileTemplate(customTpl.body_html, customTpl.subject, {
            candidateName: candidate.name,
            stageName: stageLabels[newStage] || newStage,
            jobTitle,
            meetingUrl: interviewData?.meeting_url || "",
            interviewDate: interviewData?.date || "",
            interviewTime: interviewData?.time || "",
          });
          subject = compiled.subject;
          html = compiled.html;
        }
        await sendEmail(supabaseUrl, candidate.email, subject, html, candidate.user_id);

        // Check if the new stage has a linked assessment and auto-send
        const { data: stageData } = await supabase
          .from("pipeline_stages")
          .select("assessment_id")
          .eq("user_id", candidate.user_id)
          .eq("name", newStage)
          .maybeSingle();

        if (stageData?.assessment_id) {
          const { data: assessment } = await supabase
            .from("assessments")
            .select("token, title")
            .eq("id", stageData.assessment_id)
            .eq("is_active", true)
            .maybeSingle();

          if (assessment) {
            const assessmentUrl = `${supabaseUrl.replace('/rest/v1', '').replace('https://odtpjvmayutbwqhlbvsr.supabase.co', Deno.env.get('APP_URL') || 'https://ai-hire-buddy-22.lovable.app')}/assessment/${assessment.token}`;
            const customTpl = await getCustomTemplate(supabase, candidate.company_id, "assessment");
            let subject = `اختبار مطلوب: ${assessment.title}`;
            let html = buildAssessmentEmail(candidate.name, assessment.title, assessmentUrl, jobTitle);

            if (customTpl) {
              const compiled = compileTemplate(customTpl.body_html, customTpl.subject, {
                candidateName: candidate.name,
                stageName: stageLabels[newStage] || newStage,
                jobTitle,
                assessmentUrl,
                assessmentTitle: assessment.title,
              });
              subject = compiled.subject;
              html = compiled.html;
            }
            await sendEmail(supabaseUrl, candidate.email, subject, html, candidate.user_id);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, candidate: { ...candidate, ...updates } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
