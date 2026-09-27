import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPublicBaseUrl } from "@/lib/getPublicUrl";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X, ArrowLeft, Loader2, Send, FileText, Copy, Video, Calendar, Link2, ExternalLink, RefreshCw, XCircle, Mail, MessageCircle, Smartphone, ClipboardCheck, Eye, Award, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useOffers, useCreateOffer, useSendOffer } from "@/hooks/useOffers";
import { useInterviews, useAddInterview, useUpdateInterview, useCancelInterview } from "@/hooks/useJobs";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useActiveStages } from "@/hooks/usePipelineStages";
import { useAssessments } from "@/hooks/useQuestionBank";

export const DEFAULT_PIPELINE_STAGES = [
  "تقديم الطلب",
  "فحص السيرة",
  "اختبار تحريري",
  "مقابلة تقنية",
  "مقابلة نهائية",
  "العرض الوظيفي",
];

const FALLBACK_STAGES = DEFAULT_PIPELINE_STAGES;

export const INTERVIEW_STAGES = ["مقابلة تقنية", "مقابلة نهائية", "مقابلة شخصية", "مقابلة هاتفية", "المقابلة الفنية"];

export function isRealInterviewStage(stageName?: string | null, stageObj?: any): boolean {
  if (!stageName) return false;
  const name = stageName.trim();

  // If the stage explicitly has require_interview enabled in DB transition rules
  if (stageObj?.transition_rules?.require_interview) return true;

  // Exclude non-interview stages explicitly (CV screening, file checks, initial sorting, tests, coding tasks, offers)
  if (/سيرة|ملف|مستند|وثائق|أوراق|cv|resume|screening|تصفية|فرز|اختبار|امتحان|task|كود|عرض|offer|عقد/i.test(name)) {
    return false;
  }

  // Check for interview keywords
  return /مقابلة|interview|محادثة|انترفيو/i.test(name);
}

export function findStageIndex(stages: string[], stageName: string): number {
  if (!stageName || stages.length === 0) return 0;
  const clean = stageName.trim().toLowerCase();

  // 1. Exact match
  const exact = stages.findIndex(s => s.trim().toLowerCase() === clean);
  if (exact !== -1) return exact;

  // 2. Semantic matching for common recruitment stages
  if (/سيرة|cv|resume|screening/i.test(clean)) {
    const idx = stages.findIndex(s => /سيرة|cv|resume|screening/i.test(s));
    if (idx !== -1) return idx;
  }
  if (/تقديم|applied|طلب|جديد|تسجيل/i.test(clean)) {
    const idx = stages.findIndex(s => /تقديم|applied|طلب|جديد|تسجيل/i.test(s));
    if (idx !== -1) return idx;
  }
  if (/اختبار|امتحان|task|assessment|test|كود/i.test(clean)) {
    const idx = stages.findIndex(s => /اختبار|امتحان|task|assessment|test|كود/i.test(s));
    if (idx !== -1) return idx;
  }
  if (/مقابلة.*(أولى|مبدئية|هاتفية)|phone/i.test(clean)) {
    const idx = stages.findIndex(s => /مقابلة.*(أولى|مبدئية|هاتفية)|phone/i.test(s));
    if (idx !== -1) return idx;
  }
  if (/مقابلة.*(نهائية|أخيرة)|final/i.test(clean)) {
    const idx = stages.findIndex(s => /مقابلة.*(نهائية|أخيرة)|final/i.test(s));
    if (idx !== -1) return idx;
  }
  if (/مقابلة|interview/i.test(clean)) {
    const idx = stages.findIndex(s => /مقابلة|interview/i.test(s));
    if (idx !== -1) return idx;
  }
  if (/عرض|offer|عقد|توظيف|قوى/i.test(clean)) {
    const idx = stages.findIndex(s => /عرض|offer|عقد|توظيف|قوى/i.test(s));
    if (idx !== -1) return idx;
  }

  return 0;
}

function generateRoomId() {
  return `tawzeef-x-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

interface StageActionsProps {
  candidateId?: string;
  candidateName?: string;
  candidateEmail?: string | null;
  currentStage?: string;
  status?: string;
  jobId?: string | null;
  candidateRole?: string | null;
  candidate?: any;
  onStageChange?: (newStage: string, newStatus: string) => void;
}

export default function StageActions(props: StageActionsProps) {
  const candidate = props.candidate;
  const onStageChange = props.onStageChange;
  const candidateId = props.candidateId || candidate?.id || "";
  const candidateName = props.candidateName || candidate?.name || "مرشح";
  const candidateEmail = props.candidateEmail ?? candidate?.email ?? null;
  const currentStage = props.currentStage || candidate?.stage || "تقديم الطلب";
  const status = props.status || candidate?.status || "جديد";
  const jobId = props.jobId ?? candidate?.job_id ?? null;
  const candidateRole = props.candidateRole ?? candidate?.role ?? null;
  const queryClient = useQueryClient();
  const activeStages = useActiveStages();
  const STAGES: string[] = activeStages.length > 0
    ? activeStages.map(s => s.name)
    : FALLBACK_STAGES.map(s => (typeof s === "string" ? s : (s as any).name || (s as any).id || String(s)));
  const [loading, setLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showAssessmentSection, setShowAssessmentSection] = useState(false);

  // Interview scheduling
  const [showInterviewDialog, setShowInterviewDialog] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    date: "",
    time: "",
    interviewer: "",
    meeting_type: "jitsi" as "jitsi" | "external",
    external_link: "",
  });
  const addInterview = useAddInterview();
  const updateInterview = useUpdateInterview();
  const cancelInterview = useCancelInterview();
  const { data: interviews } = useInterviews();
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({ date: "", time: "", interviewer: "" });

  // Offers
  const { data: offers } = useOffers();
  const createOffer = useCreateOffer();
  const sendOffer = useSendOffer();

  // Assessments
  const { data: allAssessments = [] } = useAssessments();
  const [selectedAssessmentOverride, setSelectedAssessmentOverride] = useState<any>(null);

  const currentStageObj = activeStages.find(s => s.name === currentStage);
  const stageAssessmentId = (currentStageObj as any)?.assessment_id;

  const isAssessmentStage =
    /اختبار|امتحان|assessment|test|كود|مهمة/i.test(currentStage) ||
    !!stageAssessmentId ||
    !!(currentStageObj?.transition_rules?.require_assessment);

  const activeStageAssessment =
    selectedAssessmentOverride ||
    (allAssessments || []).find(a => a.id === stageAssessmentId) ||
    (jobId ? (allAssessments || []).find(a => a.job_id === jobId && a.is_active) : null);

  // Offer creation dialog
  const [showOfferCreateDialog, setShowOfferCreateDialog] = useState(false);
  const [offerForm, setOfferForm] = useState({
    position: candidateRole || "",
    department: "",
    salary: "",
    currency: "SAR",
    start_date: "",
    offer_type: "full-time",
    benefits: "",
    additional_terms: "",
    expires_days: "7",
  });

  const candidateOffer = (offers || []).find(o => o.candidate_id === candidateId);
  const candidateInterview = (interviews || []).find(
    i => i.candidate_id === candidateId && i.status === "مجدولة"
  ) || (interviews || []).find(
    i => i.candidate_id === candidateId
  );

  const currentIdx = findStageIndex(STAGES, currentStage);
  const nextStage = currentIdx >= 0 && currentIdx < STAGES.length - 1 ? STAGES[currentIdx + 1] : null;
  const prevStage = currentIdx > 0 ? STAGES[currentIdx - 1] : null;
  const isRejected = status === "مرفوض";
  const isAccepted = status === "مقبول";
  const isLastStage = currentIdx === STAGES.length - 1;

  // Real interview stage check - CV screening (فحص السيرة) is NEVER an interview stage
  const isCurrentAnInterviewStage = isRealInterviewStage(currentStage, currentStageObj);
  const isInterviewStage = isCurrentAnInterviewStage;

  const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    draft: { label: "مسودة", color: "bg-muted text-muted-foreground" },
    sent: { label: "مُرسل", color: "bg-primary/10 text-primary" },
    viewed: { label: "تم العرض", color: "bg-warning/10 text-warning" },
    accepted: { label: "مقبول", color: "bg-success/10 text-success" },
    rejected: { label: "مرفوض", color: "bg-destructive/10 text-destructive" },
  };

  const triggerAIEvaluation = async () => {
    try {
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evaluate-candidate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ candidateId, jobId }),
      });
      await queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast({ title: "تم تشغيل التقييم الذكي تلقائياً ✅" });
    } catch {
      // silent fail
    }
  };

  const updateCandidateStatus = async (newStatus: string) => {
    await supabase
      .from("candidates")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", candidateId);
    await queryClient.invalidateQueries({ queryKey: ["candidates"] });
  };

  const handleCreateAndSendOffer = async () => {
    try {
      const expiresDays = parseInt(offerForm.expires_days) || 7;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresDays);

      const result = await createOffer.mutateAsync({
        candidate_id: candidateId,
        job_id: jobId || undefined,
        position: offerForm.position,
        salary: Number(offerForm.salary) || 0,
        currency: offerForm.currency,
        start_date: offerForm.start_date || undefined,
        offer_type: offerForm.offer_type,
        benefits: offerForm.benefits ? offerForm.benefits.split("\n").filter(Boolean) : undefined,
        additional_terms: offerForm.additional_terms || undefined,
        expires_at: expiresAt.toISOString(),
      });
      await sendOffer.mutateAsync(result.id);
      await updateCandidateStatus("مقبول");
      setShowOfferCreateDialog(false);
      triggerAIEvaluation();
      toast({ title: "تم إنشاء وإرسال العرض الوظيفي بنجاح 📄", description: "يمكن للمرشح مراجعة العرض وقبوله مباشرة" });
    } catch {
      // errors handled by mutation hooks
    }
  };

  const handleSendExistingOffer = async () => {
    if (!candidateOffer) return;
    await sendOffer.mutateAsync(candidateOffer.id);
    await updateCandidateStatus("مقبول");
    triggerAIEvaluation();
  };

  const sendInterviewEmail = async (email: string, meetingUrl: string, date: string, time: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      const pad = (n: number) => String(n).padStart(2, "0");
      let startStr = "";
      let endStr = "";
      const dt = new Date(`${date}T${time}`);
      if (!isNaN(dt.getTime())) {
        startStr = `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`;
        const endDt = new Date(dt.getTime() + 60 * 60000); // Default 60 mins duration
        endStr = `${endDt.getFullYear()}${pad(endDt.getMonth() + 1)}${pad(endDt.getDate())}T${pad(endDt.getHours())}${pad(endDt.getMinutes())}00`;
      } else {
        const cleanDate = date.replace(/-/g, "");
        const cleanTime = time.replace(/:/g, "").slice(0, 4);
        startStr = `${cleanDate}T${cleanTime}00`;
        endStr = `${cleanDate}T${String(Number(cleanTime) + 100).padStart(4, "0")}00`;
      }
      
      const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@tawzeef-x`;
      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Tawzeef-X//Interview//AR",
        "BEGIN:VEVENT",
        `DTSTART:${startStr}`,
        `DTEND:${endStr}`,
        `SUMMARY:مقابلة شخصية - ${candidateRole || "وظيفة"}`,
        `DESCRIPTION:دعوة لحضور مقابلة بخصوص وظيفة ${candidateRole || ""}. رابط اللقاء: ${meetingUrl}`,
        `LOCATION:${meetingUrl}`,
        `UID:${uid}`,
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");

      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: email,
          subject: `دعوة لحضور مقابلة — ${candidateRole || "وظيفة"}`,
          user_id: user?.id,
          html: `
            <div dir="rtl" style="font-family: 'Cairo', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
              <div style="background: linear-gradient(135deg, #2563eb, #3b82f6); padding: 24px 32px; border-radius: 12px; margin-bottom: 24px;">
                <h1 style="color: white; margin: 0; font-size: 22px;">دعوة لحضور مقابلة 🎯</h1>
              </div>
              <div style="background: white; padding: 28px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <p style="font-size: 16px; color: #1e293b; margin-bottom: 8px;">مرحباً،</p>
                <p style="font-size: 15px; color: #475569; line-height: 1.8;">يسعدنا إعلامك بأنه تمت جدولة مقابلة بخصوص وظيفة <strong>${candidateRole || ""}</strong>.</p>
                <div style="background: #f1f5f9; padding: 16px 20px; border-radius: 10px; margin: 20px 0;">
                  <p style="margin: 4px 0; font-size: 14px; color: #334155;">📅 <strong>التاريخ:</strong> ${new Date(date).toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                  <p style="margin: 4px 0; font-size: 14px; color: #334155;">⏰ <strong>الوقت:</strong> ${time}</p>
                </div>
                <a href="${meetingUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-size: 15px; font-weight: bold; margin-top: 12px;">
                  🎥 انضم للمقابلة
                </a>
                <p style="font-size: 13px; color: #94a3b8; margin-top: 20px;">تم إرفاق ملف التقويم (invite.ics) لإضافته لتقويمك الشخصي مباشرة.</p>
                <p style="font-size: 13px; color: #94a3b8; margin-top: 20px;">أو انسخ الرابط التالي:</p>
                <p style="font-size: 12px; color: #64748b; word-break: break-all; background: #f8fafc; padding: 10px; border-radius: 6px;">${meetingUrl}</p>
              </div>
              <p style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 20px;">بالتوفيق! — فريق التوظيف</p>
            </div>
          `,
          attachments: [
            {
              filename: "invite.ics",
              content: icsContent,
              contentType: "text/calendar",
            }
          ]
        }),
      });
      toast({ title: "تم إرسال رابط المقابلة وملف التقويم بالبريد الإلكتروني ✅" });
    } catch (e) {
      console.error("Failed to send interview email:", e);
    }
  };

  const sendRescheduleEmail = async (email: string, meetingUrl: string, oldDate: string, oldTime: string, newDate: string, newTime: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: email,
          subject: `تحديث موعد المقابلة — ${candidateRole || "وظيفة"}`,
          user_id: user?.id,
          html: `
            <div dir="rtl" style="font-family: 'Cairo', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
              <div style="background: linear-gradient(135deg, #f59e0b, #f97316); padding: 24px 32px; border-radius: 12px; margin-bottom: 24px;">
                <h1 style="color: white; margin: 0; font-size: 22px;">تم إعادة جدولة المقابلة 🔄</h1>
              </div>
              <div style="background: white; padding: 28px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <p style="font-size: 16px; color: #1e293b; margin-bottom: 8px;">مرحباً <strong>${candidateName}</strong>،</p>
                <p style="font-size: 15px; color: #475569; line-height: 1.8;">نود إعلامك بأنه تم تعديل موعد المقابلة الخاصة بك.</p>
                <div style="background: #fef3c7; padding: 12px 16px; border-radius: 8px; margin: 16px 0; text-decoration: line-through; opacity: 0.7;">
                  <p style="margin: 2px 0; font-size: 13px; color: #92400e;">📅 الموعد السابق: ${new Date(oldDate).toLocaleDateString("ar-SA")} — ${oldTime}</p>
                </div>
                <div style="background: #f0fdf4; padding: 16px 20px; border-radius: 10px; margin: 16px 0; border: 1px solid #bbf7d0;">
                  <p style="margin: 4px 0; font-size: 14px; color: #166534;">📅 <strong>الموعد الجديد:</strong> ${new Date(newDate).toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                  <p style="margin: 4px 0; font-size: 14px; color: #166534;">⏰ <strong>الوقت:</strong> ${newTime}</p>
                </div>
                ${meetingUrl ? `<a href="${meetingUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-size: 15px; font-weight: bold; margin-top: 12px;">🎥 رابط المقابلة</a>` : ""}
              </div>
              <p style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 20px;">بالتوفيق! — فريق التوظيف</p>
            </div>
          `,
        }),
      });
      toast({ title: "تم إرسال إشعار إعادة الجدولة للمرشح ✅" });
    } catch {
      console.error("Failed to send reschedule email");
    }
  };

  const sendCancellationEmail = async (email: string, date: string, time: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: email,
          subject: `إلغاء موعد المقابلة — ${candidateRole || "وظيفة"}`,
          user_id: user?.id,
          html: `
            <div dir="rtl" style="font-family: 'Cairo', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
              <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 24px 32px; border-radius: 12px; margin-bottom: 24px;">
                <h1 style="color: white; margin: 0; font-size: 22px;">تم إلغاء المقابلة ❌</h1>
              </div>
              <div style="background: white; padding: 28px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <p style="font-size: 16px; color: #1e293b; margin-bottom: 8px;">مرحباً <strong>${candidateName}</strong>،</p>
                <p style="font-size: 15px; color: #475569; line-height: 1.8;">نعتذر عن إبلاغك بأنه تم إلغاء موعد المقابلة التالي:</p>
                <div style="background: #fef2f2; padding: 16px 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #fecaca;">
                  <p style="margin: 4px 0; font-size: 14px; color: #991b1b;">📅 <strong>التاريخ:</strong> ${new Date(date).toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                  <p style="margin: 4px 0; font-size: 14px; color: #991b1b;">⏰ <strong>الوقت:</strong> ${time}</p>
                </div>
                <p style="font-size: 15px; color: #475569; line-height: 1.8;">سيتم التواصل معك قريباً بخصوص الخطوات التالية.</p>
              </div>
              <p style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 20px;">شكراً لتفهمك — فريق التوظيف</p>
            </div>
          `,
        }),
      });
      toast({ title: "تم إرسال إشعار الإلغاء للمرشح ✅" });
    } catch {
      console.error("Failed to send cancellation email");
    }
  };

  const sendAssessmentEmail = async (email: string, assessmentTitle: string, assessmentToken: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const assessmentUrl = `${window.location.origin}/assessment/${assessmentToken}`;

      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: email,
          subject: `دعوة لإجراء اختبار تحريري — ${assessmentTitle}`,
          user_id: user?.id,
          html: `
            <div dir="rtl" style="font-family: 'Cairo', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
              <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px 32px; border-radius: 12px; margin-bottom: 24px;">
                <h1 style="color: white; margin: 0; font-size: 22px;">دعوة لاجتياز اختبار تحريري 📝</h1>
              </div>
              <div style="background: white; padding: 28px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <p style="font-size: 16px; color: #1e293b; margin-bottom: 8px;">مرحباً <strong>${candidateName}</strong>،</p>
                <p style="font-size: 15px; color: #475569; line-height: 1.8;">كجزء من مراحل التقييم لوظيفة <strong>${candidateRole || ""}</strong>، نرجو منك التكرم باستكمال الاختبار التحريري التالي:</p>
                <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;">
                  <p style="font-size: 14px; color: #6366f1; margin: 0 0 5px;">عنوان الاختبار</p>
                  <p style="font-size: 18px; font-weight: bold; color: #312e81; margin: 0 0 15px;">${assessmentTitle}</p>
                  <a href="${assessmentUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-size: 15px; font-weight: bold;">
                    📝 ابدأ الاختبار الآن
                  </a>
                </div>
                <p style="font-size: 13px; color: #94a3b8;">يرجى فتح الرابط واستكمال الأسئلة في أقرب وقت.</p>
                <p style="font-size: 12px; color: #64748b; word-break: break-all; background: #f8fafc; padding: 10px; border-radius: 6px;">${assessmentUrl}</p>
              </div>
              <p style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 20px;">بالتوفيق! — فريق التوظيف</p>
            </div>
          `,
        }),
      });
      toast({ title: "تم إرسال رابط الاختبار التحريري بالبريد الإلكتروني بنجاح ✅" });
    } catch (e) {
      console.error("Failed sending assessment email:", e);
      toast({ title: "خطأ في الإرسال", description: "تعذر إرسال البريد الإلكتروني", variant: "destructive" });
    }
  };

  const handleRescheduleInterview = async () => {
    if (!candidateInterview || !rescheduleForm.date || !rescheduleForm.time) {
      toast({ title: "خطأ", description: "يرجى تحديد التاريخ والوقت الجديدين", variant: "destructive" });
      return;
    }

    const oldDate = candidateInterview.date;
    const oldTime = candidateInterview.time;

    updateInterview.mutate(
      {
        id: candidateInterview.id,
        date: rescheduleForm.date,
        time: rescheduleForm.time,
        interviewer: rescheduleForm.interviewer || candidateInterview.interviewer || undefined,
      },
      {
        onSuccess: () => {
          setShowRescheduleDialog(false);
          setRescheduleForm({ date: "", time: "", interviewer: "" });
          toast({ title: "تم إعادة جدولة المقابلة ✅" });
          queryClient.invalidateQueries({ queryKey: ["interviews"] });

          if (candidateEmail) {
            sendRescheduleEmail(
              candidateEmail,
              candidateInterview.meeting_url || "",
              oldDate,
              oldTime,
              rescheduleForm.date,
              rescheduleForm.time
            );
          }
        },
      }
    );
  };

  const handleCancelInterview = async () => {
    if (!candidateInterview) return;
    
    const date = candidateInterview.date;
    const time = candidateInterview.time;

    cancelInterview.mutate(candidateInterview.id, {
      onSuccess: () => {
        setShowCancelConfirm(false);
        queryClient.invalidateQueries({ queryKey: ["interviews"] });

        if (candidateEmail) {
          sendCancellationEmail(candidateEmail, date, time);
        }
      },
    });
  };

  const handleScheduleInterview = async () => {
    if (!interviewForm.date || !interviewForm.time) {
      toast({ title: "خطأ", description: "يرجى تحديد التاريخ والوقت", variant: "destructive" });
      return;
    }

    let meetingUrl = "";
    if (interviewForm.meeting_type === "jitsi") {
      const roomId = generateRoomId();
      meetingUrl = `${window.location.origin}/meeting/${roomId}?name=${encodeURIComponent(candidateName)}&position=${encodeURIComponent(candidateRole || "")}`;
    } else {
      meetingUrl = interviewForm.external_link;
    }

    addInterview.mutate(
      {
        candidate_name: candidateName,
        position: candidateRole || "غير محدد",
        date: interviewForm.date,
        time: interviewForm.time,
        type: "عن بُعد",
        interviewer: interviewForm.interviewer,
        candidate_id: candidateId,
        meeting_url: meetingUrl,
      },
      {
        onSuccess: async () => {
          setShowInterviewDialog(false);
          setInterviewForm({ date: "", time: "", interviewer: "", meeting_type: "jitsi", external_link: "" });
          queryClient.invalidateQueries({ queryKey: ["interviews"] });

          // Auto-send email to candidate
          if (candidateEmail && meetingUrl) {
            sendInterviewEmail(candidateEmail, meetingUrl, interviewForm.date, interviewForm.time);
          }

          // Auto-send email to coordinator
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email && meetingUrl) {
              sendInterviewEmail(user.email, meetingUrl, interviewForm.date, interviewForm.time);
            }
          } catch (e) {
            console.error("Failed to notify coordinator:", e);
          }
        },
      }
    );
  };

  // Check if current stage is a real interview stage
  const allCandidateInterviews = (interviews || []).filter(i => i.candidate_id === candidateId);
  const hasCompletedInterview = allCandidateInterviews.some(i => i.status === "مكتملة");
  const hasScheduledInterview = allCandidateInterviews.some(i => i.status === "مجدولة");

  const isFinalStage = isLastStage || !nextStage || currentStage === "العرض الوظيفي";

  const handleFinalApproval = async () => {
    setLoading(true);
    onStageChange?.("العرض الوظيفي", "مقبول");
    try {
      const nowIso = new Date().toISOString();
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Direct update candidates by id
      await supabase
        .from("candidates")
        .update({
          stage: "العرض الوظيفي",
          status: "مقبول",
          stage_entered_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", candidateId);

      // 2. Also update candidates by email and jobId
      if (candidateEmail && jobId) {
        await supabase
          .from("candidates")
          .update({
            stage: "العرض الوظيفي",
            status: "مقبول",
            stage_entered_at: nowIso,
            updated_at: nowIso,
          })
          .eq("job_id", jobId)
          .ilike("email", candidateEmail.trim());
      }

      // 3. Upsert candidates with user_id to ensure row exists and satisfies RLS
      await supabase.from("candidates").upsert({
        id: candidateId,
        user_id: user?.id || (candidate as any)?.user_id || null,
        company_id: (candidate as any)?.company_id || null,
        job_id: jobId || (candidate as any)?.job_id || null,
        name: candidateName,
        email: candidateEmail || (candidate as any)?.email || null,
        phone: (candidate as any)?.phone || null,
        role: candidateRole || (candidate as any)?.role || "مرشح",
        stage: "العرض الوظيفي",
        status: "مقبول",
        stage_entered_at: nowIso,
        updated_at: nowIso,
        tracking_code: (candidate as any)?.tracking_code || null,
        license_number: (candidate as any)?.license_number || null,
        license_expiry: (candidate as any)?.license_expiry || null,
        university_degree: (candidate as any)?.university_degree || null,
        demo_video_url: (candidate as any)?.demo_video_url || null,
        resume_url: (candidate as any)?.resume_url || null,
        skills: (candidate as any)?.skills || null,
        experience: (candidate as any)?.experience || null,
        source: (candidate as any)?.source || "رابط التقديم المباشر",
      });

      // 4. Update applications table status
      try {
        await supabase
          .from("applications")
          .update({
            status: "مقبول",
          })
          .eq("id", candidateId);
        if (candidateEmail && jobId) {
          await supabase
            .from("applications")
            .update({ status: "مقبول" })
            .eq("job_id", jobId)
            .ilike("email", candidateEmail.trim());
        }
      } catch {
        // ignore
      }

      // 5. Record stage transition
      try {
        await supabase.from("candidate_stage_transitions").insert({
          candidate_id: candidateId,
          from_stage: currentStage,
          to_stage: "العرض الوظيفي",
          moved_by: user?.id,
          moved_by_name: user?.email,
        });
      } catch (err) {
        console.warn("Failed saving transition history:", err);
      }

      // Direct React Query cache updates
      queryClient.setQueryData(["candidate-detail-direct", candidateId], (old: any) => {
        if (!old) return old;
        return { ...old, stage: "العرض الوظيفي", status: "مقبول" };
      });
      queryClient.setQueryData(["candidate", candidateId], (old: any) => {
        if (!old) return old;
        return { ...old, stage: "العرض الوظيفي", status: "مقبول" };
      });

      await queryClient.invalidateQueries({ queryKey: ["candidates"] });
      await queryClient.invalidateQueries({ queryKey: ["candidate", candidateId] });
      await queryClient.invalidateQueries({ queryKey: ["candidate-detail-direct"] });
      await queryClient.invalidateQueries({ queryKey: ["applications"] });

      triggerAIEvaluation();

      toast({
        title: "تم اعتماد المرشح وقبوله رسمياً في المنظومة! 🏅🎉",
        description: `أصبح ${candidateName} معتمداً رسمياً. يمكنك الآن مراجعة وإصدار العرض الوظيفي.`,
      });
    } catch (err: any) {
      toast({
        title: "خطأ أثناء اعتماد المرشح",
        description: err?.message || "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (targetStageOverride?: string) => {
    // Guard: ensure we never receive a DOM Event or object as the override
    const safeOverride = typeof targetStageOverride === "string" ? targetStageOverride : undefined;
    const target = safeOverride || nextStage;
    if (!target || typeof target !== "string") return;

    const newStatus = target === "العرض الوظيفي" ? "مقبول" : status === "مرفوض" ? "مرفوض" : "قيد المراجعة";

    // 0. Immediate optimistic callback to parent UI
    onStageChange?.(target, newStatus);

    // If moving forward from an interview stage with a scheduled interview, auto-mark it completed
    if (hasScheduledInterview) {
      try {
        await supabase
          .from("interviews")
          .update({ status: "مكتملة", updated_at: new Date().toISOString() })
          .eq("candidate_id", candidateId)
          .eq("status", "مجدولة");
        await queryClient.invalidateQueries({ queryKey: ["interviews"] });
      } catch (e) {
        console.warn("Failed auto-completing interview:", e);
      }
    }

    setLoading(true);
    setShowApproveConfirm(false);

    try {
      const nowIso = new Date().toISOString();
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Direct PostgreSQL DB stage update for candidates by id
      await supabase
        .from("candidates")
        .update({
          stage: target,
          stage_entered_at: nowIso,
          updated_at: nowIso,
          status: newStatus,
        })
        .eq("id", candidateId);

      // 2. Also update by email/job_id if candidate exists under matching email
      if (candidateEmail && jobId) {
        await supabase
          .from("candidates")
          .update({
            stage: target,
            stage_entered_at: nowIso,
            updated_at: nowIso,
            status: newStatus,
          })
          .eq("job_id", jobId)
          .ilike("email", candidateEmail.trim());
      }

      // 3. Upsert into candidates to guarantee the row exists with user_id and company_id
      await supabase.from("candidates").upsert({
        id: candidateId,
        user_id: user?.id || (candidate as any)?.user_id || null,
        company_id: (candidate as any)?.company_id || null,
        job_id: jobId || (candidate as any)?.job_id || null,
        name: candidateName,
        email: candidateEmail || (candidate as any)?.email || null,
        phone: (candidate as any)?.phone || null,
        role: candidateRole || (candidate as any)?.role || "مرشح",
        stage: target,
        status: newStatus,
        stage_entered_at: nowIso,
        updated_at: nowIso,
        tracking_code: (candidate as any)?.tracking_code || null,
        license_number: (candidate as any)?.license_number || null,
        license_expiry: (candidate as any)?.license_expiry || null,
        university_degree: (candidate as any)?.university_degree || null,
        demo_video_url: (candidate as any)?.demo_video_url || null,
        resume_url: (candidate as any)?.resume_url || null,
        skills: (candidate as any)?.skills || null,
        experience: (candidate as any)?.experience || null,
        source: (candidate as any)?.source || "رابط التقديم المباشر",
      });

      // 4. Also sync applications table status if applicable
      try {
        await supabase
          .from("applications")
          .update({
            status: newStatus,
          })
          .eq("id", candidateId);
        if (candidateEmail && jobId) {
          await supabase
            .from("applications")
            .update({ status: newStatus })
            .eq("job_id", jobId)
            .ilike("email", candidateEmail.trim());
        }
      } catch {
        // ignore if application does not match candidateId
      }

      // 5. Auto-generate Jitsi interview room ONLY if advancing to an ACTUAL interview stage
      const targetStageObj = activeStages.find(s => s.name === target);
      const isNextInterviewStage = isRealInterviewStage(target, targetStageObj);

      if (isNextInterviewStage) {
        const { data: existingInt } = await supabase
          .from("interviews")
          .select("id")
          .eq("candidate_id", candidateId)
          .maybeSingle();

        if (!existingInt) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const dateStr = tomorrow.toISOString().split("T")[0];
          const roomId = `tx-room-${candidateId.slice(0, 8)}-${Date.now().toString(36)}`;
          const meetingUrl = `${window.location.origin}/meeting/${roomId}?name=${encodeURIComponent(candidateName)}&position=${encodeURIComponent(candidateRole || "")}`;

          try {
            await supabase.from("interviews").insert({
              candidate_id: candidateId,
              candidate_name: candidateName,
              position: candidateRole || "غير محدد",
              date: dateStr,
              time: "10:00",
              type: "عن بُعد",
              interviewer: user?.email || "فريق التوظيف",
              meeting_url: meetingUrl,
              status: "مجدولة",
            });
          } catch (err) {
            console.warn("Auto interview generation warning:", err);
          }

          await queryClient.invalidateQueries({ queryKey: ["interviews"] });
        }
      }

      // 6. Record stage transition history
      try {
        await supabase.from("candidate_stage_transitions").insert({
          candidate_id: candidateId,
          from_stage: currentStage,
          to_stage: target,
          moved_by: user?.id,
          moved_by_name: user?.email,
        });
      } catch (err) {
        console.warn("Failed saving transition history:", err);
      }

      // 7. Trigger email notification via notify-stage-change
      const { data: sessionData } = await supabase.auth.getSession();
      const authToken = sessionData.session?.access_token;

      try {
        if (authToken) await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-stage-change`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ candidateId, newStage: target, action: "approve" }),
          }
        );
      } catch (e) {
        console.warn("notify-stage-change edge function warning:", e);
      }

      // Direct React Query cache update
      queryClient.setQueryData(["candidate-detail-direct", candidateId], (old: any) => {
        if (!old) return old;
        return { ...old, stage: target, status: newStatus };
      });
      queryClient.setQueryData(["candidate", candidateId], (old: any) => {
        if (!old) return old;
        return { ...old, stage: target, status: newStatus };
      });

      // Invalidate all candidate and stage queries so UI updates immediately
      await queryClient.invalidateQueries({ queryKey: ["candidates"] });
      await queryClient.invalidateQueries({ queryKey: ["candidate-detail-direct"] });
      await queryClient.invalidateQueries({ queryKey: ["candidate", candidateId] });
      await queryClient.invalidateQueries({ queryKey: ["interviews"] });
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
      await queryClient.invalidateQueries({ queryKey: ["pipeline_stages"] });

      toast({
        title: isNextInterviewStage ? `تم نقل المرشح وتجهيز رابط مقابلة Jitsi تلقائياً 🎥` : `تم نقل ${candidateName} إلى "${target}" بنجاح ✅`,
        description: isNextInterviewStage ? `تم إنشاء رابط الاجتماع المباشر وتمكين دخولك أنت والمرشح` : "تم تحديث مرحلة المرشح في المسار بنجاح",
      });

      // If advanced to offer stage, open offer creation dialog
      if (target === "العرض الوظيفي") {
        setOfferForm(prev => ({ ...prev, position: candidateRole || "" }));
        setShowOfferCreateDialog(true);
      }
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message || "فشل في تحديث المرحلة", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setShowRejectDialog(false);

    try {
      const nowIso = new Date().toISOString();

      // 1. Direct PostgreSQL DB status update
      const { data: updatedRows, error: dbErr } = await supabase
        .from("candidates")
        .update({
          status: "مرفوض",
          notes: rejectionReason ? `سبب الرفض: ${rejectionReason}` : undefined,
          updated_at: nowIso
        })
        .eq("id", candidateId)
        .select("id");

      if (dbErr) throw dbErr;

      if (!updatedRows || updatedRows.length === 0) {
        if (candidateEmail && jobId) {
          await supabase
            .from("candidates")
            .update({
              status: "مرفوض",
              notes: rejectionReason ? `سبب الرفض: ${rejectionReason}` : undefined,
              updated_at: nowIso
            })
            .eq("job_id", jobId)
            .ilike("email", candidateEmail.trim());
        }
      }

      // Also update applications table
      try {
        await supabase
          .from("applications")
          .update({
            status: "مرفوض",
          })
          .eq("id", candidateId);
      } catch {
        // ignore
      }

      const { data: { user } } = await supabase.auth.getUser();
      try {
        await supabase.from("candidate_stage_transitions").insert({
          candidate_id: candidateId,
          from_stage: currentStage,
          to_stage: "مرفوض",
          moved_by: user?.id,
          moved_by_name: user?.email,
          notes: rejectionReason || "رفض المرشح",
        });
      } catch (err) {
        console.warn("Failed saving rejection transition history:", err);
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const authToken = sessionData.session?.access_token;

      try {
        if (authToken) await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-stage-change`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              candidateId,
              action: "reject",
              rejectionReason: rejectionReason.trim() || undefined,
            }),
          }
        );
      } catch (e) {
        console.warn("notify-stage-change edge function warning:", e);
      }

      await queryClient.invalidateQueries({ queryKey: ["candidates"] });
      await queryClient.invalidateQueries({ queryKey: ["candidate-detail-direct"] });
      await queryClient.refetchQueries({ queryKey: ["candidate-detail-direct"] });
      await queryClient.invalidateQueries({ queryKey: ["candidate"] });

      toast({
        title: `تم رفض ${candidateName}`,
        description: rejectionReason || "تم تحديث حالة المرشح إلى مرفوض",
        variant: "destructive",
      });
      setRejectionReason("");
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message || "فشل في رفض المرشح", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (isRejected) {
    return (
      <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 text-center">
        <X className="w-6 h-6 text-destructive mx-auto mb-2" />
        <p className="text-sm font-semibold text-destructive">تم رفض هذا المرشح</p>
      </div>
    );
  }

  if ((isAccepted || status === "مكتمل") && isLastStage) {
    const offerStatus = candidateOffer ? STATUS_LABELS[candidateOffer.status] || { label: candidateOffer.status, color: "bg-muted text-muted-foreground" } : null;
    const offerLink = candidateOffer ? `${getPublicBaseUrl()}/offer/${candidateOffer.token}` : null;
    const isSending = createOffer.isPending || sendOffer.isPending;

    return (
      <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-5 space-y-4"
      >
        <h3 className="font-display font-bold flex items-center gap-2">
          <span className="w-1 h-5 rounded-full gradient-primary" />
          العرض الوظيفي
        </h3>

        <div className="bg-success/5 border border-success/20 rounded-lg p-3 text-center">
          <Check className="w-5 h-5 text-success mx-auto mb-1" />
          <p className="text-sm font-semibold text-success">تم قبول المرشح ✅</p>
        </div>

        {candidateOffer ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">حالة العرض</span>
              <Badge className={cn("text-xs", offerStatus?.color)}>{offerStatus?.label}</Badge>
            </div>

            {candidateOffer.status === "draft" && (
              <Button
                className="w-full gradient-primary border-0 text-primary-foreground gap-2"
                onClick={handleSendExistingOffer}
                disabled={isSending}
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                إرسال العرض
              </Button>
            )}

            {offerLink && candidateOffer.status !== "draft" && (
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    navigator.clipboard.writeText(offerLink);
                    toast({ title: "تم نسخ رابط العرض ✅" });
                  }}
                >
                  <Copy className="w-4 h-4" />
                  نسخ رابط العرض
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 text-green-600 border-green-200 hover:bg-green-50"
                    onClick={() => {
                      const text = `مرحباً، تم إرسال عرض وظيفي لك للمنصب: ${candidateOffer.position}\nيرجى مراجعة التفاصيل عبر الرابط التالي:\n${offerLink}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                    }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    واتساب
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() => {
                      const subject = `عرض وظيفي - ${candidateOffer.position}`;
                      const body = `مرحباً،\n\nتم إرسال عرض وظيفي لك للمنصب: ${candidateOffer.position}\n\nيرجى مراجعة التفاصيل والرد عبر الرابط التالي:\n${offerLink}\n\nمع تحيات فريق التوظيف`;
                      window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");
                    }}
                  >
                    <Mail className="w-4 h-4" />
                    بريد إلكتروني
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                    onClick={() => {
                      const text = `مرحباً، تم إرسال عرض وظيفي لك للمنصب: ${candidateOffer.position}\nيرجى مراجعة التفاصيل عبر الرابط التالي:\n${offerLink}`;
                      window.open(`sms:?body=${encodeURIComponent(text)}`);
                    }}
                  >
                    <Smartphone className="w-4 h-4" />
                    SMS
                  </Button>
                </div>
              </div>
            )}

            <Button variant="outline" className="w-full gap-2" asChild>
              <Link to="/offers">
                <FileText className="w-4 h-4" />
                عرض التفاصيل في صفحة العروض
              </Link>
            </Button>
          </div>
        ) : (
          <Button
            className="w-full gradient-primary border-0 text-primary-foreground gap-2"
            onClick={() => {
              setOfferForm(prev => ({ ...prev, position: candidateRole || "" }));
              setShowOfferCreateDialog(true);
            }}
          >
            <Send className="w-4 h-4" />
            إنشاء وإرسال العرض الوظيفي
          </Button>
        )}
      </motion.div>

      {/* Offer Creation Dialog */}
      <Dialog open={showOfferCreateDialog} onOpenChange={setShowOfferCreateDialog}>
        <DialogContent dir="rtl" className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              إنشاء عرض وظيفي — {candidateName}
            </DialogTitle>
            <DialogDescription>
              أدخل تفاصيل العرض الوظيفي وسيتم إرساله مباشرة للمرشح
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold">المسمى الوظيفي *</Label>
                <Input
                  value={offerForm.position}
                  onChange={(e) => setOfferForm({ ...offerForm, position: e.target.value })}
                  placeholder="مثال: مهندس برمجيات"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">القسم</Label>
                <Input
                  value={offerForm.department}
                  onChange={(e) => setOfferForm({ ...offerForm, department: e.target.value })}
                  placeholder="مثال: تقنية المعلومات"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold">الراتب *</Label>
                <Input
                  type="number"
                  value={offerForm.salary}
                  onChange={(e) => setOfferForm({ ...offerForm, salary: e.target.value })}
                  placeholder="15000"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">العملة</Label>
                <Select value={offerForm.currency} onValueChange={(v) => setOfferForm({ ...offerForm, currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAR">ريال سعودي</SelectItem>
                    <SelectItem value="USD">دولار أمريكي</SelectItem>
                    <SelectItem value="EUR">يورو</SelectItem>
                    <SelectItem value="AED">درهم إماراتي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">نوع العقد</Label>
                <Select value={offerForm.offer_type} onValueChange={(v) => setOfferForm({ ...offerForm, offer_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">دوام كامل</SelectItem>
                    <SelectItem value="part-time">دوام جزئي</SelectItem>
                    <SelectItem value="contract">عقد مؤقت</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold">تاريخ البدء</Label>
                <Input
                  type="date"
                  value={offerForm.start_date}
                  onChange={(e) => setOfferForm({ ...offerForm, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">صلاحية العرض</Label>
                <Select value={offerForm.expires_days} onValueChange={(v) => setOfferForm({ ...offerForm, expires_days: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 أيام</SelectItem>
                    <SelectItem value="7">7 أيام</SelectItem>
                    <SelectItem value="14">14 يوم</SelectItem>
                    <SelectItem value="30">30 يوم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold">المزايا والبدلات</Label>
              <Textarea
                value={offerForm.benefits}
                onChange={(e) => setOfferForm({ ...offerForm, benefits: e.target.value })}
                placeholder="ميزة واحدة في كل سطر مثل: تأمين طبي، بدل سكن..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold">شروط إضافية</Label>
              <Textarea
                value={offerForm.additional_terms}
                onChange={(e) => setOfferForm({ ...offerForm, additional_terms: e.target.value })}
                placeholder="أي شروط إضافية..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="flex-row-reverse gap-2">
            <Button
              className="gradient-primary border-0 text-primary-foreground gap-2"
              onClick={handleCreateAndSendOffer}
              disabled={createOffer.isPending || sendOffer.isPending}
            >
              {(createOffer.isPending || sendOffer.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              إنشاء وإرسال العرض الوظيفي
            </Button>
            <Button variant="outline" onClick={() => setShowOfferCreateDialog(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-5 space-y-4"
      >
        <h3 className="font-display font-bold flex items-center gap-2">
          <span className="w-1 h-5 rounded-full gradient-primary" />
          إجراءات المرحلة
        </h3>

        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">المرحلة الحالية</p>
              <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {currentStage}
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">
              {currentIdx + 1} من {STAGES.length}
            </Badge>
          </div>
          {nextStage && (
            <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">المرحلة التالية المعتمدة</p>
                <p className="text-sm font-bold text-primary flex items-center gap-1">
                  {nextStage}
                </p>
              </div>
              <span className="text-[11px] text-muted-foreground font-mono">
                المرحلة #{currentIdx + 2}
              </span>
            </div>
          )}
        </div>

        {/* Interview section for interview stages */}
        {isInterviewStage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3"
          >
            {candidateInterview ? (
              <div className="bg-gradient-to-br from-info/10 via-background to-primary/5 border border-info/30 rounded-xl p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between gap-2 border-b border-info/10 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center text-info">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-foreground block">تفاصيل الاجتماع</span>
                      <span className="text-[11px] text-muted-foreground">
                        {candidateInterview.status === "مكتملة" ? "تم إجراء المقابلة" : "مقابلة قادمة"}
                      </span>
                    </div>
                  </div>
                  <Badge className={cn(
                    "text-[10px] font-medium px-2 py-0.5",
                    candidateInterview.meeting_url?.includes("jitsi") || candidateInterview.meeting_url?.includes("/meeting/")
                      ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20"
                      : "bg-info/10 text-info border-info/20"
                  )}>
                    {candidateInterview.meeting_url?.includes("jitsi") || candidateInterview.meeting_url?.includes("/meeting/")
                      ? "🎥 Jitsi Meet"
                      : "🔗 رابط خارجي"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-muted/40 p-2.5 rounded-lg border border-border/40">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">التاريخ والوقت</span>
                    <span className="font-semibold text-foreground">
                      {new Date(candidateInterview.date).toLocaleDateString("ar-SA")} — {candidateInterview.time}
                    </span>
                  </div>
                  {candidateInterview.interviewer && (
                    <div>
                      <span className="text-muted-foreground block text-[10px]">المحاور</span>
                      <span className="font-semibold text-foreground">{candidateInterview.interviewer}</span>
                    </div>
                  )}
                </div>

                {candidateInterview.meeting_url && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 gap-1.5 text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow"
                        onClick={() => {
                          const url = candidateInterview.meeting_url;
                          if (url.startsWith("http")) window.open(url, "_blank");
                          else window.open(`${window.location.origin}${url}`, "_blank");
                        }}
                      >
                        <Video className="w-3.5 h-3.5" />
                        دخول غرفة المقابلة
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs h-9 px-3"
                        onClick={() => {
                          const fullUrl = candidateInterview.meeting_url.startsWith("http")
                            ? candidateInterview.meeting_url
                            : `${window.location.origin}${candidateInterview.meeting_url}`;
                          navigator.clipboard.writeText(fullUrl);
                          toast({ title: "تم نسخ رابط المقابلة ✅", description: "يمكنك إرساله للمرشح مباشرة" });
                        }}
                      >
                        <Copy className="w-3.5 h-3.5" />
                        نسخ
                      </Button>
                    </div>

                    <div className="flex gap-2 pt-1">
                      {candidateEmail && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1 text-[11px] h-7 text-primary border-primary/20 hover:bg-primary/5 font-semibold"
                          onClick={() => sendInterviewEmail(candidateEmail, candidateInterview.meeting_url, candidateInterview.date, candidateInterview.time)}
                        >
                          <Mail className="w-3 h-3" />
                          إرسال بالبريد ✉️
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1 text-[11px] h-7 text-green-600 border-green-200 hover:bg-green-50 dark:border-green-900/40 dark:hover:bg-green-950/30 font-semibold"
                        onClick={() => {
                          const fullUrl = candidateInterview.meeting_url.startsWith("http")
                            ? candidateInterview.meeting_url
                            : `${window.location.origin}${candidateInterview.meeting_url}`;
                          const text = `مرحباً ${candidateName}، موعد مقابلتك الوظيفية بتاريخ ${candidateInterview.date} الساعة ${candidateInterview.time}.\nرابط المقابلة:\n${fullUrl}`;
                          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                        }}
                      >
                        <MessageCircle className="w-3 h-3" />
                        واتساب 💬
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-border/30 text-xs">
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-[11px] text-muted-foreground hover:text-foreground gap-1 px-2"
                      onClick={() => {
                        setRescheduleForm({
                          date: candidateInterview.date,
                          time: candidateInterview.time,
                          interviewer: candidateInterview.interviewer || "",
                        });
                        setShowRescheduleDialog(true);
                      }}
                    >
                      <RefreshCw className="w-3 h-3" />
                      إعادة جدولة
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-[11px] text-destructive hover:bg-destructive/10 gap-1 px-2"
                      onClick={() => setShowCancelConfirm(true)}
                    >
                      <XCircle className="w-3 h-3" />
                      إلغاء
                    </Button>
                  </div>

                  {candidateInterview.status !== "مكتملة" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px] text-success border-success/30 hover:bg-success/10 font-bold"
                      onClick={async () => {
                        await updateInterview.mutateAsync({
                          id: candidateInterview.id,
                          status: "مكتملة",
                          notes: "تم إكمال المقابلة بنجاح",
                        });
                        toast({ title: "تم تسجيل إكمال المقابلة بنجاح ✅" });
                        queryClient.invalidateQueries({ queryKey: ["interviews"] });
                      }}
                    >
                      <Check className="w-3 h-3 ml-1" />
                      اكتمال المقابلة
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full gap-2 border-info/40 text-info hover:bg-info/10 font-bold h-10 shadow-sm"
                onClick={() => setShowInterviewDialog(true)}
              >
                <Video className="w-4 h-4 text-primary" />
                جدولة مقابلة تفاعلية 🎥 (Jitsi Meet / Zoom)
              </Button>
            )}
          </motion.div>
        )}

        {/* Written Assessment Section - only shown if stage is assessment-related or explicitly requested */}
        {isAssessmentStage || showAssessmentSection || selectedAssessmentOverride ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-gradient-to-br from-indigo-500/10 via-background to-purple-500/5 border border-indigo-500/30 rounded-xl p-4 space-y-3 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2 border-b border-indigo-500/10 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-bold text-foreground block">
                    {activeStageAssessment ? "الاختبار التحريري المربوط" : "إرسال اختبار تحريري"}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {activeStageAssessment ? activeStageAssessment.title : "اختر اختباراً لإرساله للمرشح"}
                  </span>
                </div>
              </div>
              {activeStageAssessment && (
                <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 text-[10px]">
                  {activeStageAssessment.duration_minutes} دقيقة | نجاح {activeStageAssessment.passing_score}%
                </Badge>
              )}
            </div>

            {activeStageAssessment ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1.5 text-xs h-9 border-indigo-500/30 hover:bg-indigo-500/5 font-bold"
                    onClick={() => {
                      const url = `${window.location.origin}/assessment/${activeStageAssessment.token}`;
                      navigator.clipboard.writeText(url);
                      toast({ title: "تم نسخ رابط الاختبار التحريري ✅", description: "يمكنك إرساله للمرشح مباشرة" });
                    }}
                  >
                    <Copy className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    نسخ رابط الاختبار
                  </Button>

                  <Button
                    size="sm"
                    className="flex-1 gap-1.5 text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow"
                    onClick={() => {
                      window.open(`/assessment/${activeStageAssessment.token}`, "_blank");
                    }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    معاينة الاختبار
                  </Button>
                </div>

                <div className="flex gap-2">
                  {candidateEmail && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1 text-[11px] h-7 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-900/40 dark:hover:bg-indigo-950/30 font-semibold"
                      onClick={() => sendAssessmentEmail(candidateEmail, activeStageAssessment.title, activeStageAssessment.token)}
                    >
                      <Mail className="w-3 h-3" />
                      إرسال بالبريد ✉️
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1 text-[11px] h-7 text-green-600 border-green-200 hover:bg-green-50 dark:border-green-900/40 dark:hover:bg-green-950/30 font-semibold"
                    onClick={() => {
                      const url = `${window.location.origin}/assessment/${activeStageAssessment.token}`;
                      const text = `مرحباً ${candidateName}، يرجى التكرم باستكمال الاختبار التحريري المرفق (${activeStageAssessment.title}) عبر الرابط التالي:\n${url}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                    }}
                  >
                    <MessageCircle className="w-3 h-3" />
                    واتساب 💬
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Select onValueChange={(val) => {
                  const selected = allAssessments.find(a => a.id === val);
                  if (selected) setSelectedAssessmentOverride(selected);
                }}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="اختر اختباراً من بنك الأسئلة..." />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    {allAssessments.filter(a => a.is_active).map((a) => (
                      <SelectItem key={a.id} value={a.id} className="text-xs">
                        {a.title} ({a.duration_minutes} دقيقة)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </motion.div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAssessmentSection(true)}
            className="w-full h-8 text-[11px] text-muted-foreground hover:text-foreground gap-1.5 border border-dashed border-border/60 rounded-xl"
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-indigo-500" />
            إرسال اختبار تحريري مبكر (اختياري)
          </Button>
        )}

        {/* Quick jump to specific stage option */}
        <div className="pt-1">
          <Select onValueChange={(val) => {
            if (val && val !== currentStage) {
              handleApprove(val);
            }
          }}>
            <SelectTrigger className="h-8 text-[11px] text-muted-foreground border-dashed bg-muted/20 rounded-xl">
              <SelectValue placeholder="تخطي أو نقل لمرحلة محددة في المسار..." />
            </SelectTrigger>
            <SelectContent dir="rtl">
              {STAGES.map((stg, i) => (
                <SelectItem key={stg} value={stg} className="text-xs">
                  {i + 1}. {stg} {stg === currentStage ? "(الحالية)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Primary Stage Actions */}
        {isAccepted ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">المرشح معتمد رسمياً بنجاح 🏅</p>
                <p className="text-[11px] text-muted-foreground">تم قبول المرشح واكتمال كافة مراحل المسار</p>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-9 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border-emerald-500/30 hover:bg-emerald-500/25 gap-1.5 rounded-xl"
                onClick={() => setShowOfferCreateDialog(true)}
              >
                <FileText className="w-3.5 h-3.5" />
                {candidateOffer ? "مراجعة / تعديل العرض الوظيفي" : "إصدار العرض الوظيفي 📄"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 text-xs font-bold text-muted-foreground hover:text-foreground gap-1.5 rounded-xl border-dashed"
                asChild
              >
                <Link to="/converted-orders">
                  أمر تعيين 📑
                </Link>
              </Button>
            </div>
          </div>
        ) : isFinalStage ? (
          <div className="space-y-2.5">
            <Button
              className="w-full h-11 text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 gap-2 rounded-xl"
              onClick={handleFinalApproval}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
              اعتماد المرشح وقبوله رسمياً في المنظومة 🏅
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 h-9 text-xs font-semibold border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 gap-1.5 rounded-xl"
                onClick={() => setShowOfferCreateDialog(true)}
              >
                <FileText className="w-3.5 h-3.5" />
                {candidateOffer ? "مراجعة العرض الوظيفي" : "إصدار العرض الوظيفي أولاً 📄"}
              </Button>
              <Button
                variant="outline"
                className="h-9 text-xs border-destructive/30 text-destructive hover:bg-destructive/5 gap-1.5 rounded-xl px-3"
                onClick={() => setShowRejectDialog(true)}
                disabled={loading}
              >
                <X className="w-3.5 h-3.5" />
                رفض
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            {nextStage && (
              <Button
                className="flex-1 h-10 text-xs font-bold gradient-primary border-0 text-primary-foreground shadow-sm gap-2 rounded-xl"
                onClick={() => setShowApproveConfirm(true)}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowLeft className="w-4 h-4" />}
                نقل إلى: {nextStage} ➔
              </Button>
            )}
            <Button
              variant="outline"
              className="h-10 text-xs border-destructive/30 text-destructive hover:bg-destructive/5 gap-1.5 rounded-xl px-3"
              onClick={() => setShowRejectDialog(true)}
              disabled={loading}
            >
              <X className="w-4 h-4" />
              رفض
            </Button>
          </div>
        )}
      </motion.div>

      {/* Approve Confirmation */}
      <AlertDialog open={showApproveConfirm} onOpenChange={setShowApproveConfirm}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد نقل المرشح</AlertDialogTitle>
            <AlertDialogDescription>
              هل تريد نقل <strong>{candidateName}</strong> من "{currentStage}" إلى "{nextStage}"؟
              {nextStage === "العرض الوظيفي" && (
                <span className="block mt-2 text-success font-medium">
                  سيتم تحديث حالة المرشح إلى "مقبول" تلقائياً.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction onClick={() => handleApprove()} className="gradient-primary border-0 text-primary-foreground">
              تأكيد النقل
            </AlertDialogAction>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent dir="rtl" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>رفض المرشح</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رفض <strong>{candidateName}</strong>؟ يمكنك إضافة سبب الرفض.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="سبب الرفض (اختياري)..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter className="flex-row-reverse gap-2">
            <Button variant="destructive" onClick={handleReject} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              تأكيد الرفض
            </Button>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Interview Dialog */}
      <Dialog open={showInterviewDialog} onOpenChange={setShowInterviewDialog}>
        <DialogContent dir="rtl" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" />
              جدولة مقابلة — {candidateName}
            </DialogTitle>
            <DialogDescription>
              حدد تفاصيل المقابلة وسيتم إنشاء رابط اجتماع تلقائياً
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-bold">التاريخ *</Label>
                <Input
                  type="date"
                  value={interviewForm.date}
                  onChange={e => setInterviewForm({ ...interviewForm, date: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">الوقت *</Label>
                <Input
                  type="time"
                  value={interviewForm.time}
                  onChange={e => setInterviewForm({ ...interviewForm, time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold">اسم المحاور</Label>
              <Input
                placeholder="اسم المحاور (اختياري)"
                value={interviewForm.interviewer}
                onChange={e => setInterviewForm({ ...interviewForm, interviewer: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold">نوع الاجتماع</Label>
              <Select
                value={interviewForm.meeting_type}
                onValueChange={(v: "jitsi" | "external") => setInterviewForm({ ...interviewForm, meeting_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jitsi">
                    <span className="flex items-center gap-2">
                      <Video className="w-3.5 h-3.5" />
                      غرفة فيديو مدمجة (Jitsi)
                    </span>
                  </SelectItem>
                  <SelectItem value="external">
                    <span className="flex items-center gap-2">
                      <Link2 className="w-3.5 h-3.5" />
                      رابط خارجي (Zoom / Meet)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {interviewForm.meeting_type === "jitsi" && (
              <div className="bg-info/5 border border-info/15 rounded-lg p-3">
                <p className="text-xs text-info font-medium flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5" />
                  سيتم إنشاء غرفة فيديو مدمجة تلقائياً مع رابط مباشر
                </p>
              </div>
            )}

            {interviewForm.meeting_type === "external" && (
              <div className="space-y-2">
                <Label className="text-xs font-bold">رابط الاجتماع</Label>
                <Input
                  placeholder="https://zoom.us/j/... أو https://meet.google.com/..."
                  value={interviewForm.external_link}
                  onChange={e => setInterviewForm({ ...interviewForm, external_link: e.target.value })}
                  dir="ltr"
                />
              </div>
            )}
          </div>

          <DialogFooter className="flex-row-reverse gap-2">
            <Button
              className="gradient-primary border-0 text-primary-foreground gap-2"
              onClick={handleScheduleInterview}
              disabled={addInterview.isPending}
            >
              {addInterview.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
              جدولة المقابلة
            </Button>
            <Button variant="outline" onClick={() => setShowInterviewDialog(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Interview Dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent dir="rtl" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-warning" />
              إعادة جدولة المقابلة — {candidateName}
            </DialogTitle>
            <DialogDescription>
              حدد الموعد الجديد وسيتم إشعار المرشح تلقائياً بالتغيير
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-bold">التاريخ الجديد *</Label>
                <Input
                  type="date"
                  value={rescheduleForm.date}
                  onChange={e => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">الوقت الجديد *</Label>
                <Input
                  type="time"
                  value={rescheduleForm.time}
                  onChange={e => setRescheduleForm({ ...rescheduleForm, time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold">اسم المحاور</Label>
              <Input
                placeholder="اسم المحاور (اختياري)"
                value={rescheduleForm.interviewer}
                onChange={e => setRescheduleForm({ ...rescheduleForm, interviewer: e.target.value })}
              />
            </div>

            {candidateEmail && (
              <div className="bg-warning/5 border border-warning/15 rounded-lg p-3">
                <p className="text-xs text-warning font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  سيتم إرسال إشعار تلقائي للمرشح على {candidateEmail}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-row-reverse gap-2">
            <Button
              className="gap-2 bg-warning text-warning-foreground hover:bg-warning/90"
              onClick={handleRescheduleInterview}
              disabled={updateInterview.isPending}
            >
              {updateInterview.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              تأكيد إعادة الجدولة
            </Button>
            <Button variant="outline" onClick={() => setShowRescheduleDialog(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Interview Confirmation */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد إلغاء المقابلة</AlertDialogTitle>
            <AlertDialogDescription>
              هل تريد إلغاء المقابلة المجدولة مع <strong>{candidateName}</strong>؟
              {candidateEmail && (
                <span className="block mt-2 text-warning font-medium">
                  سيتم إرسال إشعار إلغاء تلقائي للمرشح.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction
              onClick={handleCancelInterview}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelInterview.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              تأكيد الإلغاء
            </AlertDialogAction>
            <AlertDialogCancel>تراجع</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Offer Creation Dialog */}
      <Dialog open={showOfferCreateDialog} onOpenChange={setShowOfferCreateDialog}>
        <DialogContent dir="rtl" className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              إنشاء عرض وظيفي — {candidateName}
            </DialogTitle>
            <DialogDescription>
              أدخل تفاصيل العرض الوظيفي وسيتم إرساله مباشرة للمرشح
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold">المسمى الوظيفي *</Label>
                <Input
                  value={offerForm.position}
                  onChange={(e) => setOfferForm({ ...offerForm, position: e.target.value })}
                  placeholder="مثال: مهندس برمجيات"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">القسم</Label>
                <Input
                  value={offerForm.department}
                  onChange={(e) => setOfferForm({ ...offerForm, department: e.target.value })}
                  placeholder="مثال: تقنية المعلومات"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold">الراتب *</Label>
                <Input
                  type="number"
                  value={offerForm.salary}
                  onChange={(e) => setOfferForm({ ...offerForm, salary: e.target.value })}
                  placeholder="15000"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">العملة</Label>
                <Select value={offerForm.currency} onValueChange={(v) => setOfferForm({ ...offerForm, currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAR">ريال سعودي</SelectItem>
                    <SelectItem value="USD">دولار أمريكي</SelectItem>
                    <SelectItem value="EUR">يورو</SelectItem>
                    <SelectItem value="AED">درهم إماراتي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">نوع العقد</Label>
                <Select value={offerForm.offer_type} onValueChange={(v) => setOfferForm({ ...offerForm, offer_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">دوام كامل</SelectItem>
                    <SelectItem value="part-time">دوام جزئي</SelectItem>
                    <SelectItem value="contract">عقد مؤقت</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold">تاريخ البدء</Label>
                <Input
                  type="date"
                  value={offerForm.start_date}
                  onChange={(e) => setOfferForm({ ...offerForm, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">صلاحية العرض</Label>
                <Select value={offerForm.expires_days} onValueChange={(v) => setOfferForm({ ...offerForm, expires_days: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 أيام</SelectItem>
                    <SelectItem value="7">7 أيام</SelectItem>
                    <SelectItem value="14">14 يوم</SelectItem>
                    <SelectItem value="30">30 يوم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold">المزايا والبدلات</Label>
              <Textarea
                value={offerForm.benefits}
                onChange={(e) => setOfferForm({ ...offerForm, benefits: e.target.value })}
                placeholder="ميزة واحدة في كل سطر مثل: تأمين طبي، بدل سكن..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold">شروط إضافية</Label>
              <Textarea
                value={offerForm.additional_terms}
                onChange={(e) => setOfferForm({ ...offerForm, additional_terms: e.target.value })}
                placeholder="أي شروط إضافية..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="flex-row-reverse gap-2">
            <Button
              className="gradient-primary border-0 text-primary-foreground gap-2"
              onClick={handleCreateAndSendOffer}
              disabled={createOffer.isPending || sendOffer.isPending}
            >
              {(createOffer.isPending || sendOffer.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              إنشاء وإرسال العرض الوظيفي
            </Button>
            <Button variant="outline" onClick={() => setShowOfferCreateDialog(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
