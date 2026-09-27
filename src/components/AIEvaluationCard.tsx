import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, Sparkles, TrendingUp, TrendingDown, Loader2, RefreshCw, Copy, Check, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface AIEvaluation {
  score: number;
  skillsMatchScore?: number;
  experienceMatchScore?: number;
  educationMatchScore?: number;
  culturalFitScore?: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  tailoredInterviewQuestions?: string[];
}

interface AIEvaluationCardProps {
  candidateId?: string;
  candidateName?: string;
  existingScore?: number | null;
  existingEvaluation?: string | null;
  jobId?: string | null;
  candidate?: any;
}

const recommendationColors: Record<string, string> = {
  "مناسب جداً": "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  "مناسب جداً (موصى به بلقطة ممتازة)": "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  "مناسب": "bg-blue-500/10 text-blue-600 border-blue-500/30",
  "مناسب (موصى به للمقابلة)": "bg-blue-500/10 text-blue-600 border-blue-500/30",
  "يحتاج تطوير": "bg-amber-500/10 text-amber-600 border-amber-500/30",
  "يحتاج تطوير وفحص فني": "bg-amber-500/10 text-amber-600 border-amber-500/30",
  "غير مناسب": "bg-rose-500/10 text-rose-600 border-rose-500/30",
};

function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-blue-600 dark:text-blue-400";
  if (score >= 40) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

function getProgressColor(score: number) {
  if (score >= 80) return "[&>div]:bg-emerald-500";
  if (score >= 60) return "[&>div]:bg-blue-500";
  if (score >= 40) return "[&>div]:bg-amber-500";
  return "[&>div]:bg-rose-500";
}

export default function AIEvaluationCard(props: AIEvaluationCardProps) {
  const candidate = props.candidate;
  const candidateId = props.candidateId || candidate?.id || "";
  const candidateName = props.candidateName || candidate?.name || "مرشح";
  const existingScore = props.existingScore ?? candidate?.ai_score ?? null;
  const existingEvaluation = props.existingEvaluation ?? candidate?.ai_evaluation ?? null;
  const jobId = props.jobId ?? candidate?.job_id ?? null;

  const [isLoading, setIsLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [evaluation, setEvaluation] = useState<AIEvaluation | null>(
    existingEvaluation ? (() => { try { return JSON.parse(existingEvaluation); } catch { return null; } })() : null
  );
  const queryClient = useQueryClient();

  const runEvaluation = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke<AIEvaluation>("evaluate-candidate", {
        body: { candidateId, jobId },
      });
      if (error || !data || typeof data.score !== "number") throw error || new Error("تعذر التقييم، حاول لاحقاً");

      setEvaluation(data);

      const qualified = data.score >= 60;
      const newStatus = qualified ? "مؤهل مبدئياً" : "غير مؤهل مبدئياً";
      await supabase
        .from("candidates")
        .update({ status: newStatus })
        .eq("id", candidateId);

      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast({
        title: `تم التقييم الذكي للمرشح ${candidateName} ✅`,
        description: `نسبة التطابق الكلية: ${data.score}% — ${data.recommendation}`,
      });
    } catch (e: any) {
      toast({ title: "خطأ في التقييم", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyQuestion = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast({ title: "تم نسخ سؤال المقابلة 📋" });
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (!evaluation) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-5 border border-border/80 shadow-xs space-y-4" dir="rtl">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm flex items-center gap-2 text-foreground">
            <Brain className="w-4 h-4 text-emerald-500" />
            التقييم الفائق بالذكاء الاصطناعي
          </h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          تشغيل التحليل الفائق بالذكاء الاصطناعي: استخراج مصفوفة المطابقة الرباعية، تحديد نقاط القوة والفجوات، وتوليد أسئلة التقييم المخصصة.
        </p>
        <Button onClick={runEvaluation} disabled={isLoading}
          className="w-full gap-2 rounded-xl h-11 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20">
          {isLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" />جاري التحليل والفرز الفائق...</>
          ) : (
            <><Sparkles className="w-4 h-4" />تشغيل التقييم والفرز الفائق بالذكاء الاصطناعي</>
          )}
        </Button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-5 space-y-5 border border-border/80 shadow-xs" dir="rtl">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm flex items-center gap-2 text-foreground">
            <Brain className="w-4.5 h-4.5 text-emerald-500" />
            التقييم والتحليل الذكي الفائق
          </h3>
          <Button variant="ghost" size="sm" onClick={runEvaluation} disabled={isLoading} className="gap-1.5 text-xs font-bold rounded-xl h-9">
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />}
            إعادة التقييم
          </Button>
        </div>

        {/* Total Score Header */}
        <div className="text-center py-3 bg-muted/30 rounded-2xl border border-border/60">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}
            className={cn("text-4xl font-black tabular-nums", getScoreColor(evaluation.score))}>
            {evaluation.score}%
          </motion.div>
          <p className="text-xs font-bold text-muted-foreground mt-1">نسبة التوافق والمطابقة الكلية</p>
          <Progress value={evaluation.score} className={cn("h-2.5 mt-2.5 mx-6", getProgressColor(evaluation.score))} />
        </div>

        {/* Multi-Dimensional Scores Grid */}
        {(evaluation.skillsMatchScore != null || evaluation.experienceMatchScore != null) && (
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-xl bg-card border border-border/60 text-center">
              <span className="text-[10px] font-bold text-muted-foreground">مطابقة المهارات</span>
              <div className="text-base font-extrabold text-foreground mt-0.5">{evaluation.skillsMatchScore ?? evaluation.score}%</div>
            </div>
            <div className="p-2.5 rounded-xl bg-card border border-border/60 text-center">
              <span className="text-[10px] font-bold text-muted-foreground">مطابقة الخبرة</span>
              <div className="text-base font-extrabold text-foreground mt-0.5">{evaluation.experienceMatchScore ?? evaluation.score}%</div>
            </div>
            <div className="p-2.5 rounded-xl bg-card border border-border/60 text-center">
              <span className="text-[10px] font-bold text-muted-foreground">المؤهل العلمي</span>
              <div className="text-base font-extrabold text-foreground mt-0.5">{evaluation.educationMatchScore ?? 85}%</div>
            </div>
            <div className="p-2.5 rounded-xl bg-card border border-border/60 text-center">
              <span className="text-[10px] font-bold text-muted-foreground">التوافق التنظيمي</span>
              <div className="text-base font-extrabold text-foreground mt-0.5">{evaluation.culturalFitScore ?? 80}%</div>
            </div>
          </div>
        )}

        {/* Recommendation */}
        <div className="text-center">
          <Badge variant="outline" className={cn("px-3 py-1 text-xs font-bold rounded-xl border",
            recommendationColors[evaluation.recommendation] || "bg-muted text-muted-foreground border-border")}>
            {evaluation.recommendation}
          </Badge>
        </div>

        {/* Summary */}
        <p className="text-xs text-foreground leading-relaxed bg-card p-3 rounded-xl border border-border/60">
          {evaluation.summary}
        </p>

        {/* Strengths */}
        <div>
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />أهم نقاط القوة البارزة
          </h4>
          <ul className="space-y-1.5">
            {evaluation.strengths.map((s, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="text-xs text-muted-foreground flex items-start gap-2 bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                {s}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div>
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-2">
            <TrendingDown className="w-3.5 h-3.5 text-amber-500" />الفجوات والمخاطر الفنية المتوقعة
          </h4>
          <ul className="space-y-1.5">
            {evaluation.weaknesses.map((w, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="text-xs text-muted-foreground flex items-start gap-2 bg-amber-500/5 p-2 rounded-xl border border-amber-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                {w}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Tailored AI Interview Questions */}
        {evaluation.tailoredInterviewQuestions && evaluation.tailoredInterviewQuestions.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/60">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />أسئلة المقابلة المخصصة لسيرة هذا المرشح
            </h4>
            <div className="space-y-2">
              {evaluation.tailoredInterviewQuestions.map((q, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/15 flex items-center justify-between gap-2">
                  <p className="text-xs text-foreground font-medium leading-relaxed">{q}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyQuestion(q, i)}
                    className="h-7 px-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0 gap-1 rounded-lg hover:bg-indigo-500/10"
                  >
                    {copiedIdx === i ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {copiedIdx === i ? "تم النسخ" : "نسخ"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
