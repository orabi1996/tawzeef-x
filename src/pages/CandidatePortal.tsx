import tawzeefLogo from "@/assets/tawzeef-x-logo.png";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Check, Clock, Circle, Briefcase, MapPin, ArrowLeft, Shield, Star, Brain, GraduationCap, Award, BookOpen, Video, Plus, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useSearchParams } from "react-router-dom";
import CandidateChatbot from "@/components/candidate-portal/CandidateChatbot";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { SEO } from "@/components/marketing/SEO";

const PORTAL_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/candidate-portal`;

const DEFAULT_STAGES = [
  { id: "تقديم الطلب", label: "تقديم الطلب" },
  { id: "فحص السيرة", label: "فحص السيرة" },
  { id: "اختبار تحريري", label: "اختبار تحريري" },
  { id: "مقابلة تقنية", label: "مقابلة تقنية" },
  { id: "مقابلة نهائية", label: "مقابلة نهائية" },
  { id: "العرض الوظيفي", label: "العرض الوظيفي" },
];

const statusStyles: Record<string, string> = {
  "مقبول": "bg-green-100 text-green-800",
  "قيد المراجعة": "bg-amber-100 text-amber-800",
  "مرفوض": "bg-red-100 text-red-800",
};

interface CandidateResult {
  id: string;
  name: string;
  role: string | null;
  stage: string;
  status: string;
  skills: string[] | null;
  trackingCode: string;
  appliedAt: string;
  jobTitle: string | null;
  aiScore: number | null;
  licenseNumber?: string | null;
  licenseExpiry?: string | null;
  universityDegree?: string | null;
  demoVideoUrl?: string | null;
}

function PipelineProgress({ currentStage, stages }: { currentStage: string; stages: typeof DEFAULT_STAGES }) {
  // Use semantic matching: if exact match fails, try partial keyword match
  let currentIdx = stages.findIndex(s => s.id === currentStage);
  if (currentIdx === -1) {
    if (/مقبول|معتمد|تعيين/.test((currentStage || "").toLowerCase())) {
      currentIdx = stages.length - 1;
    } else {
      currentIdx = stages.findIndex(s => {
        const a = s.id.toLowerCase(); const b = (currentStage || "").toLowerCase();
        if (/سيرة|cv|resume|screening/.test(b) && /سيرة|cv|resume|screening/.test(a)) return true;
        if (/اختبار|assessment|test/.test(b) && /اختبار|assessment|test/.test(a)) return true;
        if (/مقابلة.*(نهائية|أخيرة|final)/.test(b) && /مقابلة.*(نهائية|أخيرة|final)/.test(a)) return true;
        if (/مقابلة|interview/.test(b) && /مقابلة|interview/.test(a)) return true;
        if (/عرض|offer|مقبول|تعيين/.test(b) && /عرض|offer/.test(a)) return true;
        return false;
      });
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative mb-2">
        <div className="absolute top-4 right-4 left-4 h-0.5 bg-border" />
        <div
          className="absolute top-4 right-4 h-0.5 bg-primary transition-all duration-700"
          style={{
            width: currentIdx >= 0 ? `${(currentIdx / (stages.length - 1)) * 100}%` : "0%",
            maxWidth: "calc(100% - 32px)",
          }}
        />
        {stages.map((stage, i) => {
          const status = i < currentIdx ? "completed" : i === currentIdx ? "current" : "upcoming";
          return (
            <div key={stage.id} className="relative flex flex-col items-center z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, type: "spring" }}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                  status === "completed" && "bg-primary border-primary",
                  status === "current" && "bg-background border-primary shadow-md",
                  status === "upcoming" && "bg-background border-border"
                )}
              >
                {status === "completed" ? (
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                ) : status === "current" ? (
                  <Clock className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <Circle className="w-2.5 h-2.5 text-muted-foreground" />
                )}
              </motion.div>
              <span
                className={cn(
                  "text-[10px] mt-1.5 text-center max-w-[60px] leading-tight",
                  status === "current" ? "text-primary font-bold" : "text-muted-foreground"
                )}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CandidatePortal() {
  const [searchParams] = useSearchParams();
  const [searchType, setSearchType] = useState<"tracking" | "email">("tracking");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [candidates, setCandidates] = useState<CandidateResult[] | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  // Edit Teacher Credentials Modal State
  const [editTeacherModal, setEditTeacherModal] = useState<CandidateResult | null>(null);
  const [licenseNumberInput, setLicenseNumberInput] = useState("");
  const [licenseExpiryInput, setLicenseExpiryInput] = useState("");
  const [degreeInput, setDegreeInput] = useState("");
  const [demoVideoInput, setDemoVideoInput] = useState("");

  useEffect(() => {
    const codeParam = searchParams.get("code") || searchParams.get("tracking");
    if (codeParam) {
      setSearchType("tracking");
      setInput(codeParam);
      setTimeout(() => {
        performSearch(codeParam, "tracking");
      }, 300);
    }
  }, [searchParams]);

  const handleSearch = async () => {
    if (!input.trim()) {
      toast({ title: "خطأ", description: "يرجى أدخل رمز التتبع أو البريد الإلكتروني", variant: "destructive" });
      return;
    }
    await performSearch(input, searchType);
  };

  const performSearch = async (queryInput: string, queryType: "tracking" | "email") => {
    setIsLoading(true);
    setSearched(true);
    setEmailSent(false);

    let foundCandidates: CandidateResult[] = [];
    const cleanInput = queryInput.trim();

    // The public function validates the full tracking code server-side.
    try {
      const payload = queryType === "tracking"
        ? { trackingCode: cleanInput }
        : { email: cleanInput };

      const resp = await fetch(PORTAL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.candidates && data.candidates.length > 0) {
          foundCandidates = data.candidates;
        } else if (data.message && queryType === "email") {
          setEmailSent(true);
          toast({
            title: "تم إرسال التفاصيل بنجاح 📧",
            description: data.message,
          });
        }
      } else {
        const errJson = await resp.json().catch(() => ({}));
        if (errJson.error && queryType === "tracking") {
          console.warn("Candidate portal search notice:", errJson.error);
        }
      }
    } catch (edgeErr) {
      console.warn("Edge function fetch error, falling back to client query:", edgeErr);
    }

    if (foundCandidates.length > 0) {
      setCandidates(foundCandidates);
    } else {
      setCandidates([]);
      if (queryType === "tracking") {
        toast({ title: "لم يتم العثور على نتائج", description: "تأكد من رمز التتبع أو استخدم البريد الإلكتروني للبحث.", variant: "destructive" });
      }
    }

    setIsLoading(false);
  };


  const handleSaveTeacherCredentials = async () => {
    if (!editTeacherModal) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "سجّل دخولك بنفس بريد الطلب لتعديل بياناتك", variant: "destructive" });
        return;
      }
      const { data, error } = await supabase.functions.invoke("candidate-portal", {
        body: {
          action: "updateCredentials",
          trackingCode: editTeacherModal.trackingCode,
          credentials: {
            licenseNumber: licenseNumberInput,
            licenseExpiry: licenseExpiryInput,
            universityDegree: degreeInput,
            demoVideoUrl: demoVideoInput,
          },
        },
      });
      if (error || !data?.success) throw error || new Error(data?.error || "تعذر حفظ البيانات");

      toast({ title: "تم حفظ بيانات الرخصة والمؤهلات، والتحقق منها يتم بشكل منفصل ✅" });
      setEditTeacherModal(null);
      performSearch(input, searchType);
    } catch (e: any) {
      toast({ title: "خطأ في التحديث", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-right" dir="rtl">
      <SEO 
        title="بوابة تتبع الطلبات والرخص المهنية | TawzeefX"
        description="تابِع حالة طلب التوظيف، توثيق الرخصة المهنية للمعلمين، وجدولة المقابلات الشخصية مباشرة برمز التتبع."
        noindex={true}
      />
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={tawzeefLogo} alt="Tawzeef-X" className="w-8 h-8 object-contain" />
            <span className="font-black text-sm text-foreground">بوابة المعلمين والمدارس</span>
          </Link>
          <Link to="/auth" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            تسجيل دخول المدارس
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-md3-2xl bg-md-primary-container text-md-on-primary-container flex items-center justify-center mx-auto font-bold shadow-xs">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md3-full bg-md-primary-container text-md-on-primary-container text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>بوابة التتبع وتوثيق الكفاءات والشهادات</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-foreground">بوابة المرشحين والكوادر التعليمية</h1>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            تابع حالة طلبك الوظيفي، حدّث رخصتك المهنية والاعتمادات، وارفع مقطع الحصة التجريبية لتعزيز ملفك بالمنظومة.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-md-surface-container rounded-md3-2xl border border-md-outline-variant p-6 shadow-xs space-y-4">
          <div className="flex bg-card rounded-md3-full p-1 border border-md-outline-variant w-fit mx-auto shadow-xs gap-1">
            {[
              { key: "tracking" as const, label: "رمز التتبع الرقمي" },
              { key: "email" as const, label: "البريد الإلكتروني" },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => { setSearchType(t.key); setInput(""); }}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-md3-full transition-all",
                  searchType === t.key ? "bg-md-primary text-md-on-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <Input
              placeholder={searchType === "tracking" ? "أدخل رمز التتبع (مثال: TX-9842)" : "أدخل بريدك الإلكتروني"}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="text-center text-sm font-bold tracking-wider rounded-md3-xl h-11 bg-background border-md-outline-variant"
              dir="ltr"
            />
            <Button onClick={handleSearch} disabled={isLoading} className="gap-2 px-6 h-11 rounded-md3-xl bg-primary text-primary-foreground font-bold shadow-md3-1">
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              بحث عن الطلب
            </Button>
          </div>
        </div>

        {/* Email sent notification */}
        {emailSent && (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2 animate-in fade-in">
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              تم إرسال رموز التتبع إلى بريدك الإلكتروني بنجاح ✉️
            </p>
            <p className="text-xs text-muted-foreground">
              يرجى فحص صندوق الوارد (أو مجلد الرسائل غير المرغوب فيها) للضغط على رابط التتبع المباشر لطلبك.
            </p>
          </div>
        )}

        {/* Results */}
        {candidates && candidates.length > 0 && (
          <div className="space-y-6">
            {candidates.map((c) => (
              <div key={c.id} className="bg-card rounded-3xl border border-border/60 overflow-hidden shadow-xs space-y-4">
                <div className="bg-gradient-to-l from-emerald-500/10 via-teal-500/5 to-transparent p-5 border-b border-border/60 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-foreground">{c.name}</h2>
                    </div>
                    {c.role && <p className="text-xs text-muted-foreground mt-0.5">{c.role}</p>}
                  </div>
                  <Badge className={cn("px-3 py-1 text-xs font-bold rounded-xl", statusStyles[c.status] || "bg-muted text-muted-foreground")}>
                    {c.status}
                  </Badge>
                </div>

                <div className="p-5 space-y-4">
                  <h3 className="text-xs font-bold text-foreground">مراحل الفرز للوظيفة التعليمية:</h3>
                  <PipelineProgress currentStage={c.stage} stages={DEFAULT_STAGES} />

                  {/* Teacher Credentials Quick Summary Card */}
                  <div className="p-4 rounded-2xl bg-muted/20 border border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5" />
                        الرخصة المهنية للمعلمين بالسعودية:
                      </span>
                      <p className="text-xs font-bold text-foreground">{c.licenseNumber || "لم تُدخل بيانات الرخصة بعد"}</p>
                      <p className="text-[10px] text-muted-foreground">المؤهل: {c.universityDegree || "غير مسجل"}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl text-xs gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                      onClick={() => {
                        setEditTeacherModal(c);
                        setLicenseNumberInput(c.licenseNumber || "");
                        setLicenseExpiryInput(c.licenseExpiry || "");
                        setDegreeInput(c.universityDegree || "");
                        setDemoVideoInput(c.demoVideoUrl || "");
                      }}
                    >
                      <Award className="w-3.5 h-3.5" />
                      تحديث الرخصة والدرس التجريبي ✏️
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Teacher Credentials Modal */}
      <Dialog open={!!editTeacherModal} onOpenChange={() => setEditTeacherModal(null)}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              إضافة بيانات الرخصة المهنية وإكمال ملف المعلم
            </DialogTitle>
            <DialogDescription className="text-xs">
              أدخل رقم الرخصة المهنية الصادرة من هيئة تقويم التعليم والتدريب (etec.gov.sa) ورابط فيديو الدرس التجريبي لتعزيز قبولك بالمدارس.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">رقم الرخصة المهنية للمعلمين بالسعودية (ETEC) *</Label>
              <Input
                placeholder="ETEC-9842145-SA"
                value={licenseNumberInput}
                onChange={e => setLicenseNumberInput(e.target.value)}
                className="h-10 text-xs rounded-xl font-mono"
                dir="ltr"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">تاريخ انتهاء الرخصة</Label>
                <Input
                  type="date"
                  value={licenseExpiryInput}
                  onChange={e => setLicenseExpiryInput(e.target.value)}
                  className="h-10 text-xs rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">المؤهل والتخصص والجامعة</Label>
                <Input
                  placeholder="بكالوريوس علوم - جامعة الملك سعود"
                  value={degreeInput}
                  onChange={e => setDegreeInput(e.target.value)}
                  className="h-10 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">رابط فيديو الدرس التجريبي (YouTube / Drive Video URL)</Label>
              <Input
                placeholder="https://youtube.com/watch?v=..."
                value={demoVideoInput}
                onChange={e => setDemoVideoInput(e.target.value)}
                className="h-10 text-xs rounded-xl font-mono"
                dir="ltr"
              />
            </div>

            <Button onClick={handleSaveTeacherCredentials} className="w-full h-10 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500">
              <Check className="w-4 h-4" />
              حفظ بيانات الرخصة والمؤهلات
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
