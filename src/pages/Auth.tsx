import tawzeefLogo from "@/assets/tawzeef-x-logo.png";
import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import confetti from "canvas-confetti";
import { useNavigate, useSearchParams, Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, Loader2, Shield, Zap, BarChart3, FileCheck, Briefcase, Sparkles, Building2, CheckCircle2, KeyRound, Monitor, Check, Smartphone } from "lucide-react";
import { Icons8StyleIcon } from "@/components/ui/animated-icons";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/* ─── Device Trust Helpers ─── */
const TRUST_KEY = "tawzeef-x_trusted_device";
const TRUST_DAYS = 30;

function generateDeviceId(): string {
  const nav = window.navigator;
  const raw = [nav.userAgent, nav.language, screen.width, screen.height, new Date().getTimezoneOffset()].join("|");
  let hash = 0;
  for (let i = 0; i < raw.length; i++) { hash = ((hash << 5) - hash) + raw.charCodeAt(i); hash |= 0; }
  return Math.abs(hash).toString(36);
}

function isTrustedDevice(email: string): boolean {
  try {
    const data = JSON.parse(localStorage.getItem(TRUST_KEY) || "{}");
    const entry = data[email];
    if (!entry) return false;
    if (Date.now() > entry.expires) { delete data[email]; localStorage.setItem(TRUST_KEY, JSON.stringify(data)); return false; }
    return entry.deviceId === generateDeviceId();
  } catch { return false; }
}

function trustDevice(email: string) {
  try {
    const data = JSON.parse(localStorage.getItem(TRUST_KEY) || "{}");
    data[email] = { deviceId: generateDeviceId(), expires: Date.now() + TRUST_DAYS * 24 * 60 * 60 * 1000 };
    localStorage.setItem(TRUST_KEY, JSON.stringify(data));
  } catch {}
}
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useBrandSettings } from "@/hooks/useBrandSettings";
import { SEO } from "@/components/marketing/SEO";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { lovable } from "@/integrations/lovable/index";
import { translateAuthError } from "@/lib/authErrors";
import { logAuditEvent } from "@/hooks/useAuditLog";
import { checkPasswordStrength, isRateLimited, isValidEmail, sanitizeInput, detectSuspiciousInput } from "@/lib/security";

/* ─── Tawzeef-X System Native Atmosphere Background ─── */
const SystemAtmosphere = memo(function SystemAtmosphere() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Primary Brand Emerald Orb (Top-Right) */}
      <div
        className="absolute w-[680px] h-[680px] rounded-full will-change-transform opacity-75"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.09) 0%, hsl(var(--accent) / 0.04) 50%, transparent 70%)",
          top: "-15%",
          right: "-8%",
          filter: "blur(90px)",
          animation: "float-sphere-1 20s ease-in-out infinite",
        }}
      />
      {/* Brand Accent Teal Orb (Bottom-Left) */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full will-change-transform opacity-65"
        style={{
          background: "radial-gradient(circle, hsl(var(--accent) / 0.07) 0%, hsl(var(--primary) / 0.03) 50%, transparent 70%)",
          bottom: "-10%",
          left: "-8%",
          filter: "blur(100px)",
          animation: "float-sphere-2 24s ease-in-out infinite",
        }}
      />
      {/* Central Soft Ambient Glow */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full will-change-transform opacity-30"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.05) 0%, transparent 65%)",
          top: "30%",
          left: "35%",
          filter: "blur(80px)",
          animation: "spin-slow 60s linear infinite",
        }}
      />

      {/* Tawzeef-X System Subtle Mesh Dot Grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(var(--foreground)) 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px",
        }}
      />
    </div>
  );
});

/* ─── Google-Style Interactive AI Assistant Mascot ─── */
interface MascotProps {
  focusedField: string | null;
  showPassword?: boolean;
  isLoading?: boolean;
  onMascotClick?: () => void;
}

const AIMascot = memo(function AIMascot({ focusedField, showPassword = false, isLoading = false }: MascotProps) {
  const isPassword = focusedField === "password";
  const isEmailOrName = focusedField === "email" || focusedField === "name" || focusedField === "companyName";

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-1">
      {/* Floating Mascot Head Wrapper */}
      <motion.div
        animate={{
          y: isPassword ? [0, 2, 0] : [0, -5, 0],
          rotate: isPassword ? 0 : [0, 1.5, -1.5, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: isPassword ? 2 : 4,
          ease: "easeInOut",
        }}
        className="relative w-20 h-16 flex items-center justify-center cursor-pointer group"
      >
        {/* Ambient Halo behind head */}
        <div
          className={`absolute inset-0 rounded-full filter blur-md transition-all duration-500 ${
            isLoading
              ? "bg-amber-400/40 scale-125 animate-pulse"
              : isPassword
              ? "bg-purple-500/20 scale-105"
              : isEmailOrName
              ? "bg-emerald-500/30 scale-110"
              : "bg-emerald-500/15 scale-95 group-hover:scale-110"
          }`}
        />

        {/* Head Base */}
        <div className="relative w-16 h-13 rounded-[22px] bg-gradient-to-b from-white to-slate-50 border-2 border-emerald-500/30 shadow-[0_8px_20px_rgba(16,185,129,0.15)] flex flex-col items-center justify-center p-1.5 overflow-hidden transition-colors duration-300">
          
          {/* Top Antenna Spark */}
          <div className="absolute -top-1.5 w-2.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />

          {/* Screen Visor / Face Area */}
          <div className="w-full h-8 rounded-[14px] bg-slate-900 flex items-center justify-center px-2 relative overflow-hidden shadow-inner">
            
            {/* Soft scanline reflection */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

            {/* Normal / Looking Eyes */}
            {!isPassword && (
              <div className="flex items-center justify-center gap-2.5 w-full">
                {/* Left Eye */}
                <motion.div
                  animate={{
                    scaleY: [1, 1, 0.1, 1],
                    y: isEmailOrName ? 2.5 : 0,
                    x: isEmailOrName ? 1 : 0,
                  }}
                  transition={{
                    scaleY: { repeat: Infinity, repeatDelay: 3.5, duration: 0.2 },
                    y: { duration: 0.25 },
                    x: { duration: 0.25 },
                  }}
                  className={`rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981] ${
                    isEmailOrName ? "w-2.5 h-2.5" : "w-2 h-2.5"
                  }`}
                />
                {/* Right Eye */}
                <motion.div
                  animate={{
                    scaleY: [1, 1, 0.1, 1],
                    y: isEmailOrName ? 2.5 : 0,
                    x: isEmailOrName ? 1 : 0,
                  }}
                  transition={{
                    scaleY: { repeat: Infinity, repeatDelay: 3.5, duration: 0.2 },
                    y: { duration: 0.25 },
                    x: { duration: 0.25 },
                  }}
                  className={`rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981] ${
                    isEmailOrName ? "w-2.5 h-2.5" : "w-2 h-2.5"
                  }`}
                />
              </div>
            )}

            {/* Password Covered / Peeking Eyes */}
            {isPassword && (
              <div className="flex items-center justify-center gap-2 w-full">
                {showPassword ? (
                  /* Peeking One Eye Mode */
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]"
                    />
                    <div className="w-2.5 h-0.5 rounded-full bg-slate-600" />
                  </>
                ) : (
                  /* Both Eyes Closed Shyly `( ˘ ◡ ˘ )` */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 text-emerald-400 font-black text-[9px] tracking-widest"
                  >
                    <span>✦</span>
                    <span className="text-[7px] text-emerald-300/80">🔒</span>
                    <span>✦</span>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Hands covering eyes when in password mode */}
          <AnimatePresence>
            {isPassword && !showPassword && (
              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 15, opacity: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="absolute inset-x-2 bottom-1 flex justify-between z-20"
              >
                {/* Left Paw */}
                <div className="w-3.5 h-3.5 rounded-full bg-white border border-emerald-400 shadow-sm flex items-center justify-center text-[7px]">
                  ✋
                </div>
                {/* Right Paw */}
                <div className="w-3.5 h-3.5 rounded-full bg-white border border-emerald-400 shadow-sm flex items-center justify-center text-[7px]">
                  🤚
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Mini Badge */}
        <div className="absolute -bottom-1 px-1.5 py-0.5 rounded-full bg-white/90 border border-emerald-200 shadow-xs flex items-center gap-1 text-[8px] font-black text-emerald-700">
          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
          <span>{isPassword ? "حماية 🔐" : isEmailOrName ? "يكتب... ✍️" : "مساعد ذكي ✨"}</span>
        </div>
      </motion.div>
    </div>
  );
});

/* ─── Real Tawzeef-X Interactive System Showcase ─── */
const TawzeefXSystemShowcase = memo(function TawzeefXSystemShowcase() {
  const [activeFeatureTab, setActiveFeatureTab] = useState<"pipeline" | "ai_matcher" | "interviews">("pipeline");
  const [cvScore, setCvScore] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeatureTab((curr) => {
        if (curr === "pipeline") return "ai_matcher";
        if (curr === "ai_matcher") return "interviews";
        return "pipeline";
      });
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let frame: number;
    let start = performance.now();
    const duration = 1500;
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCvScore(Math.round(96 * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [activeFeatureTab]);

  return (
    <div className="w-full max-w-[480px] mx-auto rounded-[24px] bg-white border border-slate-200/80 shadow-[0_20px_50px_rgba(15,23,42,0.06)] p-5 relative overflow-hidden select-none text-right">
      {/* Top Emerald Brand Header Bar */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <span className="text-xs font-black text-slate-800">نظام توظيف إكس الذكي</span>
            <span className="text-[10px] text-emerald-600 font-bold mr-1.5">(عرض حي مباشر)</span>
          </div>
        </div>
        
        {/* Interactive Feature Mini Tabs */}
        <div className="flex items-center bg-slate-100/80 p-1 rounded-xl gap-1 text-[10px] font-bold">
          <button
            onClick={() => setActiveFeatureTab("pipeline")}
            className={`px-2.5 py-1 rounded-lg transition-all duration-200 ${
              activeFeatureTab === "pipeline"
                ? "bg-white text-emerald-700 shadow-xs font-black"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            المراحل
          </button>
          <button
            onClick={() => setActiveFeatureTab("ai_matcher")}
            className={`px-2.5 py-1 rounded-lg transition-all duration-200 ${
              activeFeatureTab === "ai_matcher"
                ? "bg-white text-emerald-700 shadow-xs font-black"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            تحليل AI
          </button>
          <button
            onClick={() => setActiveFeatureTab("interviews")}
            className={`px-2.5 py-1 rounded-lg transition-all duration-200 ${
              activeFeatureTab === "interviews"
                ? "bg-white text-emerald-700 shadow-xs font-black"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            المقابلات
          </button>
        </div>
      </div>

      {/* Tab 1: Pipeline Kanban Simulation */}
      {activeFeatureTab === "pipeline" && (
        <motion.div
          key="pipeline"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-3"
        >
          <div className="grid grid-cols-3 gap-2">
            {/* Stage 1: طلب جديد */}
            <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/60 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black text-slate-700">
                <span>طلبات جديدة</span>
                <span className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[9px]">4</span>
              </div>
              <div className="bg-white rounded-lg p-2 border border-slate-100 shadow-xs space-y-1">
                <p className="text-[10px] font-bold text-slate-800">أحمد الشمري</p>
                <p className="text-[8px] text-slate-400">معلم لغة عربية</p>
                <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[7.5px] font-bold">
                  جديد ✦
                </span>
              </div>
            </div>

            {/* Stage 2: فحص ومطابقة AI */}
            <div className="bg-emerald-50/50 rounded-xl p-2.5 border border-emerald-200/60 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black text-emerald-800">
                <span>مطابقة الـ AI</span>
                <span className="w-4 h-4 rounded-full bg-emerald-200 flex items-center justify-center text-[9px] text-emerald-800 font-bold">2</span>
              </div>
              <div className="bg-white rounded-lg p-2 border border-emerald-200 shadow-xs space-y-1 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-800">سارة المنصور</p>
                  <span className="text-[9px] font-black text-emerald-600">96%</span>
                </div>
                <p className="text-[8px] text-slate-400">مشرفة أكاديمية</p>
                <div className="w-full h-1 rounded-full bg-slate-100 overflow-hidden">
                  <div className="w-[96%] h-full bg-emerald-500 rounded-full" />
                </div>
              </div>
            </div>

            {/* Stage 3: تم القبول */}
            <div className="bg-cyan-50/50 rounded-xl p-2.5 border border-cyan-200/60 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black text-cyan-800">
                <span>عرض وظيفي</span>
                <span className="w-4 h-4 rounded-full bg-cyan-200 flex items-center justify-center text-[9px] text-cyan-800 font-bold">1</span>
              </div>
              <div className="bg-white rounded-lg p-2 border border-cyan-200 shadow-xs space-y-1">
                <p className="text-[10px] font-black text-slate-800">خالد العمري</p>
                <p className="text-[8px] text-slate-400">مطور Full-Stack</p>
                <span className="inline-flex items-center gap-1 text-[7.5px] font-bold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded">
                  <CheckCircle2 className="w-2.5 h-2.5 text-cyan-600" />
                  تم التوقيع
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 2: AI Matcher Simulation */}
      {activeFeatureTab === "ai_matcher" && (
        <motion.div
          key="ai_matcher"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-3"
        >
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8 border border-white shadow-xs">
                  <AvatarFallback className="bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold text-xs">م ع</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-xs font-black text-slate-800">محمد عبدالله</h4>
                  <p className="text-[9px] text-slate-500 font-medium">متقدم لوظيفة: رئيس قسم تقنية المعلومات</p>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs">
                {cvScore}% تطابق ذكي
              </div>
            </div>

            {/* Criteria Progress */}
            <div className="space-y-1.5 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-slate-600">
                  <span>الخبرات والقيادة التربوية</span>
                  <span>98%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[98%]" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-slate-600">
                  <span>المؤهلات الأكاديمية والشهادات</span>
                  <span>94%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full w-[94%]" />
                </div>
              </div>
            </div>

            {/* AI Recommendation Quote */}
            <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200/60 flex items-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-[9px] text-emerald-900 leading-relaxed font-medium">
                <strong>توصية AI:</strong> المرشح يمتلك خبرة 8 سنوات مطابقة بدقة لمتطلبات المنصب. نوصي بجدولة مقابلة فنية.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 3: Interviews Simulation */}
      {activeFeatureTab === "interviews" && (
        <motion.div
          key="interviews"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-2.5"
        >
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-700">مقابلات اليوم المجدولة (Online)</span>
              <Badge variant="outline" className="text-[8.5px] bg-white border-emerald-200 text-emerald-700 font-bold">
                غرفة فيديو مدمجة 📹
              </Badge>
            </div>

            <div className="bg-white rounded-lg p-2.5 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  10:30
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-800">مقابلة تقييم: أ. ريم القحطاني</p>
                  <p className="text-[8px] text-slate-400">لجنة التوظيف المتقدمة</p>
                </div>
              </div>
              <Button size="sm" className="h-6 px-2 text-[8px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md">
                انضمام
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Bottom KPI Bar */}
      <div className="pt-3 border-t border-slate-100 grid grid-cols-4 gap-2 text-center mt-3">
        <div>
          <span className="text-base font-black text-slate-800 block">1,250+</span>
          <span className="text-[8px] font-bold text-slate-400">وظيفة نشطة</span>
        </div>
        <div>
          <span className="text-base font-black text-emerald-600 block">98%</span>
          <span className="text-[8px] font-bold text-slate-400">دقة الـ AI</span>
        </div>
        <div>
          <span className="text-base font-black text-teal-600 block">3X</span>
          <span className="text-[8px] font-bold text-slate-400">أسرع توظيفاً</span>
        </div>
        <div>
          <span className="text-base font-black text-slate-800 block">4.9 ★</span>
          <span className="text-[8px] font-bold text-slate-400">تقييم المنصة</span>
        </div>
      </div>
    </div>
  );
});

/* ─── Right Branding Panel (Tawzeef-X Authentic Showcase) ─── */
const BrandingPanel = memo(function BrandingPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between h-full relative overflow-hidden p-12 select-none">
      {/* Clean System Background using theme tokens */}
      <div
        className="absolute inset-0 bg-background"
        style={{
          background: "radial-gradient(circle at 100% 0%, hsl(var(--primary) / 0.05) 0%, hsl(var(--background)) 60%, hsl(var(--secondary) / 0.4) 100%)",
        }}
      />

      {/* Subtle Dot Grid */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #0f172a 1.2px, transparent 1.2px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Header Info */}
      <div className="relative z-10 space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-emerald-500/20 bg-white shadow-sm p-2">
            <img src={tawzeefLogo} alt="Tawzeef-X" className="w-8 h-8 object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-wide leading-tight text-slate-800">Tawzeef-X</span>
            <span className="text-[9.5px] font-bold tracking-[0.18em] text-emerald-600 uppercase">المنصة الذكية لإدارة التوظيف</span>
          </div>
        </div>

        {/* Title & Pitch */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-50/80">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="text-xs font-bold text-emerald-800">منصة التوظيف وتقييم الكفاءات #1</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-black text-slate-800 leading-tight">
            أتمتة رحلة التوظيف بالكامل <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              بدقة وذكاء استثنائي
            </span>
          </h2>

          <p className="text-xs leading-relaxed text-slate-500 max-w-[420px]">
            من نشر الوظائف وتحديد المواصفات التعليمية والمهنية، إلى الفرز التلقائي والمقابلات المدمجة والعروض الوظيفية الرقمية.
          </p>
        </div>
      </div>

      {/* Live System Showcase Widget */}
      <div className="relative z-10 my-4">
        <TawzeefXSystemShowcase />
      </div>

      {/* Footer Trust Note */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-semibold text-slate-400 pt-3 border-t border-slate-200/60">
        <span>🔒 بيانات مشفرة وعزل تام بين الشركات</span>
        <span>⚡ متوافق مع كافة المعايير المهنية</span>
      </div>
    </div>
  );
});

/* ─── Social Buttons ─── */
const SocialButtons = memo(function SocialButtons() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleOAuth = async (provider: "google" | "apple" | "azure") => {
    setLoadingProvider(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider === "azure" ? "azure" : (provider as any),
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) {
        const { error: lovableErr } = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
        if (lovableErr) toast({ title: "خطأ", description: lovableErr.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "خطأ في تسجيل الدخول", description: err.message, variant: "destructive" });
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="transition-all duration-200 hover:scale-[1.015] active:scale-[0.985]">
        <Button
          type="button"
          variant="outline"
          disabled={!!loadingProvider}
          className="w-full h-11 rounded-xl text-xs font-bold gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-all duration-300 px-1"
          onClick={() => handleOAuth("google")}
        >
          {loadingProvider === "google" ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          Google
        </Button>
      </div>

      <div className="transition-all duration-200 hover:scale-[1.015] active:scale-[0.985]">
        <Button
          type="button"
          variant="outline"
          disabled={!!loadingProvider}
          className="w-full h-11 rounded-xl text-xs font-bold gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-all duration-300 px-1"
          onClick={() => handleOAuth("apple")}
        >
          {loadingProvider === "apple" ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          ) : (
            <svg className="w-4 h-4 text-slate-700" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
          )}
          Apple
        </Button>
      </div>

      <div className="transition-all duration-200 hover:scale-[1.015] active:scale-[0.985]">
        <Button
          type="button"
          variant="outline"
          disabled={!!loadingProvider}
          className="w-full h-11 rounded-xl text-xs font-bold gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-all duration-300 px-1"
          onClick={() => handleOAuth("azure")}
        >
          {loadingProvider === "azure" ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 23 23">
              <path fill="#F25022" d="M1 1h10v10H1z" />
              <path fill="#7FBA00" d="M12 1h10v10H12z" />
              <path fill="#00A4EF" d="M1 12h10v10H1z" />
              <path fill="#FFB900" d="M12 12h10v10H12z" />
            </svg>
          )}
          Microsoft
        </Button>
      </div>
    </div>
  );
});

/* ─── Tenant Status Validation Gatekeeper ─── */
export async function checkCompanyStatus(user: any): Promise<{ allowed: boolean; reason?: string; isAgency?: boolean }> {
  try {
    // Single server-side source of truth: validate_tenant_status RPC
    const { data, error } = await supabase.rpc("validate_tenant_status");
    if (error) {
      console.error("Server-side tenant validation RPC error:", error);
      // FAIL CLOSED: Never allow login on security validation error
      return {
        allowed: false,
        reason: "فشل التحقق الأمني من حالة الحساب والمنظمة. يرجى المحاولة لاحقاً أو التواصل مع الدعم الفني.",
      };
    }

    const res = data as any;
    if (!res || res.access_state !== "ALLOWED") {
      const reasonMap: Record<string, string> = {
        COMPANY_SUSPENDED: "تم إيقاف حساب الشركة مؤقتاً من قِبل إدارة المنصة. يرجى التواصل مع إدارة Tawzeef-X.",
        COMPANY_INACTIVE: "تم تعطيل حساب الشركة. يرجى التواصل مع مسؤول النظام.",
        COMPANY_DELETING: "حساب الشركة قيد الحذف النهائي ولا يمكن الوصول إليه.",
        COMPANY_DELETED: "تم حذف حساب هذه الشركة نهائياً من منصة Tawzeef-X، ولا يمكن تسجيل الدخول بهذا الحساب.",
        COMPANY_DELETE_FAILED: "حساب الشركة غير متاح حالياً بسبب إجراءات صيانة أمنية.",
        COMPANY_BLOCKED: "تم حظر حساب الشركة. يرجى مراجعة إدارة Tawzeef-X.",
        COMPANY_NOT_FOUND: "لم يتم العثور على المنظمة التابع لها هذا الحساب أو تم حذفها نهائياً.",
        NO_COMPANY_MEMBERSHIP: "تم حذف حساب الشركة نهائياً من منصة Tawzeef-X، ولم يعد هذا الحساب مرتبطاً بأي منظمة نشطة.",
        NOT_COMPANY_MEMBER: "هذا الحساب غير مخول بالوصول إلى الشركة المحددة.",
        UNAUTHENTICATED: "جلسة المستخدم غير صالحة.",
      };

      const denialReason = (res?.denial_reason as string) || "";
      const message = reasonMap[denialReason] || "تم رفض تسجيل الدخول بناءً على سياسات التحقق الأمني للشركات.";

      return {
        allowed: false,
        reason: message,
      };
    }

    return { allowed: true, isAgency: res.is_agency === true };
  } catch (err) {
    console.error("Critical error during server-side tenant validation (fail-closed):", err);
    // FAIL CLOSED: Strictly deny on unexpected exceptions
    return {
      allowed: false,
      reason: "حدث خطأ أمني غير متوقع أثناء التحقق من حالة الحساب. تم رفض الدخول لحماية البيانات.",
    };
  }
}

export const validateTenantLoginStatus = checkCompanyStatus;

/* ─── Auth form ─── */
const AuthForm = memo(function AuthForm({ isLogin, setIsLogin, setPendingOtp }: { isLogin: boolean; setIsLogin: (v: boolean) => void; setPendingOtp: (v: boolean) => void }) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [emailConfirmation, setEmailConfirmation] = useState<string | null>(null);
  const [otpStep, setOtpStep] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpShake, setOtpShake] = useState(false);
  const [pendingPassword, setPendingPassword] = useState("");
  const [rememberDevice, setRememberDevice] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [accountType, setAccountType] = useState<"company" | "job_seeker">("company");
  const [searchParams] = useSearchParams();
  const inviteEmail = searchParams.get("email") || "";
  const [form, setForm] = useState({ email: inviteEmail, password: "", fullName: "", companyName: "" });
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown > 0) {
      countdownRef.current = setInterval(() => setCountdown(c => { if (c <= 1) { clearInterval(countdownRef.current!); return 0; } return c - 1; }), 1000);
      return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
    }
  }, [countdown > 0]);

  const requestLoginOtp = useCallback(async (email: string) => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/request-login-otp`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    const data = await res.json();
    if (!res.ok || data?.error) throw new Error(data?.error || "فشل إرسال رمز التحقق");
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const normalizedEmail = form.email.trim().toLowerCase();

      if (!isValidEmail(normalizedEmail)) {
        toast({ title: "خطأ", description: "يرجى إدخال بريد إلكتروني صحيح", variant: "destructive" });
        setLoading(false);
        return;
      }

      if (detectSuspiciousInput(form.email) || detectSuspiciousInput(form.fullName || "") || detectSuspiciousInput(form.companyName || "")) {
        toast({ title: "خطأ", description: "تم رصد محتوى غير آمن في المدخلات", variant: "destructive" });
        setLoading(false);
        return;
      }

      if (isRateLimited(`auth_${normalizedEmail}`, 5, 5 * 60 * 1000)) {
        toast({ title: "تجاوزت الحد المسموح ⛔", description: "يرجى الانتظار عدة دقائق قبل المحاولة مجدداً", variant: "destructive" });
        setLoading(false);
        return;
      }

      if (!isLogin && checkPasswordStrength(form.password).score < 2) {
        toast({ title: "كلمة المرور ضعيفة", description: "يرجى اختيار كلمة مرور أقوى (8 أحرف على الأقل مع رموز وأرقام)", variant: "destructive" });
        setLoading(false);
        return;
      }

      if (isLogin) {
        setPendingOtp(true);
        setPendingPassword(form.password);
        let { data: loginData, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password: form.password });

        if (error) { setPendingOtp(false); logAuditEvent({ eventType: "login.failed", userEmail: normalizedEmail, details: { reason: error.message } }); throw error; }

        // Tenant Company Status & Existence Gatekeeper
        const loginUser = loginData.session?.user || loginData.user;
        const tenantCheck = await validateTenantLoginStatus(loginUser);
        if (!tenantCheck.allowed) {
          await supabase.auth.signOut();
          try {
            localStorage.removeItem("tx_active_company_id");
            localStorage.removeItem("tawzeef-x_trusted_device");
            sessionStorage.removeItem("tx_welcome_video_viewed");
            sessionStorage.removeItem("tx_show_welcome_video");
          } catch {}
          setPendingPassword("");
          setPendingOtp(false);
          setLoading(false);
          toast({
            title: "تم رفض تسجيل الدخول ⛔",
            description: tenantCheck.reason,
            variant: "destructive",
          });
          logAuditEvent({
            eventType: "login.failed",
            userEmail: normalizedEmail,
            details: { reason: tenantCheck.reason, company_blocked: true },
          });
          return;
        }

        const userRole = loginData.session?.user?.user_metadata?.role || loginData.session?.user?.user_metadata?.account_type;

        // Direct Instant Login (OTP Bypassed for instant seamless access)
        setPendingPassword("");
        setPendingOtp(false);
        try {
          sessionStorage.setItem("tx_show_welcome_video", "true");
        } catch {}
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ["#10b981", "#06b6d4", "#f59e0b"] });
        toast({ title: "تم تسجيل الدخول بنجاح ✅", description: userRole === "candidate" ? "مرحباً بك في بوابة المتقدمين" : "مرحباً بك في منصة Tawzeef-X" });
        logAuditEvent({ eventType: "login.success", userId: loginData.user?.id, userEmail: normalizedEmail, details: { method: "direct_login_instant" } });
        navigate(tenantCheck.isAgency ? "/agency" : userRole === "candidate" ? "/portal" : userRole === "job_seeker" ? "/seeker-dashboard" : "/dashboard");
        return;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: form.email, password: form.password,
          options: { data: { full_name: form.fullName, account_type: accountType, company_name: accountType === "company" ? form.companyName : "" }, emailRedirectTo: `${window.location.origin}/onboarding` },
        });
        if (error) throw error;
        if (data.user) {
          supabase.functions.invoke("send-welcome-email", {
            body: { email: form.email, fullName: form.fullName, accountType },
          }).catch(console.error);

          confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 }, colors: ["#10b981", "#06b6d4", "#f59e0b", "#ef4444", "#8b5cf6"] });
          setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { y: 0.5, x: 0.3 } }), 300);
          setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { y: 0.5, x: 0.7 } }), 500);
          toast({ title: "مرحباً بك! 🎉", description: "تم إنشاء حسابك بنجاح — تحقق من بريدك الإلكتروني" });
          navigate("/onboarding");
        }
      }
    } catch (error: any) {
      setPendingPassword("");
      setPendingOtp(false);
      toast({ title: "خطأ", description: translateAuthError(error.message), variant: "destructive" });
    } finally { setLoading(false); }
  }, [isLogin, form, navigate, accountType, requestLoginOtp, setPendingOtp]);

  const handleVerifyOtp = useCallback(async () => {
    if (otpCode.length < 6) {
      toast({ title: "يرجى إدخال الرمز المكون من 6 أرقام", variant: "destructive" });
      return;
    }

    if (!pendingPassword) {
      toast({ title: "انتهت جلسة التحقق", description: "يرجى تسجيل الدخول مرة أخرى", variant: "destructive" });
      setOtpStep(false);
      setPendingOtp(false);
      return;
    }

    setOtpLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-login-otp", {
        body: { email: otpEmail, code: otpCode },
      });

      if (error) throw error;
      if (!data?.success) {
        throw new Error(data?.error || "تعذر التحقق من الرمز");
      }

      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: otpEmail,
        password: pendingPassword,
      });
      if (loginError) throw loginError;

      // Tenant Company Status & Existence Gatekeeper
      const loginUser = loginData.session?.user || loginData.user;
      const tenantCheck = await validateTenantLoginStatus(loginUser);
      if (!tenantCheck.allowed) {
        await supabase.auth.signOut();
        try {
          localStorage.removeItem("tx_active_company_id");
          localStorage.removeItem("tawzeef-x_trusted_device");
          sessionStorage.removeItem("tx_welcome_video_viewed");
          sessionStorage.removeItem("tx_show_welcome_video");
        } catch {}
        setPendingPassword("");
        setPendingOtp(false);
        setOtpLoading(false);
        setOtpStep(false);
        toast({
          title: "تم رفض تسجيل الدخول ⛔",
          description: tenantCheck.reason,
          variant: "destructive",
        });
        return;
      }

      if (rememberDevice) trustDevice(otpEmail);
      setPendingPassword("");
      setPendingOtp(false);
      try {
        sessionStorage.setItem("tx_show_welcome_video", "true");
      } catch {}
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ["#10b981", "#06b6d4", "#f59e0b"] });
      toast({ title: "تم التحقق بنجاح ✅" });
      const accountType = loginData.session?.user?.user_metadata?.account_type;
      navigate(tenantCheck.isAgency ? "/agency" : accountType === "job_seeker" ? "/seeker-dashboard" : "/dashboard");
    } catch (error: any) {
      setOtpShake(true);
      setTimeout(() => setOtpShake(false), 600);
      toast({ title: "خطأ", description: translateAuthError(error.message), variant: "destructive" });
    } finally { setOtpLoading(false); }
  }, [otpCode, pendingPassword, otpEmail, rememberDevice, navigate, setPendingOtp]);

  const handleResendOtp = useCallback(async () => {
    if (countdown > 0) return;

    if (!pendingPassword) {
      toast({ title: "انتهت جلسة التحقق", description: "يرجى تسجيل الدخول مرة أخرى", variant: "destructive" });
      setOtpStep(false);
      setPendingOtp(false);
      return;
    }

    setOtpLoading(true);
    try {
      await requestLoginOtp(otpEmail);
      setCountdown(60);
      toast({ title: "تم إعادة إرسال الرمز ✉️", description: "تحقق من آخر رسالة في بريدك الإلكتروني" });
    } catch (error: any) {
      toast({ title: "خطأ", description: translateAuthError(error.message), variant: "destructive" });
    } finally { setOtpLoading(false); }
  }, [countdown, otpEmail, pendingPassword, requestLoginOtp, setPendingOtp]);

  const focused = (field: string) => focusedField === field;

  const inputClass = (field: string) =>
    `h-[50px] pr-11 rounded-2xl text-[14px] font-medium transition-all duration-300 border focus-visible:ring-0 focus-visible:ring-offset-0 ${
      focused(field)
        ? "bg-white border-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)] text-slate-900"
        : "bg-slate-50/70 border-slate-200/90 hover:border-slate-300 hover:bg-white text-slate-800 placeholder:text-slate-400"
    }`;

  const iconClass = (field: string) =>
    `absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 transition-all duration-300 ${
      focused(field) ? "text-emerald-600 scale-110" : "text-slate-400"
    }`;

  return (
    <div className="w-full max-w-[460px] mx-auto px-2 sm:px-4 select-none">

      {/* Styled Google Material 3 Elevated Card */}
      <div className="relative rounded-[28px] bg-white/95 backdrop-blur-2xl border border-slate-200/80 shadow-[0_20px_50px_rgba(16,185,129,0.07)] p-6 sm:p-8 space-y-6 overflow-hidden">
        
        {/* Top Gemini Gradient Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
        
        {emailConfirmation ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 space-y-6"
          >
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
              className="flex items-center justify-center mx-auto"
              style={{ width: 72, height: 72, borderRadius: "20px", background: "linear-gradient(135deg, hsl(var(--accent) / 0.1), hsl(var(--primary) / 0.05))" }}
            >
              <CheckCircle2 className="w-9 h-9 text-accent animate-pulse" />
            </motion.div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-foreground">
                تأكيد البريد الإلكتروني ✉️
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-[320px] mx-auto">
                أرسلنا رابط تأكيد الحساب للبريد التالي. يرجى تفقده لإتمام عملية التسجيل:
              </p>
              <p className="font-bold text-foreground text-sm tracking-wide" dir="ltr">{emailConfirmation}</p>
            </div>

            <Button
              variant="outline"
              onClick={() => { setEmailConfirmation(null); setIsLogin(true); }}
              className="rounded-xl h-11 px-8 text-xs font-bold"
            >
              العودة لتسجيل الدخول
            </Button>
          </motion.div>
        ) : otpStep ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4 space-y-6"
          >
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
              className="flex items-center justify-center mx-auto"
              style={{ width: 72, height: 72, borderRadius: "20px", background: "linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.05))" }}
            >
              <KeyRound className="w-9 h-9 text-primary" />
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-foreground">
                التحقق الثنائي 🔐
              </h2>
              <p className="text-muted-foreground text-sm max-w-[320px] mx-auto">
                أرسلنا رمز تحقق مؤقت مكون من 6 أرقام إلى بريدك الإلكتروني:
              </p>
              <p className="font-bold text-foreground text-sm" dir="ltr">{otpEmail}</p>
            </div>
            
            <div className={`max-w-[280px] mx-auto ${otpShake ? "animate-shake" : ""}`}>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className={`text-center text-[28px] font-bold tracking-[0.5em] h-[52px] rounded-xl border-2 focus-visible:ring-0 transition-colors duration-300 ${
                  otpShake
                    ? "border-destructive bg-destructive/5 focus-visible:border-destructive text-destructive"
                    : "border-border focus-visible:border-primary/50 text-foreground"
                }`}
                style={{ fontFamily: "monospace" }}
                dir="ltr"
                autoFocus
              />
            </div>

            <div className="space-y-4">
              <div className="transition-all duration-200 hover:scale-[1.015] active:scale-[0.985]">
                <Button
                  onClick={handleVerifyOtp}
                  disabled={otpLoading || otpCode.length < 6}
                  className="w-full h-11 rounded-xl text-xs font-bold text-primary-foreground shadow-lg hover:shadow-primary/20 transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
                  }}
                >
                  {otpLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري التحقق...
                    </span>
                  ) : "تأكيد الرمز ودخول"}
                </Button>
              </div>

              {/* Remember device checkbox */}
              <div className="flex items-center justify-center gap-2">
                <Checkbox
                  id="remember-device"
                  checked={rememberDevice}
                  onCheckedChange={(v) => setRememberDevice(!!v)}
                  className="border-border rounded"
                />
                <label
                  htmlFor="remember-device"
                  className="text-xs text-muted-foreground font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <Monitor className="w-3.5 h-3.5 text-muted-foreground/60" />
                  تذكر هذا الجهاز لمدة 30 يوماً
                </label>
              </div>
            </div>

            <div className="border-t border-border/40 pt-4 flex items-center justify-center gap-4">
              {countdown > 0 ? (
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                  <span>إعادة الإرسال بعد {countdown} ثانية</span>
                </div>
              ) : (
                <button
                  onClick={handleResendOtp}
                  disabled={otpLoading}
                  className="text-xs text-primary hover:text-primary-foreground hover:bg-primary/10 transition-colors font-bold px-3 py-1.5 rounded-lg"
                >
                  إعادة إرسال الرمز ✉️
                </button>
              )}
              <span className="text-muted-foreground/20">|</span>
              <button
                onClick={() => { setOtpStep(false); setOtpCode(""); setOtpEmail(""); setPendingPassword(""); setCountdown(0); setPendingOtp(false); }}
                className="text-xs text-muted-foreground hover:text-foreground font-bold px-2 py-1"
              >
                العودة
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {/* Top Brand Logo & Animated Interactive Google-Style Mascot */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center overflow-hidden p-2 bg-gradient-to-tr from-emerald-50 to-cyan-50 border border-emerald-500/20 shadow-xs">
                  <img src={tawzeefLogo} alt="Tawzeef-X" className="w-7 h-7 object-contain" />
                </div>
                <div>
                  <h1 className="text-base font-black text-slate-800 leading-tight">Tawzeef-X</h1>
                  <p className="text-[8.5px] font-bold tracking-[0.18em] text-emerald-600 uppercase">منصة التوظيف الذكية</p>
                </div>
              </div>

              {/* Interactive Mascot */}
              <div className="shrink-0">
                <AIMascot focusedField={focusedField} showPassword={showPassword} isLoading={loading} />
              </div>
            </div>

            {/* Back link */}
            <div className="hidden lg:block">
              <a href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-all duration-300 font-medium group">
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-300" />
                <span>العودة للرئيسية</span>
              </a>
            </div>

            {/* Header */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "login-header" : "signup-header"}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.3 }}
                className="space-y-1 text-right"
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-50 text-emerald-700 mb-1">
                  <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" />
                  <span className="text-[10px] font-bold tracking-wide">
                    {searchParams.get("role") === "candidate" ? "بوابة المتقدمين للوظائف" : isLogin ? "مرحباً بعودتك" : "انضم للمنصة الأذكى"}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                  {searchParams.get("role") === "candidate" ? "تسجيل دخول المتقدمين" : isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}
                </h2>
                <p className="text-slate-500 text-xs leading-normal">
                  {searchParams.get("role") === "candidate" 
                    ? "أدخل بريدك الإلكتروني ورقم جوالك ككلمة مرور لمتابعة طلبك"
                    : isLogin 
                    ? "أدخل بريدك الإلكتروني وكلمة المرور للوصول لحسابك" 
                    : "ابدأ رحلتك في التوظيف الذكي وتتبع المرشحين"}
                </p>
                {searchParams.get("role") === "candidate" && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-right space-y-1 my-2">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      <User className="w-4 h-4" />
                      <span>حساب متقدم مُنشأ تلقائياً 👤✨</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      كلمة المرور الخاصة بك هي <strong className="text-foreground">رقم الجوال</strong> الذي أدخلته عند تقديم الطلب.
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Form */}
            <AnimatePresence mode="wait">
              <motion.form
                key={isLogin ? "login" : "signup"}
                initial={{ opacity: 0, x: isLogin ? -15 : 15, filter: "blur(2px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: isLogin ? 15 : -15, filter: "blur(2px)" }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {!isLogin && (
                  <div className="space-y-4">
                    {/* Account Type Toggle */}
                    <div className="space-y-1.5 text-right">
                      <label className="text-xs font-semibold text-slate-600 tracking-wide block">
                        نوع الحساب
                      </label>
                      <div className="flex bg-muted/40 rounded-xl p-1 border border-border/30 relative h-[42px] select-none">
                        <div
                          className="absolute inset-y-1 rounded-lg bg-card shadow-sm border border-border/40 transition-all duration-300 ease-out"
                          style={{
                            width: "calc(50% - 4px)",
                            right: accountType === "company" ? "4px" : "calc(50% + 2px)",
                            left: accountType === "company" ? "calc(50% + 2px)" : "4px"
                          }}
                        />
                        {[
                          { type: "company" as const, icon: <Building2 className="w-3.5 h-3.5" />, label: "جهة توظيف / HR" },
                          { type: "job_seeker" as const, icon: <User className="w-3.5 h-3.5" />, label: "باحث عن عمل" },
                        ].map((opt) => (
                          <button
                            key={opt.type}
                            type="button"
                            onClick={() => setAccountType(opt.type)}
                            className={`flex-1 py-1 rounded-lg text-xs font-bold transition-colors duration-300 flex items-center justify-center gap-1.5 relative z-10 ${
                              accountType === opt.type ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {opt.icon}
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-1.5 text-right">
                      <label htmlFor="auth-fullname" className="text-xs font-semibold text-slate-600 tracking-wide block cursor-pointer">
                        الاسم الكامل
                      </label>
                      <div className="relative">
                        <User className={iconClass("name")} />
                        <Input
                          id="auth-fullname"
                          name="fullName"
                          aria-label="الاسم الكامل"
                          value={form.fullName}
                          onChange={e => setForm({ ...form, fullName: e.target.value })}
                          onFocus={() => setFocusedField("name")}
                          onBlur={() => setFocusedField(null)}
                          placeholder="أدخل الاسم الثنائي أو الثلاثي"
                          className={inputClass("name")}
                          required
                        />
                      </div>
                    </div>

                    {/* Company Name (only for company accounts) */}
                    {accountType === "company" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-1.5 text-right"
                      >
                        <label htmlFor="auth-company" className="text-xs font-semibold text-slate-600 tracking-wide block cursor-pointer">
                          اسم الشركة / المؤسسة
                        </label>
                        <div className="relative">
                          <Building2 className={iconClass("companyName")} />
                          <Input
                            id="auth-company"
                            name="companyName"
                            aria-label="اسم الشركة أو المؤسسة"
                            value={form.companyName}
                            onChange={e => setForm({ ...form, companyName: e.target.value })}
                            onFocus={() => setFocusedField("companyName")}
                            onBlur={() => setFocusedField(null)}
                            placeholder="مثال: شركة الحلول الذكية"
                            className={inputClass("companyName")}
                            required
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Email */}
                <div className="space-y-1.5 text-right">
                  <label htmlFor="auth-email" className="text-xs font-semibold text-slate-600 tracking-wide block cursor-pointer">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <Mail className={iconClass("email")} />
                    <Input
                      id="auth-email"
                      name="email"
                      aria-label="البريد الإلكتروني"
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="example@company.com"
                      className={inputClass("email")}
                      dir="ltr"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5 text-right">
                  <label htmlFor="auth-password" className="text-xs font-semibold text-slate-600 tracking-wide block cursor-pointer">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <Lock className={iconClass("password")} />
                    <Input
                      id="auth-password"
                      name="password"
                      aria-label="كلمة المرور"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="••••••••"
                      className={`${inputClass("password")} pl-11`}
                      dir="ltr"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/35 hover:text-foreground transition-all duration-200 active:scale-90"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {!isLogin && form.password.length > 0 && (() => {
                    const strength = checkPasswordStrength(form.password);
                    return (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-2 space-y-1"
                      >
                        <div className="flex gap-1">
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="h-1.5 flex-1 rounded-full transition-all duration-300"
                              style={{ background: i < strength.score ? strength.color : "hsl(var(--muted))" }}
                            />
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span style={{ color: strength.color }}>{strength.label}</span>
                          {strength.suggestions.length > 0 && (
                            <span className="text-muted-foreground/60">{strength.suggestions[0]}</span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })()}
                </div>

                {isLogin && (
                  <div className="flex justify-end text-right">
                    <Link
                      to="/forgot-password"
                      className="text-xs text-primary hover:text-accent font-bold transition-colors"
                    >
                      نسيت كلمة المرور؟
                    </Link>
                  </div>
                )}

                <div className="pt-2 transition-all duration-200 hover:scale-[1.015] active:scale-[0.985]">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-xl text-xs font-bold border-0 text-white shadow-lg hover:shadow-primary/10 transition-all duration-300 relative overflow-hidden group"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
                    }}
                  >
                    {/* Shimmer */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
                        animation: "shimmer-move 2.2s linear infinite"
                      }}
                    />
                    <span className="relative z-10">
                      {loading ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          جاري المعالجة...
                        </span>
                      ) : isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
                    </span>
                  </Button>
                </div>
              </motion.form>
            </AnimatePresence>

            <div className="relative flex items-center justify-center my-4 select-none">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/40" />
              </div>
              <span className="relative px-3 text-[10px] font-bold text-muted-foreground/50 bg-background/0 uppercase tracking-widest">
                أو المتابعة عبر
              </span>
            </div>

            <SocialButtons />

            <p className="text-center text-xs text-muted-foreground select-none">
              {isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-bold hover:text-accent transition-colors underline-offset-4 hover:underline"
              >
                {isLogin ? "أنشئ حساب جديد" : "سجّل دخولك"}
              </button>
            </p>

            <p className="text-center text-[10px] text-muted-foreground/35 leading-relaxed select-none">
              بالمتابعة أنت توافق على{" "}
              <span className="text-muted-foreground/50 underline-offset-2 hover:underline cursor-pointer">شروط الاستخدام</span>
              {" "}و{" "}
              <span className="text-muted-foreground/50 underline-offset-2 hover:underline cursor-pointer">سياسة الخصوصية</span>
            </p>

            {/* Mobile back button */}
            <div className="lg:hidden text-center pt-2">
              <a href="/" className="text-muted-foreground hover:text-foreground text-xs inline-flex items-center gap-1.5 transition-colors font-bold group">
                <span>العودة للرئيسية</span>
                <ArrowLeft className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300 rotate-180" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

/* ─── Page ─── */
export default function Auth() {
  const { user } = useAuth();
  const { data: brandSettings } = useBrandSettings();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");
  const [pendingOtp, setPendingOtp] = useState(false);

  useEffect(() => { setIsLogin(searchParams.get("mode") !== "signup"); }, [searchParams]);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "company_deleted") {
      toast({
        title: "الحساب غير متاح ⛔",
        description: "تم حذف حساب هذه الشركة نهائياً من منصة Tawzeef-X، ولا يمكن تسجيل الدخول بهذا الحساب.",
        variant: "destructive",
      });
    } else if (errorParam === "company_inactive") {
      toast({
        title: "حساب الشركة موقوف ⚠️",
        description: "تم إيقاف حساب الشركة مؤقتاً من قِبل إدارة المنصة. يرجى التواصل مع إدارة Tawzeef-X.",
        variant: "destructive",
      });
    }
  }, [searchParams]);

  const hasErrorParam = !!searchParams.get("error");

  // Don't redirect while OTP 2FA is in progress or if ejected due to company status error
  if (user && !pendingOtp && !hasErrorParam) {
    const accountType = user.user_metadata?.account_type;
    return <Navigate to={accountType === "job_seeker" ? "/seeker-dashboard" : "/dashboard"} replace />;
  }

  return (
    <div className="min-h-screen min-h-[100dvh] relative overflow-hidden bg-gradient-to-tr from-emerald-50/30 via-slate-50 to-cyan-50/30 text-slate-800" dir="rtl">
      <SEO
        title={isLogin ? "تسجيل الدخول | TawzeefX" : "إنشاء حساب جديد | TawzeefX"}
        description="بوابة الدخول الموحدة لمنصة Tawzeef-X للتوظيف والفرص الوظيفية الذكية."
        noindex={true}
      />
      {/* Styles for sweeping border gradient + off-thread hardware accelerated CSS animations */}
      <style>{`
        @keyframes gradient-sweep {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .sweeping-border-card {
          position: relative;
          border: 1.5px solid transparent;
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.98) 100%) padding-box,
                      linear-gradient(135deg, hsl(var(--primary) / 0.35) 0%, hsl(var(--accent) / 0.2) 50%, hsl(var(--primary) / 0.45) 100%) border-box;
          background-size: 200% 200%;
          animation: gradient-sweep 8s ease infinite;
          backdrop-filter: blur(20px);
        }

        /* GPU accelerated background sphere animations */
        @keyframes float-sphere-1 {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(40px, -30px, 0) scale(1.15); }
        }
        @keyframes float-sphere-2 {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1.15); }
          50% { transform: translate3d(-35px, 35px, 0) scale(0.95); }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg) translate3d(0,0,0); }
          100% { transform: rotate(360deg) translate3d(0,0,0); }
        }
        @keyframes spin-reverse-slow {
          0% { transform: rotate(360deg) translate3d(0,0,0); }
          100% { transform: rotate(0deg) translate3d(0,0,0); }
        }
        @keyframes float-particle {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.15; }
          50% { transform: translate3d(15px, -35px, 0) scale(1.4); opacity: 0.6; }
        }
        @keyframes scan-vertical {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, 310px, 0); }
        }
        @keyframes shimmer-move {
          0% { transform: translate3d(-100%, 0, 0); }
          100% { transform: translate3d(200%, 0, 0); }
        }

        .floating-particle {
          will-change: transform;
          animation: float-particle var(--float-duration, 8s) ease-in-out infinite;
          animation-delay: var(--float-delay, 0s);
        }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 bg-background">
        {brandSettings?.loginBgUrl ? (
          <div className="absolute inset-0 z-0">
            <img src={brandSettings.loginBgUrl} alt="Custom Login Background" className="w-full h-full object-cover" />
            <div
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]"
              style={{ opacity: brandSettings.loginBgOverlayOpacity ?? 0.5 }}
            />
          </div>
        ) : (
          <SystemAtmosphere />
        )}
      </div>
      <div className="relative z-10 min-h-screen min-h-[100dvh] grid lg:grid-cols-[1.1fr_1fr]">
        <BrandingPanel />
        <div className="flex items-center justify-center py-10 sm:py-14 lg:py-0 px-3">
          <AuthForm isLogin={isLogin} setIsLogin={setIsLogin} setPendingOtp={setPendingOtp} />
        </div>
      </div>
    </div>
  );
}
