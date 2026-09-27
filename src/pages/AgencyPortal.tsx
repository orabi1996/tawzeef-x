import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Building2, Users, Plus, UploadCloud, FileText, CheckCircle2, ShieldCheck, Mail, Phone, MapPin, ExternalLink, Loader2, Sparkles, UserPlus } from "lucide-react";
import { useMyAgencies, useAgencyCandidates } from "@/hooks/useAgencies";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export default function AgencyPortal() {
  const { data: agencies = [], isLoading } = useMyAgencies();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [openSubmitCandidate, setOpenSubmitCandidate] = useState(false);
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  // Candidate Submission Form State
  const [candForm, setCandForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    resumeUrl: "",
    notes: ""
  });

  const handleUploadCandidateResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    try {
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      const filePath = `agency_${user!.id}/cand_${crypto.randomUUID()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("resumes")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadErr) throw uploadErr;

      setCandForm(prev => ({ ...prev, resumeUrl: filePath }));
      toast({ title: "تم رفع السيرة الذاتية بنجاح 📁" });
    } catch (err: any) {
      toast({ title: "خطأ في رفع الملف", description: err.message, variant: "destructive" });
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmitCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candForm.name || !candForm.email || !selectedAgencyId) {
      toast({ title: "يرجى تعبئة الحقول الأساسية لمرشح المكتب", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("submit-agency-candidate", {
        body: { agencyId: selectedAgencyId, ...candForm },
      });
      if (error || !data?.success) throw error || new Error(data?.error || "تعذر رفع المرشح");

      qc.invalidateQueries({ queryKey: ["agency-candidates"] });
      toast({ title: "تم رفع وتوفير المرشح للشركة بنجاح! 🚀" });
      setOpenSubmitCandidate(false);
      setCandForm({ name: "", email: "", phone: "", role: "", resumeUrl: "", notes: "" });
    } catch (err: any) {
      toast({ title: "خطأ في تقديم المرشح", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (agencies.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-3xl mx-auto space-y-4">
          <Card className="p-12 text-center rounded-3xl border border-dashed border-border/60">
            <Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-foreground mb-2">أنت غير منتمٍ لأي مكتب توظيف بعد</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              يرجى التواصل مع إدارة الشركة أو مسؤول النظام لربط حسابك بمكتب توظيف تظهَر لك مرشحاته ووظائفه المسندة.
            </p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-indigo-500/10 p-6 rounded-3xl border border-emerald-500/20 shadow-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>بوابة مكاتب التوظيف والعمل المزودة</span>
            </div>
            <h1 className="text-2xl font-black text-foreground">بوابة مكتب العمل والتوظيف</h1>
            <p className="text-sm text-muted-foreground">استعراض الوظائف المطلوبة من الشركات، ورفع وتوفير السير الذاتية للمرشحين مباشرة.</p>
          </div>

          <Button
            onClick={() => {
              setSelectedAgencyId(agencies[0]?.id || "");
              setOpenSubmitCandidate(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-11 px-5 font-bold text-sm gap-2 shadow-md shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            رفع وتقديم مرشح جديد للشركة ➕
          </Button>
        </div>

        {/* Agency Cards */}
        {agencies.map((agency) => (
          <AgencySection 
            key={agency.id} 
            agencyId={agency.id} 
            agencyName={agency.name} 
            onOpenSubmit={() => {
              setSelectedAgencyId(agency.id);
              setOpenSubmitCandidate(true);
            }}
          />
        ))}

        {/* Submit Candidate Dialog */}
        <Dialog open={openSubmitCandidate} onOpenChange={setOpenSubmitCandidate}>
          <DialogContent className="sm:max-w-md rounded-3xl p-6">
            <DialogHeader className="text-right space-y-1">
              <DialogTitle className="text-lg font-black flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                تزويد مرشح / موظف جديد لشركة العملاء
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                أدخل بيانات المرشح والسيرة الذاتية وسيتم إدراجه فوراً في مسار التوظيف لدى الشركة.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitCandidate} className="space-y-4 text-right pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="candName" className="text-xs font-bold">اسم المرشح الكامل *</Label>
                <Input
                  id="candName"
                  value={candForm.name}
                  onChange={e => setCandForm({...candForm, name: e.target.value})}
                  placeholder="مثال: المهندس أحمد علي"
                  required
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="candEmail" className="text-xs font-bold">البريد الإلكتروني للمرشح *</Label>
                  <Input
                    id="candEmail"
                    type="email"
                    value={candForm.email}
                    onChange={e => setCandForm({...candForm, email: e.target.value})}
                    placeholder="candidate@example.com"
                    required
                    className="rounded-xl h-10 text-xs dir-ltr font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="candPhone" className="text-xs font-bold">رقم الجوال</Label>
                  <Input
                    id="candPhone"
                    value={candForm.phone}
                    onChange={e => setCandForm({...candForm, phone: e.target.value})}
                    placeholder="966XXXXXXXXX+"
                    className="rounded-xl h-10 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="candRole" className="text-xs font-bold">المسمى الوظيفي المطلوب</Label>
                <Input
                  id="candRole"
                  value={candForm.role}
                  onChange={e => setCandForm({...candForm, role: e.target.value})}
                  placeholder="مثال: مهندس شبكات / محاسب قانوني"
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              {/* Resume File Upload */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">ملف السيرة الذاتية (CV)</Label>
                <div className="relative border-2 border-dashed border-border hover:border-emerald-500 rounded-2xl p-4 text-center bg-muted/20 transition-colors">
                  <UploadCloud className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs font-semibold text-foreground">اضغط لرفع السيرة الذاتية (PDF / Word)</p>
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleUploadCandidateResume} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {uploadingResume && <p className="text-[11px] text-emerald-600 font-bold mt-1">جاري الرفع...</p>}
                  {candForm.resumeUrl && <p className="text-[11px] text-emerald-600 font-bold mt-1">✓ تم رفع السيرة الذاتية</p>}
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpenSubmitCandidate(false)} className="rounded-xl h-10 text-xs font-bold">
                  إلغاء
                </Button>
                <Button type="submit" disabled={submitting} className="rounded-xl h-10 text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  {submitting ? "جاري التزويد..." : "إرسال المرشح للشركة 🚀"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}

function AgencySection({ agencyId, agencyName, onOpenSubmit }: { agencyId: string; agencyName: string; onOpenSubmit: () => void }) {
  const { data: candidates = [] } = useAgencyCandidates(agencyId);

  return (
    <Card className="p-6 rounded-3xl border border-border/60 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 font-bold text-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">{agencyName}</h2>
            <p className="text-xs text-muted-foreground">مكتب توظيف معتمد لمزودي العمالة والخبرات</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs rounded-full px-3 py-1">
            {candidates.length} مرشح مزوّد
          </Badge>
          <Button size="sm" onClick={onOpenSubmit} className="rounded-xl text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white h-9">
            <UserPlus className="w-3.5 h-3.5" />
            إضافة مرشح جديد
          </Button>
        </div>
      </div>

      {/* Candidates List */}
      <div>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
          المرشحون المزوّدون بواسطة المكتب ({candidates.length})
        </h3>

        {candidates.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-muted/20 border border-dashed border-border/40 space-y-2">
            <Users className="w-8 h-8 text-muted-foreground/40 mx-auto" />
            <p className="text-xs text-muted-foreground">لم يتم إضافة مرشحين عبر هذا المكتب حتى الآن.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {candidates.map((c, i) => (
              <motion.div key={c.id || i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Link
                  to={`/candidates/${c.id}`}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-border/50 bg-card hover:bg-muted/30 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold shrink-0">
                      {c.name ? c.name.charAt(0) : "م"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-foreground truncate group-hover:text-emerald-600 transition-colors">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.role || c.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className="text-[10px]">
                      {c.stage || c.status || "تقديم الطلب"}
                    </Badge>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
