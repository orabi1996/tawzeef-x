import tawzeefLogo from "@/assets/tawzeef-x-logo.png";
import { Link } from "react-router-dom";
import {
  Users, Bot, ArrowLeft, TrendingUp, Shield, Globe, CheckCircle2, Zap,
  Briefcase, FileText, Video, Sparkles, Award, Play, Layout,
  Calendar, Menu, X, Sun, Moon, Check, Building2, Lock, Cpu,
  Activity, Layers, Server, Database, MessageSquare, CheckSquare,
  FileCheck, Flame, ChevronLeft, ChevronRight, PenTool,
  Volume2, ShieldCheck, PieChart, BarChart3, Star, Clock, Laptop,
  KeyRound, HelpCircle, Eye, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/marketing/SEO";
import { useSubscriptionPlans } from "@/hooks/useSubscription";
import QuoteRequestDialog from "@/components/marketing/QuoteRequestDialog";

// --- System Showcase Modules ---
const SYSTEM_MODULES = [
  {
    id: "ai-screening",
    title: "الفرز والتقييم بالذكاء الاصطناعي",
    subtitle: "AI Resume Screening & Scorecards",
    icon: Bot,
    badge: "تحليل وترتيب المرشحين",
    badgeColor: "bg-md-primary-container text-md-on-primary-container",
  },
  {
    id: "pipeline-kanban",
    title: "مسار التوظيف ولوحة كانبان",
    subtitle: "Smart Automated Pipeline",
    icon: Layout,
    badge: "أتمتة المراحل",
    badgeColor: "bg-md-secondary-container text-md-on-secondary-container",
  },
  {
    id: "video-interviews",
    title: "غرف المقابلات والتفريغ الصوتي",
    subtitle: "Integrated Video & Transcription",
    icon: Video,
    badge: "تفريغ فوري AI",
    badgeColor: "bg-md-tertiary-container text-md-on-tertiary-container",
  },
  {
    id: "digital-offers",
    title: "العروض الوظيفية والتوقيع الإلكتروني",
    subtitle: "Digital Offers & E-Signature",
    icon: FileCheck,
    badge: "إدارة العروض إلكترونياً",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  },
  {
    id: "evaluation-tasks",
    title: "تقييم الأداء 360° وإدارة المهام",
    subtitle: "360° Performance & Task Board",
    icon: Award,
    badge: "متابعة الإنتاجية",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  },
];

const FEATURES_LIST = [
  {
    icon: Bot,
    title: "محرك الفرز والتقييم الذكي",
    description: "تحليل السير الذاتية والخبرات والمهارات لدعم فرز المرشحين وتقييمهم بالذكاء الاصطناعي.",
    highlight: "دعم وتسريع فرز السير الذاتية",
    color: "bg-md-primary-container text-md-on-primary-container",
  },
  {
    icon: Layout,
    title: "لوحات كانبان ومسارات مخصصة",
    description: "تتبع المرشحين عبر مراحل التوظيف المختلفة بسلاسة، مع إمكانية تخصيص مراحل مخصصة وإجراءات أتمتة فورية.",
    highlight: "سحب وإفلات تفاعلي",
    color: "bg-md-secondary-container text-md-on-secondary-container",
  },
  {
    icon: Video,
    title: "غرف مقابلات فيديو مدمجة",
    description: "تنظيم المقابلات ومتابعة مراحلها من داخل منصة التوظيف.",
    highlight: "تنظيم ومتابعة المقابلات",
    color: "bg-md-tertiary-container text-md-on-tertiary-container",
  },
  {
    icon: FileText,
    title: "عروض وظيفية رقمية وتوقيع حي",
    description: "إنشاء وإدارة العروض الوظيفية ومتابعة قبولها إلكترونياً.",
    highlight: "توقيع إلكتروني فوري",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  },
  {
    icon: Award,
    title: "تقييم الأداء الشامل 360°",
    description: "مخططات رادار تفاعلية، تحليل الفجوات بين المدير والتقييم الذاتي، وتوليد خطط التطوير الفردية المدعومة بالـ AI.",
    highlight: "مخططات رادار وتحليل فجوات",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  },
  {
    icon: Shield,
    title: "أمان وعزل بيانات المؤسسات",
    description: "إدارة صلاحيات المستخدمين ومتابعة الأنشطة من خلال سجل تدقيق داخل المنصة.",
    highlight: "صلاحيات وسجل تدقيق",
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20",
  },
];

const COMPLIANCE_ITEMS = [
  { label: "واجهة عربية وإنجليزية", icon: Globe },
  { label: "مراحل توظيف قابلة للتخصيص", icon: Layers },
  { label: "إدارة الوظائف والمرشحين", icon: Building2 },
  { label: "مساعدة بالذكاء الاصطناعي", icon: Cpu },
  { label: "تقارير ومؤشرات توظيف", icon: BarChart3 },
  { label: "صلاحيات حسب الأدوار", icon: KeyRound },
];

const RECENT_SYSTEM_EVENTS = [
  { text: "تم فرز سيرة ذاتية بنجاح بنسبة تطابق 94%", icon: Bot, time: "منذ دقيقة", color: "text-md-primary" },
  { text: "تم اعتماد توقيع عرض وظيفي رقمي", icon: FileCheck, time: "منذ 4 دقائق", color: "text-emerald-500" },
  { text: "جلسة مقابلة فيديو مدمجة اكتملت بتفريغ نصي", icon: Video, time: "منذ 8 دقائق", color: "text-blue-500" },
  { text: "تم تحديث أهداف الاستقطاب الشهرية", icon: TrendingUp, time: "منذ 15 دقيقة", color: "text-amber-500" },
  { text: "مزامنة مشفرة لسجلات التدقيق الأمني", icon: ShieldCheck, time: "منذ 22 دقيقة", color: "text-purple-500" },
];

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 80, damping: 20 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (inView) motionVal.set(value);
  }, [inView, value, motionVal]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => {
      setDisplay(value % 1 !== 0 ? v.toFixed(1) : Math.round(v).toString());
    });
    return unsub;
  }, [spring, value]);

  return <span ref={ref}>{display}{suffix}</span>;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.2, 0, 0, 1] },
  },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModule, setActiveModule] = useState("ai-screening");

  // Telemetry from Supabase
  const [systemStats, setSystemStats] = useState({
    activeJobs: 0,
    candidates: 0,
    interviews: 0,
    companiesCount: 0,
    isLoaded: false,
  });

  const [realCompanies, setRealCompanies] = useState<Array<{ id: string; name: string; logo_url: string | null }>>([]);
  const { data: dbPlans, isLoading: plansLoading } = useSubscriptionPlans();
  const [quotePlan, setQuotePlan] = useState<{ name: string; name_ar: string; price: number; currency: string; job_posts_limit: number } | null>(null);

  // Interactive Live Module Simulation States
  const [pipelineCandidateStage, setPipelineCandidateStage] = useState("مؤهل للمقابلة");
  const [isOfferSigned, setIsOfferSigned] = useState(false);
  const [activeAudioWave, setActiveAudioWave] = useState(true);
  const [activeAiScore, setActiveAiScore] = useState(94);

  useEffect(() => {
    async function fetchPlatformData() {
      try {
        const [jobsRes, candRes, interRes, compRes] = await Promise.all([
          supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "نشطة"),
          supabase.from("candidates").select("id", { count: "exact", head: true }),
          supabase.from("interviews").select("id", { count: "exact", head: true }),
          supabase.from("companies").select("id, name, logo_url, status"),
        ]);

        const approvedComps = (compRes.data || []).filter((c: any) => c.status === "approved" || c.name);

        setSystemStats({
          activeJobs: jobsRes.count ?? 0,
          candidates: candRes.count ?? 0,
          interviews: interRes.count ?? 0,
          companiesCount: approvedComps.length,
          isLoaded: true,
        });

        setRealCompanies(approvedComps);
      } catch (err) {
        console.warn("Failed to fetch live telemetry:", err);
        setSystemStats((prev) => ({ ...prev, isLoaded: true }));
      }
    }
    fetchPlatformData();
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-md-surface text-md-on-surface overflow-x-hidden w-full max-w-full font-sans antialiased selection:bg-md-primary selection:text-md-on-primary" dir="rtl">
      <SEO
        title="TawzeefX | منصة ذكية لإدارة التوظيف للشركات"
        description="أدر دورة التوظيف في منشأتك عبر TawzeefX: انشر الوظائف، وتابع المرشحين، ونظّم المقابلات والتقارير بواجهة عربية وإنجليزية."
        canonical="https://www.tawzeefx.com/"
        image="https://www.tawzeefx.com/icon-512x512.png"
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://www.tawzeefx.com/#organization",
              "name": "TawzeefX",
              "url": "https://www.tawzeefx.com/",
              "logo": "https://www.tawzeefx.com/icon-512x512.png",
              "description": "منصة ذكية تساعد فرق الموارد البشرية على إدارة الوظائف والمرشحين والمقابلات في مكان واحد."
            },
            {
              "@type": "WebSite",
              "@id": "https://www.tawzeefx.com/#website",
              "url": "https://www.tawzeefx.com/",
              "name": "TawzeefX",
              "description": "منصة عربية وإنجليزية لإدارة التوظيف للشركات وفرق الموارد البشرية",
              "publisher": {
                "@id": "https://www.tawzeefx.com/#organization"
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.tawzeefx.com/careers?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }
          ]
        }}
      />

      {/* ── Top App Bar (MD3 Header) ── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-md-surface/85 backdrop-blur-xl border-b border-md-outline-variant/60 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-md3-md bg-md-primary-container text-md-on-primary-container flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <img src={tawzeefLogo} alt="Tawzeef-X" className="w-7 h-7 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-md3-title-lg font-black tracking-tight text-md-on-surface leading-tight">
                Tawzeef-<span className="text-md-primary">X</span>
              </span>
              <span className="text-[10px] text-md-on-surface-variant font-bold tracking-wider">منصة التوظيف الذكية</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {[
              { label: "الوظائف الشاغرة", href: "/careers" },
              { label: "المميزات والحلول", href: "#features" },
              { label: "معاينة النظام الحي", href: "#showcase" },
              { label: "طلب عرض سعر", href: "#pricing" },
              { label: "الأمان والموثوقية", href: "#security" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-md3-label-lg font-bold text-md-on-surface-variant hover:text-md-primary transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-md3-full flex items-center justify-center text-md-on-surface-variant hover:bg-md-surface-variant/80 transition-colors"
              aria-label="تبديل الوضع"
            >
              {theme === "dark" ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>
            <Link
              to="/auth?mode=login"
              className="text-md3-label-lg font-bold text-md-primary hover:bg-md-primary-container/40 px-5 py-2.5 rounded-md3-full transition-colors"
            >
              تسجيل الدخول
            </Link>
            <Link
              to="/auth?mode=signup"
              className="bg-md-primary text-md-on-primary text-md3-label-lg font-bold px-6 py-2.5 rounded-md3-full shadow-md3-1 hover:shadow-md3-3 transition-all hover:scale-105"
            >
              ابدأ مجاناً
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            className="lg:hidden p-2.5 rounded-md3-md text-md-on-surface hover:bg-md-surface-variant"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="القائمة"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-md-surface flex flex-col p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center pb-6 border-b border-md-outline-variant">
              <div className="flex items-center gap-2.5">
                <img src={tawzeefLogo} alt="Tawzeef-X" className="w-8 h-8 object-contain" />
                <span className="text-md3-title-lg font-black text-md-primary">Tawzeef-X</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 bg-md-surface-variant rounded-md3-full text-md-on-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-5 py-8 text-md3-title-md font-bold">
              {[
                { label: "الوظائف الشاغرة", href: "/careers" },
                { label: "المميزات والحلول", href: "#features" },
                { label: "معاينة النظام الحي", href: "#showcase" },
                { label: "طلب عرض سعر", href: "#pricing" },
                { label: "الأمان والموثوقية", href: "#security" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-md-on-surface hover:text-md-primary py-2 border-b border-md-outline-variant/40"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-3">
              <Link
                to="/auth?mode=login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3.5 text-center rounded-md3-full border border-md-outline font-bold text-md-primary"
              >
                تسجيل الدخول
              </Link>
              <Link
                to="/auth?mode=signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3.5 text-center rounded-md3-full bg-md-primary text-md-on-primary font-bold shadow-md3-2"
              >
                إنشاء حساب جديد
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 1. Hero Section ── */}
      <section className="relative min-h-[92vh] pt-32 lg:pt-36 pb-16 overflow-hidden flex items-center">
        {/* Dynamic Glowing Ambient Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute -top-[10%] right-0 w-[50vw] h-[50vw] rounded-full bg-md-primary-container/35 blur-[140px]" />
          <div className="absolute bottom-0 -left-[10%] w-[45vw] h-[45vw] rounded-full bg-md-secondary-container/30 blur-[120px]" />
          <div className="absolute top-1/2 left-1/3 w-[30vw] h-[30vw] rounded-full bg-md-tertiary-container/15 blur-[100px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle,hsl(var(--md-outline-variant))_1px,transparent_1px)] bg-[size:32px_32px] opacity-25" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Right: Text & Content */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="lg:col-span-7 text-center lg:text-right"
            >
              <motion.div variants={fadeUp} className="inline-flex mb-5">
                <div className="bg-md-primary-container text-md-on-primary-container rounded-md3-full px-4 py-1.5 flex items-center gap-2 border border-md-primary/20 shadow-sm">
                  <Sparkles className="w-4 h-4 text-md-primary animate-spin-slow" />
                  <span className="text-md3-label-sm font-black">الجيل القادم من أنظمة التوظيف وإدارة المواهب</span>
                </div>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-4xl sm:text-5xl lg:text-[54px] font-black leading-[1.22] text-md-on-surface mb-6 tracking-normal"
              >
                منصة ذكية لإدارة التوظيف في منشأتك <br />
                <span className="text-md-primary relative inline-block">
                  Smart Recruitment Management Platform
                  <span className="absolute left-0 bottom-1 w-full h-2.5 bg-md-primary-container/60 -z-10 rounded-full" />
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-md3-body-lg text-md-on-surface-variant max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed font-medium"
              >
                أدر دورة التوظيف في مكان واحد: أنشئ الوظائف، وتابع المرشحين، ونظّم المقابلات، وراجع مؤشرات التوظيف بواجهة عربية وإنجليزية وأدوات مساعدة بالذكاء الاصطناعي.
              </motion.p>

              {/* CTAs */}
              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-8"
              >
                <Link
                  to="#showcase"
                  className="w-full sm:w-auto bg-md-primary text-md-on-primary rounded-md3-full h-14 px-9 text-md3-title-sm font-bold flex items-center justify-center gap-2.5 shadow-md3-2 hover:shadow-md3-4 hover:scale-105 transition-all"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>شاهد معاينة المنصة</span>
                </Link>

                <Link
                  to="#pricing"
                  className="w-full sm:w-auto bg-md-secondary-container text-md-on-secondary-container rounded-md3-full h-14 px-8 text-md3-title-sm font-bold flex items-center justify-center gap-2 hover:bg-md-secondary-container/80 transition-all border border-md-outline-variant/80"
                >
                  <Building2 className="w-4 h-4" />
                  <span>اطلب عرض سعر</span>
                </Link>
              </motion.div>

              {/* Live Status Indicators */}
              <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs">
                <div className="flex items-center gap-2 bg-md-surface-container px-3.5 py-1.5 rounded-md3-full border border-md-outline-variant">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-md-on-surface">استجابة حية لنظام التوظيف</span>
                </div>
                <div className="flex items-center gap-1.5 text-md-on-surface-variant font-medium">
                  <Lock className="w-3.5 h-3.5 text-md-primary" />
                  <span>عزل مشفر لبيانات المنشآت RLS</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Left: Floating Animated System Teaser */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="bg-md-surface-container rounded-md3-2xl p-4 shadow-md3-4 border border-md-outline-variant relative">
                {/* Header Mockup */}
                <div className="bg-md-surface rounded-md3-xl p-5 border border-md-outline-variant/60 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-md3-md bg-md-primary text-md-on-primary flex items-center justify-center font-black text-xs">
                        TX
                      </div>
                      <div>
                        <div className="text-xs font-bold text-md-on-surface">غرفة عمليات التوظيف الفوري</div>
                        <div className="text-[10px] text-md-on-surface-variant">البيئة السحابية المؤتمتة</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-md3-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      نشط الآن
                    </span>
                  </div>

                  {/* AI Match Scorecard Sample Card */}
                  <div className="bg-md-surface-container p-4 rounded-md3-lg border border-md-outline-variant/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-md-primary-container text-md-on-primary-container font-black text-xs flex items-center justify-center">
                          س
                        </div>
                        <div>
                          <div className="text-xs font-bold text-md-on-surface">سارة العتيبي</div>
                          <div className="text-[10px] text-md-on-surface-variant">مهندسة نظم أولى</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-md-primary">94%</div>
                        <div className="text-[9px] text-md-on-surface-variant">مؤشر التوافق</div>
                      </div>
                    </div>

                    <div className="w-full bg-md-surface rounded-full h-2 overflow-hidden border border-md-outline-variant/30">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "94%" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-md-primary via-indigo-500 to-emerald-500 rounded-full"
                      />
                    </div>

                    <div className="flex gap-2 text-[10px] font-bold flex-wrap">
                      <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md3-sm">خبرة 5+ سنوات</span>
                      <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md3-sm">جدارات تقنية عالية</span>
                      <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-md3-sm">توصية فورية</span>
                    </div>
                  </div>

                  {/* Dynamic Interactive Pipeline Stages */}
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
                    <div className="bg-md-surface-container p-2.5 rounded-md3-md border border-md-outline-variant/50">
                      <div className="text-md-on-surface-variant text-[10px]">فرز AI</div>
                      <div className="text-sm font-black text-md-on-surface mt-0.5">
                        <AnimatedCounter value={systemStats.candidates > 0 ? systemStats.candidates : 34} />
                      </div>
                    </div>
                    <div className="bg-md-primary-container/40 p-2.5 rounded-md3-md border border-md-primary/30">
                      <div className="text-md-primary text-[10px]">المقابلات</div>
                      <div className="text-sm font-black text-md-primary mt-0.5">
                        <AnimatedCounter value={systemStats.interviews > 0 ? systemStats.interviews : 12} />
                      </div>
                    </div>
                    <div className="bg-emerald-500/10 p-2.5 rounded-md3-md border border-emerald-500/20">
                      <div className="text-emerald-600 dark:text-emerald-400 text-[10px]">العروض الرقمية</div>
                      <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                        <AnimatedCounter value={systemStats.activeJobs > 0 ? systemStats.activeJobs : 8} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Widget 1: Real-time AI Match */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                  className="absolute -top-4 -right-4 bg-md-surface px-4 py-3 rounded-md3-xl shadow-md3-3 border border-md-outline-variant flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-md3-full bg-md-primary-container text-md-on-primary-container flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-md-on-surface-variant font-bold">فحص السير الذاتية</div>
                    <div className="text-xs font-black text-md-primary">عرض توضيحي لفرز المرشحين</div>
                  </div>
                </motion.div>

                {/* Floating Widget 2: Certified E-Sign */}
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-4 -left-4 bg-md-surface px-4 py-3 rounded-md3-xl shadow-md3-3 border border-md-outline-variant flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-md3-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-md-on-surface-variant font-bold">حالة العرض الوظيفي</div>
                    <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">متابعة حالة العرض</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 2. Real System Metrics & Live Platform Telemetry ── */}
      <section className="bg-md-surface-container-low border-y border-md-outline-variant py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-md-outline-variant/60">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <div>
                <h3 className="text-md3-title-md font-black text-md-on-surface flex items-center gap-2">
                  <span>مؤشرات Tawzeef-X</span>
                  <span className="text-xs font-normal text-md-primary bg-md-primary-container px-2.5 py-0.5 rounded-md3-full font-mono">
                    Platform Metrics
                  </span>
                </h3>
                <p className="text-xs text-md-on-surface-variant">
                  تعرض هذه المؤشرات أعداد الوظائف والمرشحين والمقابلات المسجلة على المنصة.
                </p>
              </div>
            </div>
            <div className="text-xs text-md-on-surface-variant font-mono bg-md-surface px-3 py-1.5 rounded-md3-md border border-md-outline-variant">
              تُحمَّل الأعداد من بيانات المنصة المتاحة.
            </div>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                label: "الشواغر النشطة بالنظام",
                value: systemStats.activeJobs,
                icon: Briefcase,
                desc: "وظيفة قيد الاستقطاب والمعالجة",
                color: "text-md-primary",
              },
              {
                label: "إجمالي ملفات المرشحين",
                value: systemStats.candidates,
                icon: Users,
                desc: "سيرة ذاتية مفروزة ومفهرسة بالـ AI",
                color: "text-md-secondary",
              },
              {
                label: "جلسات المقابلات المسجلة",
                value: systemStats.interviews,
                icon: Video,
                desc: "مقابلة منجزة أو مجدولة بالنظام",
                color: "text-md-tertiary",
              },
              {
                label: "المنشآت المسجلة",
                value: systemStats.companiesCount > 0 ? systemStats.companiesCount : 1,
                icon: Building2,
                desc: "شركة ومؤسسة تستخدم المنصة",
                color: "text-md-primary",
              },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                className="bg-md-surface rounded-md3-xl p-6 border border-md-outline-variant shadow-sm flex flex-col justify-between hover:border-md-primary transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-md-on-surface-variant">{stat.label}</span>
                  <div className="w-10 h-10 rounded-md3-lg bg-md-surface-container flex items-center justify-center group-hover:scale-105 transition-transform">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <div>
                  <div className="text-3xl lg:text-4xl font-black text-md-on-surface mb-1 font-mono tracking-tight">
                    <AnimatedCounter value={stat.value} />
                  </div>
                  <div className="text-[11px] text-md-on-surface-variant font-medium">{stat.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Real-time System Milestone Ticker */}
          <div className="mt-8 pt-6 border-t border-md-outline-variant/60">
            <div className="text-[11px] font-bold text-md-on-surface-variant mb-3 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-md-primary" />
              <span>نبض العمليات الأخيرة في المنظومة:</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {RECENT_SYSTEM_EVENTS.slice(0, 3).map((evt, i) => (
                <div
                  key={i}
                  className="bg-md-surface p-3 rounded-md3-lg border border-md-outline-variant/70 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <evt.icon className={`w-4 h-4 ${evt.color}`} />
                    <span className="font-bold text-md-on-surface">{evt.text}</span>
                  </div>
                  <span className="text-[10px] text-md-on-surface-variant font-mono">{evt.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Interactive System Showcase: Explore Tawzeef-X from Inside ── */}
      <section id="showcase" className="py-24 bg-md-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-md-primary-container text-md-on-primary-container text-xs font-black px-4 py-1.5 rounded-md3-full mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>مختبر تجربة النظام الحي</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-md-on-surface mb-4">
              استكشف قدرات Tawzeef-X الحقيقية من الداخل
            </h2>
            <p className="text-md3-body-md text-md-on-surface-variant">
              شاهد كيف تعمل محركات الذكاء الاصطناعي، لوحات الكانبان، غرف المقابلات، والتوقيع الرقمي في تجربة تفاعلية حية
            </p>
          </div>

          {/* Module Switcher Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
            {SYSTEM_MODULES.map((mod) => {
              const isSelected = activeModule === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveModule(mod.id)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-md3-xl text-xs font-bold transition-all duration-200 ${
                    isSelected
                      ? "bg-md-primary text-md-on-primary shadow-md3-2 scale-105"
                      : "bg-md-surface-container text-md-on-surface-variant border border-md-outline-variant hover:bg-md-surface-container-high"
                  }`}
                >
                  <mod.icon className="w-4 h-4" />
                  <span>{mod.title}</span>
                </button>
              );
            })}
          </div>

          {/* Module Live Interactive Frame */}
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-md-surface-container rounded-md3-2xl p-6 sm:p-8 border border-md-outline-variant shadow-md3-3"
          >
            {/* 1. AI Screening & Resume Scorecard Preview */}
            {activeModule === "ai-screening" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-md-outline-variant">
                  <div>
                    <h3 className="text-xl font-black text-md-on-surface flex items-center gap-2">
                      <Bot className="w-5 h-5 text-md-primary" />
                      <span>بطاقة تقييم السيرة الذاتية الذكية (AI Candidate Scorecard)</span>
                    </h3>
                    <p className="text-xs text-md-on-surface-variant mt-1">
                      تحليل وتصنيف تلقائي متعدد الأبعاد لمطابقة متطلبات الشاغر مع مهارات المرشح
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-md-primary bg-md-primary-container px-3 py-1 rounded-md3-full">
                      مطابقة دقيقة 94%
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-12 gap-6 items-stretch">
                  {/* Candidate Info Card */}
                  <div className="md:col-span-4 bg-md-surface p-5 rounded-md3-xl border border-md-outline-variant space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-md3-lg bg-md-primary-container text-md-on-primary-container font-black text-base flex items-center justify-center">
                        أ
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-md-on-surface">أحمد خالد المنصور</h4>
                        <p className="text-xs text-md-on-surface-variant">مطور برمجيات سحابية (Full Stack)</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-md-outline-variant/60 text-xs">
                      <div className="flex justify-between">
                        <span className="text-md-on-surface-variant font-medium">الخبرة:</span>
                        <span className="font-bold text-md-on-surface">6 سنوات في React & Node.js</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-md-on-surface-variant font-medium">التعليم:</span>
                        <span className="font-bold text-md-on-surface">بكالوريوس علوم حاسب</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-md-on-surface-variant font-medium">حالة التقييم:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">موصى به للمقابلة التقنية</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Dimension Scores Breakdown */}
                  <div className="md:col-span-8 bg-md-surface p-5 rounded-md3-xl border border-md-outline-variant space-y-4">
                    <h4 className="text-xs font-black text-md-on-surface flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-md-primary" />
                      <span>تفصيل درجات الملاءمة المعيارية:</span>
                    </h4>

                    <div className="space-y-3">
                      {[
                        { label: "المهارات التقنية والتطبيقية", score: 96, color: "bg-md-primary" },
                        { label: "توافق سنوات ومجال الخبرة", score: 92, color: "bg-emerald-500" },
                        { label: "المؤهل الأكاديمي والشهادات المهنية", score: 90, color: "bg-blue-500" },
                        { label: "التوافق الثقافي وأسلوب العمل", score: 88, color: "bg-amber-500" },
                      ].map((dim, i) => (
                        <div key={i} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-md-on-surface">{dim.label}</span>
                            <span className="font-mono text-md-primary">{dim.score}%</span>
                          </div>
                          <div className="w-full bg-md-surface-container rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${dim.score}%` }}
                              transition={{ duration: 1, delay: i * 0.1 }}
                              className={`h-full ${dim.color} rounded-full`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-md-surface-container rounded-md3-lg border border-md-outline-variant/60 text-xs text-md-on-surface-variant leading-relaxed">
                      <strong className="text-md-on-surface">ملاحظة الذكاء الاصطناعي:</strong> يمتلك المرشح سجلاً متميزاً في تطوير الأنظمة القابلة للتوسع (Scalable Systems) مع كفاءة في أمن البرمجيات.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Smart Pipeline & Kanban Stages */}
            {activeModule === "pipeline-kanban" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-md-outline-variant">
                  <div>
                    <h3 className="text-xl font-black text-md-on-surface flex items-center gap-2">
                      <Layout className="w-5 h-5 text-md-primary" />
                      <span>لوحة كانبان الذكية ومراحل الاستقطاب (Interactive Kanban)</span>
                    </h3>
                    <p className="text-xs text-md-on-surface-variant mt-1">
                      نقل المرشحين عبر مراحل التوظيف بنقرة واحدة مع تشغيل الإجراءات التلقائية
                    </p>
                  </div>
                  <div className="text-xs font-bold text-md-on-surface-variant">
                    المرحلة الحالية: <span className="text-md-primary font-black">{pipelineCandidateStage}</span>
                  </div>
                </div>

                {/* Pipeline Stage Steps */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    "فرز AI جديد",
                    "تقييم أولي",
                    "مؤهل للمقابلة",
                    "عرض وظيفي رقمي",
                    "تم التعيين والتعاقد",
                  ].map((stage, i) => {
                    const isCurrent = pipelineCandidateStage === stage;
                    return (
                      <button
                        key={i}
                        onClick={() => setPipelineCandidateStage(stage)}
                        className={`p-4 rounded-md3-xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                          isCurrent
                            ? "bg-md-primary text-md-on-primary border-md-primary shadow-md3-2 scale-105"
                            : "bg-md-surface text-md-on-surface border-md-outline-variant hover:bg-md-surface-container-high"
                        }`}
                      >
                        <span className="text-[10px] font-mono opacity-80">المرحلة {i + 1}</span>
                        <span className="text-xs font-black">{stage}</span>
                        {isCurrent && <Check className="w-4 h-4 mt-1" />}
                      </button>
                    );
                  })}
                </div>

                {/* Candidate Kanban Sample Card */}
                <div className="bg-md-surface p-5 rounded-md3-xl border border-md-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-md-secondary-container text-md-on-secondary-container font-bold flex items-center justify-center text-sm">
                      م
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-md-on-surface">محمد العبدالله</h4>
                      <p className="text-xs text-md-on-surface-variant">مدير مشاريع تقنية • شاغر: إدارة المنتجات</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold bg-md-primary-container text-md-on-primary-container px-3 py-1 rounded-md3-full">
                      {pipelineCandidateStage}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => {
                        const stages = ["فرز AI جديد", "تقييم أولي", "مؤهل للمقابلة", "عرض وظيفي رقمي", "تم التعيين والتعاقد"];
                        const nextIdx = (stages.indexOf(pipelineCandidateStage) + 1) % stages.length;
                        setPipelineCandidateStage(stages[nextIdx]);
                      }}
                      className="rounded-md3-xl bg-md-primary text-md-on-primary font-bold text-xs h-9 px-4"
                    >
                      <span>نقل للمرحلة التالية</span>
                      <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Live Video Interview & Transcription */}
            {activeModule === "video-interviews" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-md-outline-variant">
                  <div>
                    <h3 className="text-xl font-black text-md-on-surface flex items-center gap-2">
                      <Video className="w-5 h-5 text-md-primary" />
                      <span>غرف المقابلات المدمجة والتفريغ الصوتي الفوري</span>
                    </h3>
                    <p className="text-xs text-md-on-surface-variant mt-1">
                      مقابلات فيديو عالية الجودة مع تسجيل صوتي وتحويل الكلام إلى نصوص وتوليد الأسئلة الذكية
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs font-bold text-md-on-surface">بث وتفريغ حي</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-12 gap-6 items-stretch">
                  {/* Simulated Video Frame */}
                  <div className="md:col-span-7 bg-md-surface rounded-md3-xl p-6 border border-md-outline-variant flex flex-col justify-between min-h-[260px] relative overflow-hidden">
                    <div className="flex items-center justify-between z-10">
                      <span className="text-[11px] font-bold bg-md-surface/80 backdrop-blur-md px-2.5 py-1 rounded-md3-sm border border-md-outline-variant">
                        غرفة المقابلة: #TX-9042
                      </span>
                      <span className="text-[11px] font-mono font-bold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-md3-sm">
                        REC 14:32
                      </span>
                    </div>

                    <div className="my-auto text-center py-6">
                      <div className="w-20 h-20 rounded-full bg-md-primary-container text-md-on-primary-container font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-md3-1">
                        خ
                      </div>
                      <h4 className="font-black text-sm text-md-on-surface">خالد الشمري</h4>
                      <p className="text-xs text-md-on-surface-variant">مهندس أمن سيبراني</p>
                    </div>

                    {/* Animated Audio Waveform */}
                    <div className="flex items-center justify-center gap-1.5 h-8 z-10">
                      {[16, 24, 12, 32, 20, 28, 14, 30, 22, 18, 28, 12].map((height, idx) => (
                        <motion.div
                          key={idx}
                          animate={{ height: [8, height, 8] }}
                          transition={{ repeat: Infinity, duration: 1.2, delay: idx * 0.08 }}
                          className="w-1.5 bg-md-primary rounded-full"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Real-time Transcription Panel */}
                  <div className="md:col-span-5 bg-md-surface rounded-md3-xl p-5 border border-md-outline-variant space-y-4">
                    <h4 className="text-xs font-black text-md-on-surface flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-md-primary" />
                      <span>نموذج توضيحي للتفريغ النصي:</span>
                    </h4>

                    <div className="space-y-3 text-xs leading-relaxed max-h-[190px] overflow-y-auto">
                      <div className="p-3 rounded-md3-lg bg-md-surface-container border border-md-outline-variant/60">
                        <strong className="text-md-primary block mb-1">المحاور:</strong>
                        <span>حدثنا عن خبرتك في تطبيق بروتوكولات الأمان السحابية؟</span>
                      </div>
                      <div className="p-3 rounded-md3-lg bg-md-primary-container/30 border border-md-primary/20">
                        <strong className="text-md-on-surface block mb-1">المرشح (خالد):</strong>
                        <span>قمت بقيادة مشروع عزل الصلاحيات وحماية نقاط الاتصال API بأعلى معايير التشفير.</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-md3-sm">
                      <span>مثال توضيحي لنتيجة التقييم</span>
                      <span>نسبة توافق توضيحية</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Digital Job Offers & E-Signature */}
            {activeModule === "digital-offers" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-md-outline-variant">
                  <div>
                    <h3 className="text-xl font-black text-md-on-surface flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-md-primary" />
                      <span>بوابة العروض الوظيفية والتوقيع الإلكتروني (Digital Job Offer)</span>
                    </h3>
                    <p className="text-xs text-md-on-surface-variant mt-1">
                      إصدار عروض العمل بحسابات الراتب بالريال السعودي، وتوقيع إلكتروني مشفر معتمد
                    </p>
                  </div>
                  <div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-md3-full border ${
                      isOfferSigned
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    }`}>
                      {isOfferSigned ? "تم قبول وتوقيع العرض بنجاح ✓" : "بانتظار توقيع المرشح"}
                    </span>
                  </div>
                </div>

                <div className="bg-md-surface p-6 rounded-md3-xl border border-md-outline-variant space-y-6">
                  {/* Offer Summary Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-md-outline-variant/60">
                    <div>
                      <span className="text-[10px] font-bold text-md-on-surface-variant uppercase">المسمى الوظيفي:</span>
                      <h4 className="text-base font-black text-md-on-surface">مدير هندسة البرمجيات (Engineering Lead)</h4>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-bold text-md-on-surface-variant uppercase">الراتب الأساسي الشهري:</span>
                      <div className="text-xl font-black text-md-primary font-mono">24,000 <span className="text-xs font-normal">ر.س / شهر</span></div>
                    </div>
                  </div>

                  {/* Salary Breakdown & Benefits */}
                  <div className="grid sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-md-surface-container rounded-md3-lg border border-md-outline-variant/60">
                      <span className="text-md-on-surface-variant block mb-1">بدل السكن:</span>
                      <span className="font-black text-md-on-surface">6,000 ر.س (25%)</span>
                    </div>
                    <div className="p-3 bg-md-surface-container rounded-md3-lg border border-md-outline-variant/60">
                      <span className="text-md-on-surface-variant block mb-1">بدل النقل:</span>
                      <span className="font-black text-md-on-surface">2,400 ر.س (10%)</span>
                    </div>
                    <div className="p-3 bg-md-primary-container text-md-on-primary-container rounded-md3-lg">
                      <span className="block mb-1 opacity-80">إجمالي الباقة الشهرية:</span>
                      <span className="font-black text-sm font-mono">32,400 ر.س</span>
                    </div>
                  </div>

                  {/* Interactive E-Signature Trigger */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-md-outline-variant/60">
                    <div className="text-xs text-md-on-surface-variant font-medium">
                      {isOfferSigned
                        ? "تم توثيق التوقيع الرقمي وتوليد وثيقة PDF المشفرة بنجاح."
                        : "اضغط على الزر لمحاكاة توقيع المرشح على العرض الوظيفي:"}
                    </div>
                    <Button
                      onClick={() => setIsOfferSigned(!isOfferSigned)}
                      className={`rounded-md3-xl text-xs font-bold h-10 px-6 transition-all ${
                        isOfferSigned
                          ? "bg-md-surface-container text-md-on-surface border border-md-outline-variant"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md3-2"
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5 mr-1.5" />
                      <span>{isOfferSigned ? "إعادة تعيين للتجربة" : "محاكاة التوقيع الإلكتروني"}</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 5. 360° Performance & Task Board */}
            {activeModule === "evaluation-tasks" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-md-outline-variant">
                  <div>
                    <h3 className="text-xl font-black text-md-on-surface flex items-center gap-2">
                      <Award className="w-5 h-5 text-md-primary" />
                      <span>تقييم الأداء الشامل 360° وإدارة مهام الاستقطاب</span>
                    </h3>
                    <p className="text-xs text-md-on-surface-variant mt-1">
                      متابعة أداء فريق العمل وتحليل فجوات الأداء وإدارة لوحة المهام التشغيلية
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/evaluation"
                      className="text-xs font-bold text-md-primary hover:underline flex items-center gap-1"
                    >
                      <span>فتح تقييم الأداء</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="grid md:grid-cols-12 gap-6 items-stretch">
                  {/* 360 Radar & Dimensions Insight */}
                  <div className="md:col-span-6 bg-md-surface p-5 rounded-md3-xl border border-md-outline-variant space-y-4">
                    <h4 className="text-xs font-black text-md-on-surface flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-md-primary" />
                      <span>مؤشرات أداء الموظف (أبعاد 360):</span>
                    </h4>

                    <div className="space-y-2.5 text-xs">
                      {[
                        { name: "الإنتاجية والإنجاز", self: 9.0, mgr: 8.5, gap: "+0.5" },
                        { name: "القيادة والمبادرة", self: 8.0, mgr: 8.0, gap: "0.0" },
                        { name: "العمل الجماعي والتعاون", self: 9.5, mgr: 9.2, gap: "+0.3" },
                        { name: "المهارة التقنية التخصصية", self: 9.5, mgr: 9.5, gap: "0.0" },
                      ].map((dim, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-md3-md bg-md-surface-container border border-md-outline-variant/40">
                          <span className="font-bold text-md-on-surface">{dim.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] text-md-on-surface-variant">الذاتي: {dim.self} / المدير: {dim.mgr}</span>
                            <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md3-sm">
                              {dim.gap}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Task Management Snippet */}
                  <div className="md:col-span-6 bg-md-surface p-5 rounded-md3-xl border border-md-outline-variant space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black text-md-on-surface flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-md-primary" />
                        <span>مهام الاستقطاب النشطة (Task Board):</span>
                      </h4>
                      <Link to="/tasks" className="text-[11px] font-bold text-md-primary hover:underline">
                        عرض لوحة المهام ←
                      </Link>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { title: "إجراء المقابلة النهائية مع مهندس الواجهات", due: "اليوم", tag: "أولوية قصوى", color: "bg-red-500/10 text-red-600 dark:text-red-400" },
                        { title: "مراجعة واعتماد العرض الوظيفي لمدير المنتجات", due: "غداً", tag: "متوسطة", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
                        { title: "فحص السير الذاتية الجديدة بالذكاء الاصطناعي", due: "خلال يومين", tag: "تلقائي", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
                      ].map((task, i) => (
                        <div key={i} className="p-3 bg-md-surface-container rounded-md3-lg border border-md-outline-variant/60 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-md-on-surface">{task.title}</div>
                            <div className="text-[10px] text-md-on-surface-variant mt-0.5">موعد التسليم: {task.due}</div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md3-sm ${task.color}`}>
                            {task.tag}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── 4. Core Features Grid (MD3 Cards) ── */}
      <section id="features" className="py-24 bg-md-surface-container-low border-t border-md-outline-variant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block bg-md-primary-container text-md-on-primary-container text-md3-label-sm font-black px-4 py-1.5 rounded-md3-full mb-4">
              المميزات والحلول الشاملة
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-md-on-surface mb-5 leading-tight">
              كل ما تحتاجه لإدارة منظومة الاستقطاب <br />
              <span className="text-md-primary">في منصة سحابية واحدة</span>
            </h2>
            <p className="text-md3-body-md text-md-on-surface-variant leading-relaxed">
              منظومة مصممة لتمكين مسؤولي الموارد البشرية والمدراء التنفيذيين من اتخاذ قرارات سريعة ودقيقة وموثقة بالبيانات.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {FEATURES_LIST.map((f, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                className="bg-md-surface shadow-md3-1 hover:shadow-md3-3 hover:-translate-y-1.5 transition-all duration-300 rounded-md3-2xl p-7 flex flex-col border border-md-outline-variant/70 group"
              >
                <div className={`w-14 h-14 rounded-md3-xl flex items-center justify-center mb-6 ${f.color} shadow-sm group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-md3-title-lg font-black text-md-on-surface mb-3">{f.title}</h3>
                <p className="text-md3-body-md text-md-on-surface-variant flex-1 leading-relaxed font-normal">
                  {f.description}
                </p>
                <div className="mt-6 pt-4 border-t border-md-outline-variant/50">
                  <span className="bg-md-primary-container text-md-on-primary-container text-xs font-black rounded-md3-full px-3.5 py-1.5 inline-flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    {f.highlight}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 5. Dynamic Pricing Section (Connected Directly to Supabase subscription_plans) ── */}
      <section id="pricing" className="py-24 bg-md-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-md-primary-container text-md-on-primary-container text-xs font-black px-4 py-1.5 rounded-md3-full mb-4">
              <Database className="w-3.5 h-3.5" />
              <span>حلول توظيف مرنة للمنشآت</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-md-on-surface mb-4">
              حلول مرنة تناسب حجم واحتياج كل منشأة
            </h2>
            <p className="text-md3-body-md text-md-on-surface-variant">
              تعرّف على مزايا TawzeefX، ثم أرسل طلب عرض سعر ليتواصل معك الفريق عبر البريد أو الجوال.
            </p>
          </div>

          {plansLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-md-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch"
            >
              {(dbPlans && dbPlans.length > 0 ? dbPlans : []).map((plan, idx) => {
                const isPro = plan.name === "pro";
                const isFree = plan.price === 0;

                return (
                  <motion.div
                    key={plan.id || idx}
                    variants={fadeUp}
                    className={`rounded-md3-2xl p-8 flex flex-col justify-between transition-all duration-300 ${
                      isPro
                        ? "bg-md-primary text-md-on-primary shadow-md3-4 border-2 border-md-primary lg:-translate-y-2"
                        : "bg-md-surface text-md-on-surface shadow-sm border border-md-outline-variant"
                    }`}
                  >
                    <div>
                      {isPro && (
                        <div className="bg-md-on-primary text-md-primary text-xs font-black px-3.5 py-1 rounded-md3-full inline-block mb-4 shadow-sm">
                          الباقة الأكثر اختياراً ⭐
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-2xl font-black">{plan.name_ar || plan.name}</h3>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-md3-full font-bold ${
                            isPro
                              ? "bg-md-on-primary/20 text-md-on-primary"
                              : "bg-md-surface-container text-md-on-surface-variant"
                          }`}
                        >
                          {plan.billing_period === "monthly" ? "شهري" : "سنوي"}
                        </span>
                      </div>

                      <p
                        className={`text-xs mb-6 ${
                          isPro ? "text-md-on-primary/80" : "text-md-on-surface-variant"
                        }`}
                      >
                        {plan.description || "باقة مخصصة لتلبية احتياجات التوظيف والاستقطاب"}
                      </p>

                      <div className="mb-6 flex items-baseline gap-1.5">
                        {isFree ? (
                          <span className="text-4xl font-black">مجاناً</span>
                        ) : (
                          <span className="text-2xl font-black leading-tight">عرض سعر عند الطلب</span>
                        )}
                      </div>

                      <div
                        className={`text-xs font-bold mb-6 pb-6 border-b ${
                          isPro ? "border-md-on-primary/20" : "border-md-outline-variant"
                        }`}
                      >
                        حد إعلانات الشواغر:{" "}
                        <span className="font-mono">
                          {plan.job_posts_limit === -1 ? "غير محدود" : `${plan.job_posts_limit} وظيفة`}
                        </span>
                      </div>

                      {/* Features List */}
                      <div className="space-y-3 mb-8">
                        {(plan.features || []).map((feat: string, fIdx: number) => (
                          <div key={fIdx} className="flex items-start gap-2.5 text-xs font-medium">
                            <CheckCircle2
                              className={`w-4 h-4 shrink-0 mt-0.5 ${
                                isPro ? "text-md-on-primary" : "text-md-primary"
                              }`}
                            />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {isFree ? (
                      <Link
                        to="/auth?mode=signup"
                        className="w-full py-3.5 rounded-md3-full font-bold text-center text-sm transition-transform hover:scale-105 shadow-sm bg-md-primary text-md-on-primary"
                      >
                        ابدأ الاستخدام المجاني
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setQuotePlan({
                          name: plan.name,
                          name_ar: plan.name_ar || plan.name,
                          price: plan.price,
                          currency: plan.currency,
                          job_posts_limit: plan.job_posts_limit,
                        })}
                        className={`w-full py-3.5 rounded-md3-full font-bold text-center text-sm transition-transform hover:scale-105 shadow-sm ${
                          isPro
                            ? "bg-md-on-primary text-md-primary shadow-md3-2"
                            : "bg-md-primary text-md-on-primary"
                        }`}
                      >
                        طلب عرض سعر
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── 6. Security & Enterprise Compliance ── */}
      <section id="security" className="py-20 bg-md-surface-container-low border-t border-md-outline-variant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-md-surface via-md-surface-container-high to-md-surface rounded-md3-2xl p-8 lg:p-12 border border-md-outline-variant shadow-sm">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8">
                <div className="inline-flex items-center gap-2 bg-md-primary-container text-md-on-primary-container text-xs font-bold px-3 py-1 rounded-md3-full mb-4">
                  <Shield className="w-3.5 h-3.5" />
                  <span>حماية البيانات والخصوصية المؤسسية</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-md-on-surface mb-3">
                  تحكم في الصلاحيات ومتابعة أنشطة المستخدمين
                </h3>
                <p className="text-sm text-md-on-surface-variant leading-relaxed mb-6 font-medium">
                  تساعدك صلاحيات الأدوار وسجل الأنشطة على تنظيم الوصول ومراجعة العمليات داخل TawzeefX.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {COMPLIANCE_ITEMS.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2.5 rounded-md3-md bg-md-surface-container border border-md-outline-variant/60 text-xs font-bold text-md-on-surface"
                    >
                      <item.icon className="w-4 h-4 text-md-primary shrink-0" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-4 flex justify-center lg:justify-end">
                <Link
                  to="/auth?mode=signup"
                  className="bg-md-primary text-md-on-primary rounded-md3-full px-8 py-4 text-sm font-bold shadow-md3-2 hover:shadow-md3-4 hover:scale-105 transition-all text-center"
                >
                  إنشاء حساب مسؤولي المنشأة
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Final Executive CTA ── */}
      <section className="py-20 bg-md-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-gradient-to-br from-md-primary-container via-md-secondary-container/40 to-md-tertiary-container/30 rounded-md3-2xl p-12 lg:p-16 border border-md-primary/20 shadow-md3-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-md-on-primary-container mb-6 leading-tight">
              ابدأ تحويل منظومة الاستقطاب <br />
              في منشأتك اليوم
            </h2>
            <p className="text-md3-body-md text-md-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              انضم إلى المنشآت التي تختصر الوقت والجهد وتوظف أفضل الكفاءات بدقة واحترافية متناهية.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/auth?mode=signup"
                className="w-full sm:w-auto bg-md-primary text-md-on-primary rounded-md3-full h-14 px-10 text-md3-title-sm font-bold flex items-center justify-center gap-2 shadow-md3-2 hover:shadow-md3-4 hover:scale-105 transition-all"
              >
                <span>إنشاء حساب والبدء فوراً</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <Link
                to="/auth?mode=login"
                className="w-full sm:w-auto bg-md-surface text-md-on-surface rounded-md3-full h-14 px-8 text-md3-title-sm font-bold flex items-center justify-center border border-md-outline-variant hover:bg-md-surface-variant transition-all"
              >
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. Enterprise Footer (NO PUBLIC JOBS LISTINGS) ── */}
      <footer className="bg-md-surface-variant text-md-on-surface-variant pt-16 pb-12 border-t border-md-outline-variant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Column 1: Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img src={tawzeefLogo} alt="Tawzeef-X" className="w-8 h-8 object-contain" />
                <span className="text-md3-title-lg font-black text-md-on-surface">Tawzeef-X</span>
              </div>
              <p className="text-xs text-md-on-surface-variant leading-relaxed mb-6 font-medium">
                المنصة السحابية المتقدمة لرقمنة وإدارة عمليات التوظيف والاستقطاب الذكي المدعومة بالذكاء الاصطناعي في الشرق الأوسط.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-md-primary font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>نظام سحابي معتمد 2026</span>
              </div>
            </div>

            {/* Column 2: Navigation */}
            <div>
              <h4 className="font-black text-sm text-md-on-surface mb-4">روابط سريعة</h4>
              <ul className="space-y-3 text-xs font-bold">
                <li><a href="#features" className="hover:text-md-primary transition-colors">المميزات والحلول</a></li>
                <li><a href="#showcase" className="hover:text-md-primary transition-colors">معاينة النظام الحي</a></li>
                <li><a href="#pricing" className="hover:text-md-primary transition-colors">باقات المنشآت</a></li>
                <li><a href="#security" className="hover:text-md-primary transition-colors">الأمان والخصوصية</a></li>
              </ul>
            </div>

            {/* Column 3: Platform Capabilities */}
            <div>
              <h4 className="font-black text-sm text-md-on-surface mb-4">قدرات المنظومة</h4>
              <ul className="space-y-3 text-xs font-medium">
                <li>فرز ومطابقة السير الذاتية بالذكاء الاصطناعي</li>
                <li>غرف مقابلات الفيديو والتفريغ النصي الفوري</li>
                <li>العروض الوظيفية الرقمية والتوقيع الإلكتروني</li>
                <li>تقييم الأداء الشامل 360° وإدارة المهام</li>
                <li>بوابة مخصصة ومستقلة لكل منشأة</li>
              </ul>
            </div>

            {/* Column 4: Contact & Access */}
            <div>
              <h4 className="font-black text-sm text-md-on-surface mb-4">إدارة الحساب</h4>
              <div className="space-y-3 text-xs font-medium">
                <Link
                  to="/auth?mode=login"
                  className="block text-md-primary font-bold hover:underline"
                >
                  دخول لوحة تحكم المنشأة ←
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="block text-md-on-surface hover:text-md-primary transition-colors"
                >
                  تسجيل منشأة جديدة
                </Link>
                <div className="pt-2 text-xs text-md-on-surface-variant">
                  الدعم الفني: tawzeefx@outlook.com
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-md-outline-variant/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium">
            <p>© {new Date().getFullYear()} Tawzeef-X. جميع الحقوق محفوظة لمنصة توظيف إكس.</p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="hover:text-md-primary transition-colors">سياسة الخصوصية</Link>
              <Link to="/terms" className="hover:text-md-primary transition-colors">الشروط والأحكام</Link>
            </div>
          </div>
        </div>
      </footer>

      <QuoteRequestDialog plan={quotePlan} onClose={() => setQuotePlan(null)} />
    </div>
  );
}
