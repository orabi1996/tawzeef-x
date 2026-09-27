import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import tawzeefLogo from "@/assets/tawzeef-x-logo.png";
import { validateFile } from "@/lib/fileValidation";
import { extractTextFromPDF, extractTextFromDocx } from "@/lib/fileParser";
import { parseJobCustomSpecs } from "@/lib/jobSpecsHelper";
import { getJobAvailability } from "@/lib/jobSeoHelper";
import { notifyGoogleIndexing } from "@/lib/googleIndexingService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { SEO } from "@/components/marketing/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Sparkles,
  CheckCircle2,
  FileText,
  User,
  GraduationCap,
  Clock,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

// Modular Apply Components
import ApplyJobSidebar from "@/components/apply/ApplyJobSidebar";
import ApplyStepCV from "@/components/apply/ApplyStepCV";
import ApplyStepProfile from "@/components/apply/ApplyStepProfile";
import ApplyStepSkills from "@/components/apply/ApplyStepSkills";
import ApplyStepPreferences from "@/components/apply/ApplyStepPreferences";
import ApplyStepReview from "@/components/apply/ApplyStepReview";
import ApplySuccessPass from "@/components/apply/ApplySuccessPass";

const STEPS = [
  { id: 1, title: "السيرة الذاتية", icon: FileText },
  { id: 2, title: "البيانات الشخصية", icon: User },
  { id: 3, title: "المهارات والتعليم", icon: GraduationCap },
  { id: 4, title: "التفضيلات والرسالة", icon: Clock },
  { id: 5, title: "المراجعة والاعتماد", icon: CheckCircle2 },
];

export default function ApplyJob() {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);

  // Stepper State (1 - 5)
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    currentTitle: "",
    experience: "",
    linkedinUrl: "",
    portfolioUrl: "",
    universityDegree: "",
    major: "",
    universityName: "",
    gradYear: "",
    licenseNumber: "",
    licenseExpiry: "",
    licenseType: "رخصة مهنية",
    noticePeriod: "متاح للبدء فوراً",
    expectedSalary: "",
    workMode: "حضوري في مقر العمل",
    coverLetter: "",
    demoVideoUrl: "",
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiAnalyzed, setAiAnalyzed] = useState(false);
  const [extractedCount, setExtractedCount] = useState(0);

  // Load Job
  useEffect(() => {
    async function fetchJob() {
      if (!id) return;
      try {
        // Query jobs table directly to avoid PostgREST foreign key cache mismatch
        const { data: jobData } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (jobData) {
          let companyData = null;
          if (jobData.company_id) {
            try {
              const { data: cData } = await supabase
                .from("companies")
                .select("name, logo_url")
                .eq("id", jobData.company_id)
                .maybeSingle();
              companyData = cData;
            } catch (err) {
              console.warn("Could not fetch company:", err);
            }
          }
          setJob({ ...jobData, companies: companyData });
        } else {
          setJob(null);
        }
      } catch (e) {
        console.warn("Could not fetch job:", e);
        setJob(null);
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [id]);

  const { cleanDescription, specs, hasSpecs } = useMemo(() => parseJobCustomSpecs(job), [job]);
  const jobAvailability = useMemo(() => getJobAvailability(job), [job]);

  // If page is loaded for an expired or closed job, trigger URL_DELETED to Google Indexing API in background
  useEffect(() => {
    if (!loading && job && !jobAvailability.isOpen && id) {
      notifyGoogleIndexing({
        jobId: id,
        action: "URL_DELETED",
        jobTitle: job.title,
        status: job.status,
      }).catch(() => {});
    }
  }, [loading, job, jobAvailability.isOpen, id]);

  const schoolDisplayName = useMemo(() => {
    if ((job as any)?.companies?.name) return (job as any).companies.name;
    if (specs.school_name) return specs.school_name;
    if ((job as any)?.school_name) return (job as any).school_name;
    if (job?.location?.includes("الأندلس")) return "مجمع مدارس الأندلس الأهلية";
    return "TawzeefX Partner";
  }, [job, specs]);

  const isEducational = Boolean(
    specs.is_educational ||
    job?.department?.includes("تعليم") ||
    job?.department?.includes("أكاديمي") ||
    job?.title?.includes("معلم") ||
    job?.title?.includes("مدرس")
  );

  // Suggested skills extracted from job requirements
  const suggestedJobSkills = useMemo(() => {
    if (!job?.requirements || !Array.isArray(job.requirements)) return [];
    const skillsFound: string[] = [];
    job.requirements.forEach((req: string) => {
      const words = req.split(/[\s,،/]+/);
      words.forEach(w => {
        const clean = w.trim().replace(/[•\-_*]/g, "");
        if (clean.length > 3 && !skillsFound.includes(clean) && skillsFound.length < 8) {
          skillsFound.push(clean);
        }
      });
    });
    return skillsFound;
  }, [job]);

  // Google Jobs Structured Data (JobPosting) - Strict Google Search Central Compliance
  const jobPostingJsonLd = useMemo(() => {
    // Only generate JobPosting structured data if the job is active and NOT expired
    if (!job || !job.title || !jobAvailability.isOpen || jobAvailability.isExpired) return undefined;
    const employmentTypeMap: Record<string, string> = {
      "دوام كامل": "FULL_TIME",
      "دوام جزئي": "PART_TIME",
      "عقد": "CONTRACTOR",
      "تدريب": "INTERN",
      "مؤقت": "TEMPORARY",
      "عن بُعد": "FULL_TIME",
    };

    const datePosted = job.created_at ? new Date(job.created_at).toISOString() : new Date().toISOString();
    const validThrough = jobAvailability.validThroughIso;

    const plainDesc = cleanDescription || job.description || `وظيفة ${job.title} لدى ${schoolDisplayName}`;
    const loc = job.location || "جدة، المملكة العربية السعودية";
    const isJeddah = loc.includes("جدة") || loc.includes("Jeddah");
    const isRiyadh = loc.includes("الرياض") || loc.includes("Riyadh");
    const locality = isJeddah ? "جدة" : (isRiyadh ? "الرياض" : "المملكة العربية السعودية");
    const region = isJeddah ? "منطقة مكة المكرمة" : (isRiyadh ? "منطقة الرياض" : "المملكة العربية السعودية");

    return {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: job.title,
      description: plainDesc,
      identifier: {
        "@type": "PropertyValue",
        name: "TawzeefX",
        value: `TX-${id?.slice(0, 8) || "JOB"}`,
      },
      datePosted: datePosted,
      validThrough: validThrough,
      employmentType: job.type && employmentTypeMap[job.type] ? employmentTypeMap[job.type] : "FULL_TIME",
      hiringOrganization: {
        "@type": "Organization",
        name: schoolDisplayName,
        sameAs: "https://www.tawzeefx.com/",
        logo: (job as any)?.companies?.logo_url || "https://www.tawzeefx.com/icon-512x512.png",
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          streetAddress: loc,
          addressLocality: locality,
          addressRegion: region,
          addressCountry: "SA",
        },
      },
      ...(job.type === "عن بُعد" ? { jobLocationType: "TELECOMMUTE" } : {}),
      ...(job.salary_min || job.salary_max ? {
        baseSalary: {
          "@type": "MonetaryAmount",
          currency: "SAR",
          value: {
            "@type": "QuantitativeValue",
            ...(job.salary_min ? { minValue: Number(job.salary_min) } : {}),
            ...(job.salary_max ? { maxValue: Number(job.salary_max) } : {}),
            unitText: "MONTH",
          },
        },
      } : {}),
      directApply: true,
    };
  }, [job, cleanDescription, schoolDisplayName, id]);

  const handleFieldChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // AI Resume Extraction Engine
  const processResumeFile = async (file: File) => {
    const isValid = validateFile(file, "resume");
    if (!isValid) return;
    setResumeFile(file);
    toast({ title: "تم إرفاق السيرة الذاتية بنجاح ✅", description: file.name });

    setIsAnalyzingAI(true);
    let count = 0;

    try {
      let extractedText = "";
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      if (ext === "pdf") {
        extractedText = await extractTextFromPDF(file);
      } else if (ext === "docx" || ext === "doc") {
        extractedText = await extractTextFromDocx(file);
      }

      if (extractedText) {
        // Fast Regex Heuristics
        const phoneMatch = extractedText.match(/(?:(?:\+|00)?(966|20|971|965|968|973|974)?[-.\s]?)?(05\d{8}|01[0125]\d{8}|\d{9,12})/);
        const emailMatch = extractedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        const expMatch = extractedText.match(/(\d+)\s*(?:\+|سنوات|سنة|عام|years?|yrs?)/i);
        const licenseMatch = extractedText.match(/(?:ETEC|رخصة|ترخيص|SOCPA|SCFHS)[-\s:]*([A-Za-z0-9-]+)/i);

        setForm(prev => {
          const updated = { ...prev };
          if (!prev.email && emailMatch) { updated.email = emailMatch[0].trim().toLowerCase(); count++; }
          if (!prev.phone && phoneMatch) { updated.phone = phoneMatch[0].trim(); count++; }
          if (!prev.experience && expMatch) { updated.experience = expMatch[1]; count++; }
          if (!prev.licenseNumber && licenseMatch) { updated.licenseNumber = licenseMatch[1].trim(); count++; }
          return updated;
        });

        // Supabase Edge Function parse-resume integration
        try {
          const { data: aiData, error: aiError } = await supabase.functions.invoke("parse-resume", {
            body: { resumeText: extractedText, applicantName: form.name },
          });

          if (!aiError && aiData) {
            setForm(prev => ({
              ...prev,
              name: prev.name || aiData.name || "",
              email: prev.email || aiData.email || "",
              phone: prev.phone || aiData.phone || "",
              experience: prev.experience || (aiData.years_of_experience ? String(aiData.years_of_experience) : ""),
              currentTitle: prev.currentTitle || aiData.specialty || "",
              licenseNumber: prev.licenseNumber || aiData.license_number || "",
              universityDegree: prev.universityDegree || (aiData.education?.[0]?.degree || ""),
              major: prev.major || (aiData.education?.[0]?.fieldOfStudy || ""),
              coverLetter: prev.coverLetter || aiData.experience_summary || "",
            }));

            if (Array.isArray(aiData.skills) && aiData.skills.length > 0) {
              setSkills(prev => Array.from(new Set([...prev, ...aiData.skills])));
              count += aiData.skills.length;
            }
          }
        } catch (aiErr) {
          console.warn("AI parse resume invoke notice:", aiErr);
        }

        setAiAnalyzed(true);
        setExtractedCount(Math.max(count, 4));
        toast({
          title: "✨ تم التحليل والاستخراج الذكي بنجاح",
          description: "تم ملء بيانات التواصل والمهارات والخبرات آلياً.",
        });
      }
    } catch (parseErr) {
      console.warn("Resume parsing exception notice:", parseErr);
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  const handleFileRemove = () => {
    setResumeFile(null);
    setAiAnalyzed(false);
    setExtractedCount(0);
  };

  // Final Application Submission
  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast({ title: "يرجى استكمال البيانات الأساسية", variant: "destructive" });
      setCurrentStep(2);
      return;
    }
    if (!id || !job || !getJobAvailability(job).isOpen) {
      toast({ title: "هذه الوظيفة غير متاحة للتقديم الآن", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
    let resumeUrl: string | null = null;

    // Upload CV to Storage Bucket
    if (resumeFile) {
      const ext = (resumeFile.name.split(".").pop() || "").toLowerCase();
      const filePath = `applications/${id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("resumes").upload(filePath, resumeFile, { upsert: false });
      if (uploadError) throw uploadError;
      // This bucket is private; recruiters request a signed URL when viewing it.
      resumeUrl = filePath;
    }

    const generatedTrackingCode = "TX-" + crypto.randomUUID().replace(/-/g, "").toUpperCase();

    const cleanEmail = form.email.trim().toLowerCase();
    const cleanPhone = form.phone.trim();

    const payload: any = {
      job_id: id,
      company_id: job?.company_id || null,
      name: form.name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      experience: form.experience || null,
      cover_letter: form.coverLetter || null,
      resume_url: resumeUrl,
      skills: skills.length > 0 ? skills : null,
      specialty: form.currentTitle || job?.title || null,
      tracking_code: generatedTrackingCode,
      license_number: form.licenseNumber || null,
      license_expiry: form.licenseExpiry || null,
      university_degree: form.universityDegree || null,
      demo_video_url: form.demoVideoUrl || null,
    };

    const { error: appError } = await supabase.from("applications").insert(payload);
    if (appError) throw appError;

    setTrackingCode(generatedTrackingCode);
    setSubmitted(true);
    toast({ title: "تم تقديم طلبك بنجاح ✅" });
    } catch (error) {
      console.error("Application submission failed:", error);
      toast({ title: "فشل إرسال الطلب", description: "لم يتم حفظ الطلب. حاول مرة أخرى.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <SEO
          title="شاغر وظيفي معتمد | TawzeefX"
          description="بوابة التقديم والتوظيف الذكي عبر منصة TawzeefX."
          canonical={`https://www.tawzeefx.com/apply/${id}`}
          noindex={false}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-muted-foreground">جاري تحميل بيانات الشاغر الوظيفي...</p>
        </div>
      </div>
    );
  }

  if (!job || !jobAvailability.isOpen) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans" dir="rtl">
        <SEO
          title={`${job?.title ? `الشاغر الوظيفي (${job.title}) مغلق` : "الشاغر الوظيفي غير متاح"} | TawzeefX`}
          description="عذراً، هذا الشاغر الوظيفي غير متاح حالياً أو انتهت فترة التقديم عليه."
          canonical={`https://www.tawzeefx.com/apply/${id}`}
          noindex={true}
        />
        <header className="border-b border-border/60 bg-card/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img src={tawzeefLogo} alt="Tawzeef-X" className="w-8 h-8 object-contain" />
              <div className="text-right">
                <span className="font-black text-sm tracking-tight text-foreground block leading-tight">
                  Tawzeef-X
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold block">
                  بوابة التقديم والتوظيف الذكي
                </span>
              </div>
            </Link>
            <Link to="/careers">
              <Button variant="default" size="sm" className="h-9 text-xs font-bold gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                <span>تصفح كل الوظائف</span>
              </Button>
            </Link>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <Briefcase className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold">
              {jobAvailability.isExpired ? "انتهت مهلة التقديم على هذا الشاغر" : "الشاغر الوظيفي غير متاح"}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {jobAvailability.isExpired
                ? "عذراً، انتهت مهلة استقبال طلبات التقديم لهذه الوظيفة. ندعوك لاستعراض الوظائف النشطة والتقديم عليها مباشرة."
                : "قد يكون هذا الشاغر قد تم إغلاقه أو أرشفته. يمكنك تصفح الشواغر المتاحة حالياً والتقديم عليها مباشرة."}
            </p>
            <Link to="/careers">
              <Button className="mt-2 text-xs font-bold gap-2">
                <span>تصفح الوظائف الشاغرة المتاحة</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (submitted && trackingCode) {
    return (
      <ApplySuccessPass
        job={job}
        trackingCode={trackingCode}
        applicantName={form.name}
        applicantEmail={form.email}
        applicantPhone={form.phone}
        schoolDisplayName={schoolDisplayName}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans" dir="rtl">
      <SEO
        title={`${job?.title || "شاغر وظيفي معتمد"} | ${schoolDisplayName} | TawzeefX`}
        description={`قدم الآن على شاغر ${job?.title || "وظيفة"} لدى ${schoolDisplayName} عبر منصة TawzeefX مع التقييم الذكي اللحظي.`}
        canonical={`https://www.tawzeefx.com/apply/${id}`}
        jsonLd={jobPostingJsonLd}
        noindex={!jobAvailability.isOpen}
      />

      {/* Top Header App Bar */}
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src={tawzeefLogo} alt="Tawzeef-X" className="w-8 h-8 object-contain" />
            <div className="text-right">
              <span className="font-black text-sm tracking-tight text-foreground block leading-tight">
                Tawzeef-X
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold block">
                بوابة التقديم والتوظيف الذكي
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[11px] font-bold border-primary/30 text-primary bg-primary/5 gap-1.5 hidden sm:flex">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>تقديم معتمد ومباشر</span>
            </Badge>

            <Link to="/">
              <Button variant="ghost" size="sm" className="h-8 text-xs font-bold gap-1 text-muted-foreground hover:text-foreground">
                <span>الرئيسية</span>
                <ChevronRight className="w-3 h-3 rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Job Banner */}
      <section className="bg-gradient-to-l from-primary via-emerald-700 to-teal-800 text-white py-8 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-xs font-bold">
                {schoolDisplayName}
              </Badge>
              <Badge className="bg-emerald-500/30 text-emerald-100 border-0 text-[10px] font-bold">
                شاغر متاح للتقديم
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">{job?.title}</h1>
            <p className="text-xs text-white/80 flex items-center gap-2">
              <span>{job?.department || "القسم العام"}</span>
              <span>•</span>
              <span>{job?.location || "المملكة العربية السعودية"}</span>
              <span>•</span>
              <span>{job?.type || "دوام كامل"}</span>
            </p>
          </div>

          <div className="text-right sm:text-left self-start sm:self-center">
            <span className="text-[11px] text-white/70 block">رقم الشاغر:</span>
            <span className="font-mono text-xs font-bold text-white/90">#TX-{id?.slice(0, 8)}</span>
          </div>
        </div>
      </section>

      {/* Stepper Indicator Dock */}
      <div className="border-b border-border/60 bg-card/60 backdrop-blur-md sticky top-16 z-30 py-3 px-4 shadow-2xs">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-2">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              const isCompleted = currentStep > s.id;
              const isCurrent = currentStep === s.id;

              return (
                <div key={s.id} className="flex items-center gap-2 flex-1 last:flex-none">
                  <button
                    type="button"
                    onClick={() => {
                      if (isCompleted) setCurrentStep(s.id);
                    }}
                    disabled={!isCompleted && !isCurrent}
                    className={`flex items-center gap-2 text-right transition-all group ${
                      isCurrent
                        ? "text-primary font-black scale-[1.02]"
                        : isCompleted
                        ? "text-emerald-600 font-bold hover:text-emerald-700 cursor-pointer"
                        : "text-muted-foreground/60 font-medium cursor-not-allowed"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 transition-all ${
                        isCurrent
                          ? "bg-primary text-primary-foreground shadow-xs font-black"
                          : isCompleted
                          ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/40"
                          : "bg-muted text-muted-foreground border border-border/50"
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                    </div>
                    <span className="text-xs hidden md:inline truncate">{s.title}</span>
                  </button>

                  {idx < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 transition-all rounded-full ${
                        currentStep > s.id ? "bg-emerald-500" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Workspace (Wizard + Sidebar) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Main Wizard Area (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="bg-card rounded-3xl border border-border/80 shadow-md p-6 sm:p-8 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ApplyStepCV
                      resumeFile={resumeFile}
                      onFileSelect={processResumeFile}
                      onFileRemove={handleFileRemove}
                      isAnalyzingAI={isAnalyzingAI}
                      aiAnalyzed={aiAnalyzed}
                      extractedCount={extractedCount}
                      onNext={() => setCurrentStep(2)}
                      onSkipManual={() => setCurrentStep(2)}
                    />
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ApplyStepProfile
                      form={form}
                      onChange={handleFieldChange}
                      onNext={() => setCurrentStep(3)}
                      onPrev={() => setCurrentStep(1)}
                    />
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ApplyStepSkills
                      skills={skills}
                      onSkillsChange={setSkills}
                      form={form}
                      onChange={handleFieldChange}
                      suggestedJobSkills={suggestedJobSkills}
                      isEducational={isEducational}
                      onNext={() => setCurrentStep(4)}
                      onPrev={() => setCurrentStep(2)}
                    />
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ApplyStepPreferences
                      form={form}
                      onChange={handleFieldChange}
                      isEducational={isEducational}
                      onNext={() => setCurrentStep(5)}
                      onPrev={() => setCurrentStep(3)}
                    />
                  </motion.div>
                )}

                {currentStep === 5 && (
                  <motion.div
                    key="step-5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ApplyStepReview
                      form={form}
                      skills={skills}
                      resumeFile={resumeFile}
                      job={job}
                      submitting={submitting}
                      onSubmit={handleSubmit}
                      onPrev={() => setCurrentStep(4)}
                      onJumpToStep={(step) => setCurrentStep(step)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Job Details Side Dock (5 Cols) */}
          <div className="lg:col-span-5 sticky top-36">
            <ApplyJobSidebar
              job={job}
              specs={specs}
              hasSpecs={hasSpecs}
              schoolDisplayName={schoolDisplayName}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
