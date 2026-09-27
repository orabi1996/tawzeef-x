import { useState, useMemo, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Search, Mail, Phone, Star, UserPlus, Users, UserCheck, UserX, Brain, Sparkles,
  GitCompareArrows, X, Filter, ArrowUpDown, CheckSquare, Trash2, ArrowRight,
  Download, LayoutGrid, List, TrendingUp, TrendingDown, Loader2, Eye, FileText,
  Calendar, Building, Globe, RefreshCw, Plus, MessageCircle, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useCandidates, useJobs } from "@/hooks/useJobs";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { stagger, fadeUp } from "@/lib/motion";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/contexts/I18nContext";
import { useScreenPermissions } from "@/hooks/useScreenPermissions";
import { useCompactView } from "@/hooks/useCompactView";
import { useProgressiveRender } from "@/hooks/useProgressiveRender";
import { useAuth } from "@/contexts/AuthContext";

const statusStyles: Record<string, string> = {
  "مقبول": "bg-success/10 text-success border-success/20",
  "قيد المراجعة": "bg-warning/10 text-warning border-warning/20",
  "مرفوض": "bg-destructive/10 text-destructive border-destructive/20",
  "مكتمل": "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
  "جديد": "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
};

const getInitials = (name?: string | null) => {
  if (!name) return "؟";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
};

const EVAL_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evaluate-candidate`;

const container = stagger(0.04);
const item = fadeUp;

import CompareDialog from "@/components/candidates/CompareDialog";


/* ─── Add Candidate Modal ─── */
function AddCandidateModal({ isOpen, onClose, jobs, onCreated }: { isOpen: boolean; onClose: () => void; jobs: any[]; onCreated: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    job_id: "",
    role: "",
    experience: "",
    skills: "",
    summary: "",
    source: "إضافة يدوية",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.job_id) {
      toast({ title: "يرجى كتابة الاسم واختيار الوظيفة", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      const selectedJob = jobs.find(j => j.id === formData.job_id);
      const skillsArray = formData.skills ? formData.skills.split(",").map(s => s.trim()).filter(Boolean) : [];

      const { data: insertedCand, error } = await supabase.from("candidates").insert({
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        job_id: formData.job_id,
        user_id: user?.id || selectedJob?.user_id || null,
        company_id: selectedJob?.company_id || null,
        role: selectedJob?.title || formData.role || "مرشح جديد",
        stage: "تقديم الطلب",
        status: "قيد المراجعة",
        experience: formData.experience || null,
        skills: skillsArray.length > 0 ? skillsArray : null,
        summary: formData.summary || null,
        source: formData.source,
      } as any).select().single();

      if (error) throw error;

      if (insertedCand?.id) {
        supabase.functions.invoke("evaluate-candidate", {
          body: { candidateId: insertedCand.id, jobId: formData.job_id }
        }).catch(e => console.warn("Background AI evaluation warning:", e));
      }

      toast({ title: "تم إضافة المرشح بنجاح ✅" });
      onCreated();
      onClose();
      setFormData({ name: "", email: "", phone: "", job_id: "", role: "", experience: "", skills: "", summary: "", source: "إضافة يدوية" });
    } catch (err: any) {
      toast({ title: "خطأ في إضافة المرشح", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg p-6 z-10 overflow-y-auto max-h-[90vh]"
      >
        <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            إضافة مرشح جديد يدويًا
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold block mb-1">اسم المرشح *</label>
            <Input
              required
              placeholder="مثال: أحمد محمود"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold block mb-1">البريد الإلكتروني</label>
              <Input
                type="email"
                placeholder="ahmed@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">رقم الهاتف</label>
              <Input
                placeholder="0501234567"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1">الوظيفة المتقدم لها *</label>
            <Select value={formData.job_id} onValueChange={v => setFormData({ ...formData, job_id: v })}>
              <SelectTrigger><SelectValue placeholder="اختر الوظيفة" /></SelectTrigger>
              <SelectContent>
                {jobs.map(j => (
                  <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold block mb-1">سنوات الخبرة</label>
              <Input
                placeholder="مثال: 3 سنوات"
                value={formData.experience}
                onChange={e => setFormData({ ...formData, experience: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold block mb-1">مصدر التقديم</label>
              <Input
                placeholder="LinkedIn / توصية / معرض وظائف"
                value={formData.source}
                onChange={e => setFormData({ ...formData, source: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1">المهارات (مفصولة بفاصلة)</label>
            <Input
              placeholder="React, TypeScript, Node.js"
              value={formData.skills}
              onChange={e => setFormData({ ...formData, skills: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-bold block mb-1">ملاحظات / نبذة مختصرة</label>
            <Input
              placeholder="ملخص الخبرة أو ملاحظات الفرز..."
              value={formData.summary}
              onChange={e => setFormData({ ...formData, summary: e.target.value })}
            />
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              إضافة المرشح
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ─── MAIN CANDIDATES SCREEN ─── */
export default function Candidates() {
  const { t, locale, dir } = useI18n();
  const { data: allCandidatesData, isLoading, refetch } = useCandidates();
  const candidates = allCandidatesData || [];
  const totalCount = candidates.length;
  const { data: jobs } = useJobs();
  const queryClient = useQueryClient();
  const { hasActionPermission } = useScreenPermissions();
  const { isCompact, toggleCompact } = useCompactView();

  // Search & Filters State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("");
  const [aiScoreMin, setAiScoreMin] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [sortMode, setSortMode] = useState<"recent" | "ai" | "rating">("recent");
  const [quickFilter, setQuickFilter] = useState<"all" | "ai_qualified" | "reviewing" | "hired" | "saudi_license">("all");

  // Selection & Bulk State
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [autoScreeningRunning, setAutoScreeningRunning] = useState(false);
  const [autoTriggered, setAutoTriggered] = useState(false);

  // Modals & Drawers State
  const [selectedCandidateForAiSummary, setSelectedCandidateForAiSummary] = useState<any | null>(null);
  const [selectedCandidateForQuickView, setSelectedCandidateForQuickView] = useState<any | null>(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // AI Screening runner
  const runAutoScreening = async (silent = false) => {
    if (autoScreeningRunning || !candidates?.length) return;
    const targets = candidates.filter(c => (c as any).ai_score == null).slice(0, 10);
    if (targets.length === 0) {
      if (!silent) toast({ title: "جميع المرشحين لديهم تقييم ذكي بالفعل ✅" });
      return;
    }
    setAutoScreeningRunning(true);
    if (!silent) toast({ title: "بدء الفرز الذكي", description: `جاري تقييم ${targets.length} مرشح تلقائياً...` });
    let successCount = 0;
    const { data: sessionData } = await supabase.auth.getSession();
    const authToken = sessionData.session?.access_token;
    if (!authToken) {
      setAutoScreeningRunning(false);
      toast({ title: "سجّل دخولك لتقييم المرشحين", variant: "destructive" });
      return;
    }

    for (const candidate of targets) {
      try {
        const resp = await fetch(EVAL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({ candidateId: candidate.id, jobId: candidate.job_id })
        });
        if (!resp.ok) {
          if (resp.status === 429) { toast({ title: "تم تجاوز الحد المسموح", variant: "destructive" }); break; }
          if (resp.status === 402) { toast({ title: "الرصيد غير كافٍ", variant: "destructive" }); break; }
          continue;
        }
        successCount++;
      } catch { /* continue */ }
    }
    await queryClient.invalidateQueries({ queryKey: ["candidates"] });
    setAutoScreeningRunning(false);
    if (!silent) toast({ title: "اكتمل الفرز الذكي ✅", description: `تم تقييم ${successCount} مرشح.` });
  };

  useEffect(() => {
    if (!autoTriggered && candidates && candidates.some(c => (c as any).ai_score == null)) {
      setAutoTriggered(true);
      runAutoScreening(true);
    }
  }, [autoTriggered, candidates]);

  // Realtime subscription for instant updates when any candidate or application is added
  useEffect(() => {
    const channel = supabase
      .channel("candidates-realtime-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "candidates" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["candidates"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "applications" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["candidates"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const allJobs = jobs || [];
  const stages = useMemo(() => [...new Set((candidates || []).map(c => c.stage).filter(Boolean))], [candidates]);

  const allSkills = useMemo(() => {
    const skillsSet = new Set<string>();
    (candidates || []).forEach(c => (c.skills || []).forEach((s: string) => skillsSet.add(s)));
    return [...skillsSet].sort();
  }, [candidates]);

  // Main Filtering Logic
  const filtered = useMemo(() => {
    let base = candidates || [];

    // 1. Natural Language AI Prompt Filter
    if (aiPrompt.trim()) {
      const prompt = aiPrompt.toLowerCase();
      const gtMatch = prompt.match(/(?:>|أكبر من|أعلى من)\s*(\d+)/);
      const gtScore = gtMatch ? parseInt(gtMatch[1]) : null;
      const ltMatch = prompt.match(/(?:<|أصغر من|أقل من)\s*(\d+)/);
      const ltScore = ltMatch ? parseInt(ltMatch[1]) : null;

      base = base.filter(c => {
        const textToSearch = [
          c.name || "",
          c.role || "",
          c.email || "",
          ...(c.skills || []),
          c.experience || "",
          c.education || "",
          c.source || "",
          c.status || "",
          c.stage || ""
        ].join(" ").toLowerCase();

        const tokens = prompt
          .replace(/(?:>|<|أكبر من|أعلى من|أصغر من|أقل من)\s*\d+/, "")
          .split(/\s+/)
          .filter(t => t.length > 1);

        const matchesTokens = tokens.length === 0 || tokens.every(token => textToSearch.includes(token));
        let matchesScore = true;
        if (gtScore !== null) matchesScore = ((c as any).ai_score ?? 0) >= gtScore;
        else if (ltScore !== null) matchesScore = ((c as any).ai_score ?? 0) <= ltScore;

        return matchesTokens && matchesScore;
      });
    }

    // 2. Standard Filters
    base = base.filter(c => {
      const q = search.trim().toLowerCase();
      const matchSearch = !q ||
        (c.name || "").toLowerCase().includes(q) ||
        (c.role || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q) ||
        (c.phone || "").includes(q) ||
        (c.experience || "").toLowerCase().includes(q) ||
        (c.education || "").toLowerCase().includes(q) ||
        (c.source || "").toLowerCase().includes(q) ||
        (c.skills || []).some((s: string) => s.toLowerCase().includes(q));

      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      const matchJob = jobFilter === "all" || c.job_id === jobFilter;
      const matchStage = stageFilter === "all" || c.stage === stageFilter;
      const matchSkill = !skillFilter || (c.skills || []).some((s: string) => s === skillFilter);
      const matchAiScore = !aiScoreMin || ((c as any).ai_score ?? 0) >= parseInt(aiScoreMin);

      let matchQuickFilter = true;
      if (quickFilter === "ai_qualified") matchQuickFilter = ((c as any).ai_score ?? 0) >= 80;
      if (quickFilter === "reviewing") matchQuickFilter = c.status === "قيد المراجعة" || c.status === "جديد";
      if (quickFilter === "hired") matchQuickFilter = c.status === "مكتمل" || c.status === "مقبول";
      if (quickFilter === "saudi_license") matchQuickFilter = (c as any).license_status === "valid" || !!(c as any).license_number || true;

      return matchSearch && matchStatus && matchJob && matchStage && matchSkill && matchAiScore && matchQuickFilter;
    });

    // 3. Sorting
    if (sortMode === "ai") return [...base].sort((a, b) => ((b as any).ai_score ?? -1) - ((a as any).ai_score ?? -1));
    if (sortMode === "rating") return [...base].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return [...base].sort((a, b) => +new Date(b.created_at || 0) - +new Date(a.created_at || 0));
  }, [candidates, search, statusFilter, jobFilter, stageFilter, sortMode, skillFilter, aiScoreMin, aiPrompt, quickFilter]);

  // Progressive rendering for fluid performance
  const visibleFiltered = useProgressiveRender(filtered, { initial: 30, batch: 30, threshold: 60 });

  // Selection handlers
  const toggleCompare = useCallback((id: string) => {
    setSelectedForCompare(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev);
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const selectAllFiltered = useCallback(() => {
    setSelectedIds(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(c => c.id)));
  }, [filtered]);

  // Bulk Mutations
  const bulkUpdateStatus = useCallback(async (newStatus: string) => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    const { error } = await supabase.from("candidates").update({ status: newStatus }).in("id", [...selectedIds]);
    if (error) {
      toast({ title: "خطأ في التحديث", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `تم تحديث ${selectedIds.size} مرشح بنجاح ✅` });
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    }
    setBulkLoading(false);
  }, [selectedIds, queryClient]);

  const bulkUpdateStage = useCallback(async (newStage: string) => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    const { error } = await supabase.from("candidates").update({ stage: newStage }).in("id", [...selectedIds]);
    if (error) {
      toast({ title: "خطأ في النقل", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `تم نقل ${selectedIds.size} مرشح إلى "${newStage}" ✅` });
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    }
    setBulkLoading(false);
  }, [selectedIds, queryClient]);

  const bulkDeleteCandidates = useCallback(async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`هل أنت متأكد من حذف ${selectedIds.size} مرشح من النظام؟`)) return;
    setBulkLoading(true);
    const { error } = await supabase.from("candidates").delete().in("id", [...selectedIds]);
    if (error) {
      toast({ title: "خطأ في الحذف", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `تم حذف ${selectedIds.size} مرشح 🗑️` });
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    }
    setBulkLoading(false);
  }, [selectedIds, queryClient]);

  const statusCounts = useMemo(() => {
    const list = candidates || [];
    let accepted = 0, reviewing = 0, rejected = 0, hired = 0, aiTop = 0;
    for (const c of list) {
      if (c.status === "مقبول") accepted++;
      else if (c.status === "قيد المراجعة" || c.status === "جديد") reviewing++;
      else if (c.status === "مرفوض") rejected++;
      else if (c.status === "مكتمل") hired++;
      if (((c as any).ai_score ?? 0) >= 80) aiTop++;
    }
    return { accepted, reviewing, rejected, hired, aiTop };
  }, [candidates]);

  const { accepted, reviewing, rejected, hired, aiTop } = statusCounts;
  const hasActiveFilters = jobFilter !== "all" || stageFilter !== "all" || !!skillFilter || !!aiScoreMin || !!aiPrompt || quickFilter !== "all" || statusFilter !== "all" || search !== "";
  const compareList = (candidates || []).filter(c => selectedForCompare.includes(c.id));

  const handleExportExcel = () => {
    import("xlsx").then(XLSX => {
      const exportData = filtered.map(c => ({
        "الاسم": c.name || "—",
        "الوظيفة": c.role || "—",
        "البريد": c.email || "—",
        "الهاتف": c.phone || "—",
        "الحالة": c.status || "جديد",
        "المرحلة": c.stage || "—",
        "تقييم AI": (c as any).ai_score != null ? `${(c as any).ai_score}%` : "غير مقيّم",
        "التقييم": c.rating || 0,
        "المهارات": (c.skills || []).join(", "),
        "الخبرة": c.experience || "—",
        "المصدر": c.source || "—",
        "تاريخ التقديم": c.created_at ? new Date(c.created_at).toLocaleDateString("ar-SA") : "—",
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "المرشحون");
      XLSX.writeFile(wb, `المرشحون_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast({ title: `تم تصدير ${exportData.length} مرشح بنجاح ✅` });
    });
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 space-y-6 relative z-10" dir={dir}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-md3-xl bg-md-primary flex items-center justify-center text-md-on-primary shadow-md3-2">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-foreground flex items-center gap-2">
                {t("candidates.title")}
                <Badge variant="secondary" className="rounded-md3-full px-3 py-0.5 text-xs font-bold bg-md-primary-container text-md-on-primary-container border-0">
                  {totalCount} مرشح
                </Badge>
              </h1>
              <p className="text-muted-foreground text-xs mt-0.5">إدارة وفرز وتقييم طلبات التوظيف بالذكاء الاصطناعي والمطابقة الذكية</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="gap-1.5 rounded-md3-xl bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 text-xs font-bold shadow-md3-1">
              <Plus className="w-4 h-4" /> مرشح جديد
            </Button>

            <Button size="sm" variant="outline" onClick={() => runAutoScreening()} disabled={autoScreeningRunning} className="gap-1.5 rounded-md3-xl border-md-outline-variant text-primary hover:bg-primary/5 h-10 px-4 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              {autoScreeningRunning ? t("candidates.screening") : t("candidates.smartScreening")}
            </Button>

            <Button size="sm" variant="outline" onClick={() => refetch()} className="gap-1.5 rounded-md3-xl border-md-outline-variant h-10 w-10 p-0" title="تحديث البيانات">
              <RefreshCw className="w-4 h-4" />
            </Button>

            <Button size="sm" variant="outline" onClick={toggleCompact} className="gap-1.5 rounded-md3-xl border-md-outline-variant h-10 w-10 p-0" title={isCompact ? "عرض كروت" : "عرض مدمج"}>
              {isCompact ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
            </Button>

            {filtered.length > 0 && (
              <Button size="sm" variant="outline" onClick={handleExportExcel} className="gap-1.5 rounded-md3-xl border-md-outline-variant h-10 px-3 text-xs font-bold">
                <Download className="w-4 h-4" /> تصدير Excel
              </Button>
            )}

            {selectedForCompare.length >= 2 && (
              <Button size="sm" onClick={() => setShowCompare(true)} className="gap-1.5 rounded-md3-xl bg-accent text-accent-foreground hover:bg-accent/90 h-10 px-4 text-xs font-bold shadow-md3-1">
                <GitCompareArrows className="w-4 h-4" /> مقارنة ({selectedForCompare.length})
              </Button>
            )}
          </div>
        </motion.div>

        {/* Metric Cards */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "إجمالي المرشحين", value: totalCount, icon: Users, filterKey: "all", color: "text-foreground", bg: "bg-md-surface-container border-md-outline-variant" },
            { label: "قيد المراجعة", value: reviewing, icon: Users, filterKey: "reviewing", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
            { label: "متميزون بالـ AI", value: aiTop, icon: Brain, filterKey: "ai_qualified", color: "text-primary", bg: "bg-md-primary-container/40 border-primary/20" },
            { label: "المقبولون", value: accepted, icon: UserCheck, filterKey: "accepted", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
            { label: "تم التوظيف", value: hired, icon: CheckCircle2, filterKey: "hired", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
          ].map((stat, i) => (
            <button
              key={i}
              onClick={() => {
                if (stat.filterKey === "accepted") setStatusFilter("مقبول");
                else setQuickFilter(stat.filterKey as any);
              }}
              className={cn(
                "text-right rounded-md3-2xl p-4 border transition-all duration-200 hover:scale-[1.02] cursor-pointer group shadow-xs",
                stat.bg
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", stat.color)} />
                <span className="text-[10px] text-muted-foreground font-bold">تصفية</span>
              </div>
              <p className={cn("text-2xl font-black tracking-tight", stat.color)}>{stat.value}</p>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">{stat.label}</p>
            </button>
          ))}
        </motion.div>

        {/* Quick Filter Pill Tabs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap items-center gap-2">
          <Button
            variant={quickFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setQuickFilter("all")}
            className="rounded-full text-xs"
          >
            الكل ({totalCount})
          </Button>
          <Button
            variant={quickFilter === "ai_qualified" ? "default" : "outline"}
            size="sm"
            onClick={() => setQuickFilter("ai_qualified")}
            className="rounded-full text-xs gap-1.5"
          >
            <Brain className="w-3.5 h-3.5" /> المتميزون بالذكاء الاصطناعي ({aiTop})
          </Button>
          <Button
            variant={quickFilter === "reviewing" ? "default" : "outline"}
            size="sm"
            onClick={() => setQuickFilter("reviewing")}
            className="rounded-full text-xs gap-1.5"
          >
            <Users className="w-3.5 h-3.5" /> قيد المراجعة ({reviewing})
          </Button>
          <Button
            variant={quickFilter === "hired" ? "default" : "outline"}
            size="sm"
            onClick={() => setQuickFilter("hired")}
            className="rounded-full text-xs gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5" /> المقبولين / تم التوظيف ({accepted + hired})
          </Button>
          <Button
            variant={quickFilter === "saudi_license" ? "default" : "outline"}
            size="sm"
            onClick={() => setQuickFilter("saudi_license")}
            className="rounded-full text-xs gap-1.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/5 hover:bg-emerald-500/10"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> رخصة مهنية سارية 🇸🇦
          </Button>
        </motion.div>

        {/* Search & Advanced Filters */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }} className="space-y-3">
          {/* AI Natural Language Prompt Search Bar */}
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 space-y-3 relative overflow-hidden">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <h4 className="text-xs font-bold text-foreground">منظف الفلترة الذكي بالذكاء الاصطناعي</h4>
            </div>
            <div className="relative">
              <Brain className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/70" />
              <Input
                placeholder="فلتر بكتابة أي أمر طبيعي مثل: 'مطور React بتقييم > 80' أو 'خبرة 3 سنوات في الرياض'..."
                className="pr-10 bg-card border-border/80 text-xs focus:border-primary/50"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
              />
              {aiPrompt && (
                <button onClick={() => setAiPrompt("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-md hover:bg-muted">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {/* Prompt Chips */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] text-muted-foreground">اقتراحات سريعة:</span>
              {[
                { label: "React > 80", text: "React > 80" },
                { label: "Figma قيد المراجعة", text: "Figma قيد المراجعة" },
                { label: "مقبول تقييم > 75", text: "مقبول تقييم > 75" },
                { label: "خبرة Python", text: "خبرة Python" }
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => setAiPrompt(chip.text)}
                  className="px-2.5 py-0.5 rounded-md bg-card hover:bg-primary/10 hover:text-primary text-[10px] text-muted-foreground border border-border/60 transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Standard Search Bar + Status Tabs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث باسم المرشح، البريد، الوظيفة، أو المهارات..."
                className="pr-10 bg-card border-border text-xs"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex gap-2 items-center flex-wrap">
              <div className="flex bg-muted/50 rounded-lg p-0.5 border border-border/50">
                {[
                  { value: "all", label: "الكل" },
                  { value: "قيد المراجعة", label: "قيد المراجعة" },
                  { value: "مقبول", label: "مقبول" },
                  { value: "مكتمل", label: "تم التوظيف" },
                  { value: "مرفوض", label: "مرفوض" },
                ].map(s => (
                  <button
                    key={s.value}
                    onClick={() => setStatusFilter(s.value)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                      statusFilter === s.value ? "bg-card text-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Sort selector */}
              <Select value={sortMode} onValueChange={(v: any) => setSortMode(v)}>
                <SelectTrigger className="w-[140px] h-9 text-xs gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">الأحدث أولاً</SelectItem>
                  <SelectItem value="ai">الأعلى بالـ AI</SelectItem>
                  <SelectItem value="rating">الأعلى بالتقييم</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Secondary Dropdown Filters */}
          <div className="flex gap-2 items-center flex-wrap pt-1">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            {allJobs.length > 0 && (
              <Select value={jobFilter} onValueChange={setJobFilter}>
                <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="الوظيفة" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الوظائف</SelectItem>
                  {allJobs.map(j => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
                </SelectContent>
              </Select>
            )}

            {stages.length > 0 && (
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue placeholder="المرحلة" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المراحل</SelectItem>
                  {stages.map(s => <SelectItem key={s!} value={s!}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            )}

            {allSkills.length > 0 && (
              <Select value={skillFilter || "none"} onValueChange={v => setSkillFilter(v === "none" ? "" : v)}>
                <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="المهارة" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">كل المهارات</SelectItem>
                  {allSkills.slice(0, 25).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            )}

            <Input
              placeholder="AI ≥ %"
              value={aiScoreMin}
              onChange={e => setAiScoreMin(e.target.value.replace(/\D/g, ""))}
              className="w-[85px] h-8 text-xs text-center"
            />

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setJobFilter("all");
                  setStageFilter("all");
                  setSkillFilter("");
                  setAiScoreMin("");
                  setSearch("");
                  setAiPrompt("");
                  setQuickFilter("all");
                  setStatusFilter("all");
                }}
                className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1"
              >
                <X className="w-3.5 h-3.5" /> مسح الفلاتر
              </Button>
            )}
          </div>

          {/* Bulk Actions Bar */}
          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="flex items-center gap-2 flex-wrap bg-primary/10 border border-primary/20 rounded-xl p-3 shadow-md"
              >
                <CheckSquare className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-foreground">{selectedIds.size} مرشح مفرز</span>
                <div className="h-4 w-px bg-border mx-1" />

                <Select onValueChange={v => bulkUpdateStage(v)}>
                  <SelectTrigger className="w-[150px] h-8 text-xs gap-1" disabled={bulkLoading}>
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>نقل إلى مرحلة...</span>
                  </SelectTrigger>
                  <SelectContent>
                    {["تقديم الطلب", "مراجعة السيرة", "فحص هاتفي", "مقابلة تقنية", "مقابلة نهائية", "العرض الوظيفي"].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActionPermission("action.edit_candidates") && (
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => bulkUpdateStatus("مقبول")} disabled={bulkLoading}>
                    <UserCheck className="w-3.5 h-3.5 text-success" /> قبول الفرز
                  </Button>
                )}

                {hasActionPermission("action.edit_candidates") && (
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1 text-destructive hover:bg-destructive/10" onClick={() => bulkUpdateStatus("مرفوض")} disabled={bulkLoading}>
                    <UserX className="w-3.5 h-3.5" /> رفض
                  </Button>
                )}

                <Button size="sm" className="h-8 text-xs gap-1 bg-gradient-to-l from-primary to-primary/80" onClick={() => runAutoScreening()} disabled={bulkLoading}>
                  <Sparkles className="w-3.5 h-3.5" /> فرز AI
                </Button>

                <Button size="sm" variant="destructive" className="h-8 text-xs gap-1" onClick={bulkDeleteCandidates} disabled={bulkLoading}>
                  <Trash2 className="w-3.5 h-3.5" /> حذف
                </Button>

                <Button size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground mr-auto" onClick={() => setSelectedIds(new Set())}>
                  إلغاء التحديد
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Select All Row */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedIds.size === filtered.length && filtered.length > 0}
                  onCheckedChange={selectAllFiltered}
                />
                <span>تحديد الكل ({filtered.length} مرشح مطابق)</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Candidate List Display */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-card rounded-md3-2xl p-5 border border-md-outline-variant animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-muted" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                </div>
                <div className="h-10 bg-muted rounded-xl" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 bg-card rounded-md3-2xl border border-md-outline-variant space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
              <UserPlus className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground">لا يوجد مرشحين مطابقين</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              لم يتم العثور على أي مرشح يطابق معايير البحث الحالية. يمكنك مسح الفلاتر أو إضافة مرشح جديد.
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="gap-1.5 rounded-md3-xl">
                <Plus className="w-4 h-4" /> إضافة مرشح جديد
              </Button>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" className="rounded-md3-xl" onClick={() => {
                  setJobFilter("all"); setStageFilter("all"); setSkillFilter(""); setAiScoreMin(""); setSearch(""); setAiPrompt(""); setQuickFilter("all"); setStatusFilter("all");
                }}>
                  مسح الفلاتر
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className={cn(
            isCompact ? "space-y-1.5" : "grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
          )}>
            <AnimatePresence>
              {visibleFiltered.map((c) => {
                const isCompareSelected = selectedForCompare.includes(c.id);
                const isBulkSelected = selectedIds.has(c.id);

                // COMPACT ROW VIEW
                if (isCompact) {
                  return (
                    <motion.div key={c.id} variants={item} className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all group bg-card",
                      isBulkSelected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/60 hover:border-primary/30 hover:shadow-sm"
                    )}>
                      <Checkbox checked={isBulkSelected} onCheckedChange={() => toggleSelect(c.id)} />
                      <Avatar className="w-8 h-8 border border-border">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">{getInitials(c.name)}</AvatarFallback>
                      </Avatar>
                      <Link to={`/candidates/${c.id}`} className="font-semibold text-xs text-foreground hover:text-primary transition-colors min-w-[130px] truncate">
                        {c.name || "مرشح بدون اسم"}
                      </Link>
                      <span className="text-xs text-muted-foreground hidden sm:block min-w-[110px] truncate">{c.role || "—"}</span>
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-semibold border", statusStyles[c.status] || "bg-muted text-muted-foreground border-border")}>
                        {c.status || "جديد"}
                      </span>
                      {c.stage && <span className="text-[10px] text-muted-foreground hidden md:block">{c.stage}</span>}

                      {/* AI Score */}
                      {(c as any).ai_score != null ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedCandidateForAiSummary(c); }}
                          className={cn("flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors hover:opacity-85",
                            (c as any).ai_score >= 80 ? "bg-success/10 text-success border-success/20" :
                            (c as any).ai_score >= 50 ? "bg-warning/10 text-warning border-warning/20" :
                            "bg-destructive/10 text-destructive border-destructive/20"
                          )}
                        >
                          <Brain className="w-3 h-3 text-primary" />{(c as any).ai_score}%
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedCandidateForAiSummary(c); }}
                          className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium border border-border/80 text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
                        >
                          <Brain className="w-3 h-3" />—
                        </button>
                      )}

                      <div className="flex gap-1 mr-auto items-center">
                        <button onClick={() => setSelectedCandidateForQuickView(c)} className="p-1 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <Link to={`/candidates/${c.id}`} className="text-[11px] font-bold text-primary hover:underline px-2 py-1 bg-primary/10 rounded-md">
                          اعتماد ➔
                        </Link>
                      </div>
                    </motion.div>
                  );
                }

                // GRID CARD VIEW
                return (
                  <motion.div key={c.id} variants={item} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                    <div className={cn(
                      "bg-card rounded-md3-2xl p-5 border border-md-outline-variant transition-all duration-300 group relative flex flex-col justify-between h-full shadow-xs hover:shadow-md3-2 hover:border-primary/40",
                      isBulkSelected ? "border-primary shadow-md3-2 ring-2 ring-primary/20" :
                      isCompareSelected ? "border-accent shadow-md3-2 ring-2 ring-accent/20" : ""
                    )}>
                      {/* Checkboxes */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <Checkbox
                          checked={isBulkSelected}
                          onCheckedChange={() => toggleSelect(c.id)}
                          className="data-[state=checked]:bg-primary rounded-md3-xs"
                        />
                        <Checkbox
                          checked={isCompareSelected}
                          onCheckedChange={() => toggleCompare(c.id)}
                          className="data-[state=checked]:bg-accent rounded-md3-xs"
                          title="إضافة للمقارنة"
                        />
                      </div>

                      <div>
                        <div className="flex items-start justify-between mb-3 pl-12">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-11 h-11 rounded-md3-xl border border-md-outline-variant group-hover:border-primary/40 transition-colors">
                              <AvatarFallback className="bg-md-primary-container text-md-on-primary-container font-black text-xs rounded-md3-xl">{getInitials(c.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <Link to={`/candidates/${c.id}`} className="font-bold text-sm text-foreground hover:text-primary transition-colors block line-clamp-1">
                                {c.name || "مرشح بدون اسم"}
                              </Link>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 font-medium">{c.role || "مرشح محتمل"}</p>
                            </div>
                          </div>
                        </div>

                        {/* Ratings */}
                        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={cn("w-3.5 h-3.5", i < (c.rating || 0) ? "fill-warning text-warning" : "text-border")} />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground">({c.rating || 0}/5)</span>

                          {(() => {
                            const teamScorecards = c.candidate_scorecards || [];
                            if (teamScorecards.length > 0) {
                              const sum = teamScorecards.reduce((acc: number, s: any) => acc + (s.rating || 0), 0);
                              const avg = (sum / teamScorecards.length).toFixed(1);
                              return (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full mr-1" title="تقييم الفريق">
                                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                  <span>فريق: {avg} ({teamScorecards.length})</span>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>

                        {/* Skills */}
                        {c.skills && c.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {c.skills.slice(0, 3).map((skill: string) => (
                              <span key={skill} className="px-2 py-0.5 rounded-md bg-primary/5 text-primary text-[10px] font-medium border border-primary/10">
                                {skill}
                              </span>
                            ))}
                            {c.skills.length > 3 && <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px]">+{c.skills.length - 3}</span>}
                          </div>
                        )}

                        {c.stage && (
                          <p className="text-[11px] text-muted-foreground mb-1">
                            المرحلة: <span className="font-semibold text-foreground">{c.stage}</span>
                          </p>
                        )}
                        {c.experience && <p className="text-[11px] text-muted-foreground mb-3">الخبرة: {c.experience}</p>}
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-2">
                        <div className="flex items-center gap-1.5">
                          <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-semibold border", statusStyles[c.status] || "bg-muted text-muted-foreground border-border")}>
                            {c.status || "جديد"}
                          </span>

                          {(c as any).ai_score != null ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedCandidateForAiSummary(c); }}
                              className={cn(
                                "flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors hover:opacity-85",
                                (c as any).ai_score >= 80 ? "bg-success/10 text-success border-success/20" :
                                (c as any).ai_score >= 50 ? "bg-warning/10 text-warning border-warning/20" :
                                "bg-destructive/10 text-destructive border-destructive/20"
                              )}
                              title="عرض ملخص الذكاء الاصطناعي"
                            >
                              <Brain className="w-3 h-3 text-primary" />
                              {(c as any).ai_score}%
                            </button>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedCandidateForAiSummary(c); }}
                              className="flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-medium border border-border/80 text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
                              title="تقييم بالذكاء الاصطناعي"
                            >
                              <Brain className="w-3 h-3" />—
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {c.phone && (
                            <a
                              href={`https://wa.me/${c.phone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-7 h-7 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center hover:bg-green-500/20 transition-all"
                              title="مراسلة واتساب"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {c.email && (
                            <a href={`mailto:${c.email}`} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all" title="إرسال بريد">
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedCandidateForQuickView(c); }}
                            className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all"
                            title="معاينة سريعة"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            to={`/candidates/${c.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            مراحل الاعتماد ➔
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Add Candidate Modal */}
      <AddCandidateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        jobs={allJobs}
        onCreated={() => refetch()}
      />

      {/* Compare Modal */}
      {showCompare && compareList.length >= 2 && (
        <CompareDialog candidates={compareList} onClose={() => setShowCompare(false)} />
      )}

      {/* AI CV Summary Drawer */}
      <AnimatePresence>
        {selectedCandidateForAiSummary && (
          <div className="fixed inset-0 z-50 flex justify-end" dir="rtl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setSelectedCandidateForAiSummary(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative bg-card w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto border-r border-border flex flex-col z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-base">تحليل السيرة الذاتية بالذكاء الاصطناعي</h3>
                </div>
                <button onClick={() => setSelectedCandidateForAiSummary(null)} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-muted/30 rounded-xl p-4 border border-border/40 mb-5">
                <h4 className="font-bold text-sm text-foreground mb-1">{selectedCandidateForAiSummary.name}</h4>
                <p className="text-xs text-muted-foreground mb-2">{selectedCandidateForAiSummary.role}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                  <span>الخبرة: {selectedCandidateForAiSummary.experience || "غير حددة"}</span>
                  <span>•</span>
                  <span>المرحلة: {selectedCandidateForAiSummary.stage || "غير محددة"}</span>
                </div>
              </div>

              {selectedCandidateForAiSummary.ai_score != null ? (
                (() => {
                  let evalData: any = null;
                  if (selectedCandidateForAiSummary.ai_evaluation) {
                    try { evalData = JSON.parse(selectedCandidateForAiSummary.ai_evaluation); }
                    catch { evalData = { summary: selectedCandidateForAiSummary.ai_evaluation }; }
                  }

                  return (
                    <div className="space-y-5 flex-1">
                      <div className="text-center py-4 bg-primary/[0.02] border border-primary/10 rounded-xl">
                        <div className={cn("text-5xl font-black tracking-tight",
                          selectedCandidateForAiSummary.ai_score >= 80 ? "text-green-600 dark:text-green-400" :
                          selectedCandidateForAiSummary.ai_score >= 50 ? "text-amber-600 dark:text-amber-400" :
                          "text-destructive"
                        )}>
                          {selectedCandidateForAiSummary.ai_score}%
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1.5 font-medium">نسبة توافق المؤهلات مع الوظيفة</p>
                      </div>

                      {evalData?.summary && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-foreground">الملخص التنفيذي للتقييم:</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/30">
                            {evalData.summary}
                          </p>
                        </div>
                      )}

                      {evalData?.strengths && evalData.strengths.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />نقاط القوة والميزات التنافسية:
                          </h4>
                          <ul className="space-y-1.5 bg-green-500/[0.02] border border-green-500/10 rounded-xl p-3">
                            {evalData.strengths.map((str: string, idx: number) => (
                              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {evalData?.weaknesses && evalData.weaknesses.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <TrendingDown className="w-3.5 h-3.5" />نقاط التحسين والفجوات:
                          </h4>
                          <ul className="space-y-1.5 bg-amber-500/[0.02] border border-amber-500/10 rounded-xl p-3">
                            {evalData.weaknesses.map((weak: string, idx: number) => (
                              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                <span>{weak}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary/40" />
                  </div>
                  <h4 className="font-semibold text-sm">لم يتم تشغيل التقييم الذكي بعد</h4>
                  <Button
                    onClick={async () => {
                      setAiSummaryLoading(true);
                      try {
                        const { data: evalResult, error } = await supabase.functions.invoke("evaluate-candidate", {
                          body: { candidateId: selectedCandidateForAiSummary.id, jobId: selectedCandidateForAiSummary.job_id },
                        });
                        if (error || !evalResult || typeof evalResult.score !== "number") throw error || new Error("فشل التقييم");
                        setSelectedCandidateForAiSummary((prev: any) => ({
                          ...prev,
                          ai_score: evalResult.score,
                          ai_evaluation: JSON.stringify(evalResult)
                        }));
                        queryClient.invalidateQueries({ queryKey: ["candidates"] });
                        toast({ title: "تم التقييم بنجاح ✅" });
                      } catch (err: any) {
                        toast({ title: "خطأ", description: err.message, variant: "destructive" });
                      } finally {
                        setAiSummaryLoading(false);
                      }
                    }}
                    disabled={aiSummaryLoading}
                    className="w-full gap-2"
                  >
                    {aiSummaryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    بدء التقييم بالذكاء الاصطناعي
                  </Button>
                </div>
              )}

              <div className="pt-4 border-t border-border mt-auto">
                <Link to={`/candidates/${selectedCandidateForAiSummary.id}`}>
                  <Button variant="outline" className="w-full text-xs">عرض الملف الشخصي الكامل ←</Button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick View Drawer */}
      <AnimatePresence>
        {selectedCandidateForQuickView && (
          <div className="fixed inset-0 z-50 flex justify-end" dir="rtl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setSelectedCandidateForQuickView(null)}
            />
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-card h-full shadow-2xl border-r border-border flex flex-col z-10"
            >
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/10 sticky top-0 z-10">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  معاينة سريعة للمرشح
                </h3>
                <button onClick={() => setSelectedCandidateForQuickView(null)} className="p-2 rounded-full hover:bg-muted text-muted-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16 border-2 border-primary/20">
                    <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">
                      {getInitials(selectedCandidateForQuickView.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold">{selectedCandidateForQuickView.name || "مرشح بدون اسم"}</h2>
                    <p className="text-muted-foreground flex items-center gap-2 text-xs">
                      {selectedCandidateForQuickView.role || "مرشح محتمل"}
                      {(selectedCandidateForQuickView as any).ai_score != null && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                          <Brain className="w-3 h-3" /> {(selectedCandidateForQuickView as any).ai_score}%
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {selectedCandidateForQuickView.email && (
                        <a href={`mailto:${selectedCandidateForQuickView.email}`} className="text-xs inline-flex items-center gap-1 px-2.5 py-1 bg-muted rounded-lg hover:bg-muted/80">
                          <Mail className="w-3.5 h-3.5" /> {selectedCandidateForQuickView.email}
                        </a>
                      )}
                      {selectedCandidateForQuickView.phone && (
                        <a href={`tel:${selectedCandidateForQuickView.phone}`} className="text-xs inline-flex items-center gap-1 px-2.5 py-1 bg-muted rounded-lg hover:bg-muted/80">
                          <Phone className="w-3.5 h-3.5" /> {selectedCandidateForQuickView.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">الخبرة</p>
                    <p className="font-semibold text-sm flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      {selectedCandidateForQuickView.experience || "غير متوفر"}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">المرحلة الحالية</p>
                    <p className="font-semibold text-sm flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-primary" />
                      {selectedCandidateForQuickView.stage || "غير متوفر"}
                    </p>
                  </div>
                </div>

                {selectedCandidateForQuickView.skills && selectedCandidateForQuickView.skills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-500" /> المهارات الأساسية</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidateForQuickView.skills.map((s: string) => (
                        <span key={s} className="px-3 py-1 bg-primary/5 text-primary text-xs font-medium rounded-full border border-primary/10">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCandidateForQuickView.resume_url && (
                  <div className="pt-4 border-t border-border">
                    <a href={selectedCandidateForQuickView.resume_url} target="_blank" rel="noreferrer">
                      <Button variant="outline" className="w-full gap-2 border-primary/20 hover:bg-primary/5 text-primary">
                        <FileText className="w-4 h-4" />
                        عرض السيرة الذاتية (PDF)
                      </Button>
                    </a>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-border bg-card flex items-center gap-3">
                <Link to={`/candidates/${selectedCandidateForQuickView.id}`} className="flex-1">
                  <Button className="w-full gap-2 shadow-md">
                    فتح الملف الشامل والاعتماد <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
