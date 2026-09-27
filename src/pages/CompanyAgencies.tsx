import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Building2, Plus, Users, Mail, Phone, MapPin, ShieldCheck, Key, Copy, Check, Eye, Trash2, Edit3, Loader2, Sparkles, ExternalLink, RefreshCw, AlertTriangle, UserPlus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAgencyCandidates, useUpdateAgency, useDeleteAgency } from "@/hooks/useAgencies";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function CompanyAgencies() {
  const { user } = useAuth();
  const qc = useQueryClient();
  
  // Dialog States
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedAgencyDetails, setSelectedAgencyDetails] = useState<any | null>(null);
  const [selectedAgencyForEdit, setSelectedAgencyForEdit] = useState<any | null>(null);
  const [selectedAgencyForDelete, setSelectedAgencyForDelete] = useState<any | null>(null);

  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; name: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    country: "المملكة العربية السعودية",
    city: "الرياض",
    licenseNumber: "",
    notes: ""
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    licenseNumber: "",
    status: "active",
    notes: ""
  });

  // Query company ID of current logged in user
  const companyQuery = useQuery({
    queryKey: ["my-company-id", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("company_members")
        .select("company_id")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data?.company_id || null;
    },
    enabled: !!user,
  });

  const companyId = companyQuery.data;

  // Query assigned agencies for current company & direct agencies
  const agenciesQuery = useQuery({
    queryKey: ["company-agencies", companyId, user?.id],
    queryFn: async () => {
      const { data: directAgencies, error: directErr } = await supabase
        .from("agencies" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (!directErr && directAgencies && directAgencies.length > 0) {
        return directAgencies as any[];
      }

      if (companyId) {
        const { data: assignments } = await supabase
          .from("agency_assignments" as any)
          .select("*, agency:agency_id(*)")
          .eq("company_id", companyId)
          .order("created_at", { ascending: false });
        if (assignments) {
          return assignments.map((row: any) => ({
            assignment_id: row.id,
            status: row.status,
            ...row.agency
          }));
        }
      }

      return [];
    },
    enabled: !!user,
  });

  const agencies = agenciesQuery.data || [];

  // Create an agency through the authenticated, company-scoped server function.
  const handleAddAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !companyId) {
      toast({ title: "يرجى تعبئة كافة الحقول الأساسية", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-agency-account", {
        body: { action: "create", companyId, ...form },
      });
      if (error || !data?.success) throw error || new Error(data?.error || "فشل إرسال الدعوة");

      setCreatedCredentials({
        email: form.email.trim().toLowerCase(),
        name: form.name
      });

      qc.invalidateQueries({ queryKey: ["company-agencies"] });
      toast({ title: "تمت إضافة المكتب وإرسال دعوة الدخول عبر البريد ✅" });
      setOpenAddDialog(false);
      setForm({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        country: "المملكة العربية السعودية",
        city: "الرياض",
        licenseNumber: "",
        notes: ""
      });
    } catch (err: any) {
      toast({ title: "خطأ في إضافة المكتب", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Dialog
  const handleOpenEdit = (agency: any) => {
    setSelectedAgencyForEdit(agency);
    setEditForm({
      id: agency.id,
      name: agency.name || "",
      contactPerson: agency.contact_person || agency.name || "",
      email: agency.contact_email || "",
      phone: agency.contact_phone || "",
      country: agency.country || "المملكة العربية السعودية",
      city: agency.city || "الرياض",
      licenseNumber: agency.license_number || "",
      status: agency.status || "active",
      notes: (agency.notes || "").replace(/\[PASS:[^\]]*\]/gi, "").trim()
    });
    setOpenEditDialog(true);
  };

  // Save Edit Agency
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name || !editForm.email) {
      toast({ title: "يرجى تعبئة الحقول الأساسية", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-agency-account", {
        body: { action: "update", agencyId: editForm.id, companyId, ...editForm },
      });
      if (error || !data?.success) throw error || new Error(data?.error || "فشل تحديث المكتب");

      qc.invalidateQueries({ queryKey: ["company-agencies"] });
      toast({ title: "تم تحديث بيانات مكتب التوظيف بنجاح ✅" });
      setOpenEditDialog(false);
      if (selectedAgencyDetails?.id === editForm.id) {
        setSelectedAgencyDetails(prev => ({ ...prev, ...editForm }));
      }
    } catch (err: any) {
      toast({ title: "خطأ في التحديث", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Confirmation
  const handleOpenDelete = (agency: any) => {
    setSelectedAgencyForDelete(agency);
    setOpenDeleteDialog(true);
  };

  // Confirm Delete Agency
  const handleDeleteAgency = async () => {
    if (!selectedAgencyForDelete) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-agency-account", {
        body: { action: "remove", companyId, agencyId: selectedAgencyForDelete.id },
      });
      if (error || !data?.success) throw error || new Error(data?.error || "تعذر إزالة المكتب");

      qc.invalidateQueries({ queryKey: ["company-agencies"] });
      toast({ title: "تمت إزالة المكتب من شركتك بنجاح ✅" });
      setOpenDeleteDialog(false);
      if (selectedAgencyDetails?.id === selectedAgencyForDelete.id) {
        setSelectedAgencyDetails(null);
      }
    } catch (err: any) {
      toast({ title: "خطأ في الحذف", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `دعوة مكتب التوظيف (${createdCredentials.name}):\nالبريد الإلكتروني: ${createdCredentials.email}\nرابط الدخول: ${window.location.origin}/auth?role=agency`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "تم نسخ بيانات الدخول للأن حافظة ✅" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-indigo-500/5 to-purple-500/10 p-6 rounded-3xl border border-primary/20 shadow-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>إدارة مكاتب التوظيف والعمل الخارجي والداخلي</span>
            </div>
            <h1 className="text-2xl font-black text-foreground">مكاتب العمل المزودة للشركة</h1>
            <p className="text-sm text-muted-foreground">إدارة وتسجيل مكاتب التوظيف الخارجية وتوفير حسابات دخول مخصصة لها بالنظام لرفع وتزويد المرشحين.</p>
          </div>

          <Button 
            onClick={() => setOpenAddDialog(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl h-11 px-5 font-bold text-sm gap-2 shadow-md shrink-0"
          >
            <Plus className="w-4 h-4" />
            إضافة مكتب عمل / توظيف جديد ➕
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="rounded-2xl border border-border/60">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">إجمالي المكاتب المعينة</p>
                <h3 className="text-2xl font-black text-foreground mt-0.5">{agencies.length}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/60">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">المكاتب النشطة بالنظام</p>
                <h3 className="text-2xl font-black text-foreground mt-0.5">{agencies.filter(a => a.status === "active").length}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/60">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">حسابات الدخول المجهزة</p>
                <h3 className="text-2xl font-black text-foreground mt-0.5">{agencies.length}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Offices List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            قائمة مكاتب التوظيف المعتمدة ({agencies.length})
          </h2>

          {agencies.length === 0 ? (
            <Card className="p-12 text-center rounded-3xl border border-dashed border-border/60 bg-muted/20">
              <Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="text-base font-bold text-foreground mb-1">لا يوجد مكاتب توظيف مضافة لشركتك بعد</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mb-4">
                قم بإضافة مكاتب التوظيف والعمل الخارجي المزودة لشركتك، وسيتم إنشاء اسم مستخدم وكلمة مرور للمكتب فوراً لدخول النظام ورفع المرشحين.
              </p>
              <Button onClick={() => setOpenAddDialog(true)} className="rounded-xl h-10 px-4 text-xs font-bold gap-2">
                <Plus className="w-4 h-4" />
                إضافة أول مكتب توظيف الآن
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agencies.map((agency, idx) => (
                <motion.div key={agency.id || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <Card className="rounded-2xl border border-border/60 hover:border-primary/40 hover:shadow-md transition-all relative overflow-hidden group cursor-pointer" onClick={() => setSelectedAgencyDetails(agency)}>
                    <div className="p-5 space-y-4">
                      
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/10 to-indigo-500/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                            {agency.name ? agency.name.charAt(0) : "م"}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-foreground leading-snug group-hover:text-primary transition-colors flex items-center gap-1.5">
                              {agency.name}
                              <Eye className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </h3>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              {agency.country || "السعودية"} {agency.city ? `- ${agency.city}` : ""}
                            </p>
                          </div>
                        </div>
                        <Badge variant={agency.status === "active" ? "default" : "secondary"} className="text-[10px] rounded-full">
                          {agency.status === "active" ? "نشط" : "معطل"}
                        </Badge>
                      </div>

                      {/* Info Box */}
                      <div className="space-y-1.5 p-3 rounded-xl bg-muted/30 border border-border/40 text-xs font-mono" dir="ltr">
                        <p className="flex items-center gap-2 truncate">
                          <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="font-sans text-[11px] font-bold text-muted-foreground">Email:</span>
                          <span className="truncate">{agency.contact_email || "غير محدد"}</span>
                        </p>
                        {agency.contact_phone && (
                          <p className="flex items-center gap-2 truncate">
                            <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="font-sans text-[11px] font-bold text-muted-foreground">Phone:</span>
                            <span>{agency.contact_phone}</span>
                          </p>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs" onClick={e => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedAgencyDetails(agency)}
                          className="h-8 px-2.5 text-xs font-bold text-primary hover:bg-primary/10 gap-1 rounded-lg"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          التفاصيل الكاملة
                        </Button>

                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenEdit(agency)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                            title="تعديل المكتب"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenDelete(agency)}
                            className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg"
                            title="حذف المكتب"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Agency Full Screen Details View Modal */}
        {selectedAgencyDetails && (
          <Dialog open={!!selectedAgencyDetails} onOpenChange={() => setSelectedAgencyDetails(null)}>
            <DialogContent className="max-w-4xl rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
              <DialogHeader className="text-right space-y-2 border-b border-border/40 pb-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-indigo-500/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
                      {selectedAgencyDetails.name ? selectedAgencyDetails.name.charAt(0) : "م"}
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-black text-foreground flex items-center gap-2">
                        {selectedAgencyDetails.name}
                        <Badge variant={selectedAgencyDetails.status === "active" ? "default" : "secondary"} className="text-xs">
                          {selectedAgencyDetails.status === "active" ? "نشط" : "معطل"}
                        </Badge>
                      </DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                        تفاصيل مكتب التوظيف والعمالة المزودة، وحساب الدخول والسير الذاتية المرفوعة
                      </DialogDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(selectedAgencyDetails)}
                      className="rounded-xl h-9 text-xs font-bold gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      تعديل البيانات
                    </Button>
                    <Button 
                      variant="destructive"
                      size="sm"
                      onClick={() => handleOpenDelete(selectedAgencyDetails)}
                      className="rounded-xl h-9 text-xs font-bold gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      حذف المكتب
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              {/* Full Details Content */}
              <AgencyDetailTabContent agency={selectedAgencyDetails} onEditPass={() => handleOpenEdit(selectedAgencyDetails)} />
            </DialogContent>
          </Dialog>
        )}

        {/* Add New Agency Dialog */}
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogContent className="sm:max-w-md rounded-3xl p-6">
            <DialogHeader className="text-right space-y-1">
              <DialogTitle className="text-lg font-black flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                إضافة مكتب توظيف / عمل جديد
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                أدخل تفاصيل مكتب العمل وسيتم إنشاء حساب دخول مخصص (Email + Password) للمكتب فوراً.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddAgency} className="space-y-4 text-right pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="agencyName" className="text-xs font-bold">اسم مكتب العمل / التوظيف *</Label>
                <Input 
                  id="agencyName" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  placeholder="مثال: مكتب الأمانة للتوظيف الدولي" 
                  required 
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="contactPerson" className="text-xs font-bold">اسم المسؤول / جهة الاتصال</Label>
                  <Input 
                    id="contactPerson" 
                    value={form.contactPerson} 
                    onChange={e => setForm({...form, contactPerson: e.target.value})} 
                    placeholder="أ/ محمود السيد" 
                    className="rounded-xl h-10 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-bold">رقم الجوال / الواتساب</Label>
                  <Input 
                    id="phone" 
                    value={form.phone} 
                    onChange={e => setForm({...form, phone: e.target.value})} 
                    placeholder="966XXXXXXXXX+" 
                    className="rounded-xl h-10 text-xs"
                  />
                </div>
              </div>

              {/* Login Credentials Setup */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-primary/5 via-indigo-500/5 to-purple-500/5 border border-primary/20 space-y-3">
                <div className="flex items-center gap-1.5 text-primary font-black text-xs">
                  <Key className="w-4 h-4" />
                  <span>تجهيز حساب دخول المكتب بالنظام (Login Credentials)</span>
                </div>

                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="agencyEmail" className="text-xs font-bold">البريد الإلكتروني للدخول (Email) *</Label>
                    <Input 
                      id="agencyEmail" 
                      type="email"
                      value={form.email} 
                      onChange={e => setForm({...form, email: e.target.value})} 
                      placeholder="office@agency.com" 
                      required 
                      className="rounded-xl h-9 text-xs dir-ltr font-mono"
                    />
                  </div>

                  <p className="text-xs text-muted-foreground self-center">هيتم إرسال دعوة للبريد الإلكتروني عشان مسؤول المكتب يختار كلمة مروره بنفسه.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="country" className="text-xs font-bold">الدولة</Label>
                  <Input 
                    id="country" 
                    value={form.country} 
                    onChange={e => setForm({...form, country: e.target.value})} 
                    placeholder="مصر / السعودية / الهند..." 
                    className="rounded-xl h-10 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="license" className="text-xs font-bold">رقم الترخيص / السجل</Label>
                  <Input 
                    id="license" 
                    value={form.licenseNumber} 
                    onChange={e => setForm({...form, licenseNumber: e.target.value})} 
                    placeholder="مثال: LIC-99821" 
                    className="rounded-xl h-10 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-bold">ملاحظات وشروط التعامل</Label>
                <Textarea 
                  id="notes" 
                  value={form.notes} 
                  onChange={e => setForm({...form, notes: e.target.value})} 
                  placeholder="ملاحظات حول التخصصات أو الضمانات المزودة..." 
                  className="rounded-xl h-20 text-xs"
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpenAddDialog(false)} className="rounded-xl h-10 text-xs font-bold">
                  إلغاء
                </Button>
                <Button type="submit" disabled={isSubmitting} className="rounded-xl h-10 text-xs font-bold gap-2 bg-primary">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  {isSubmitting ? "جاري الإنشاء..." : "حفظ وإنشاء الحساب للمكتب 🚀"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Agency Dialog */}
        <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
          <DialogContent className="sm:max-w-md rounded-3xl p-6">
            <DialogHeader className="text-right space-y-1">
              <DialogTitle className="text-lg font-black flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-primary" />
                تعديل بيانات مكتب التوظيف
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                يمكنك تحديث البيانات الأساسية؛ تغيير كلمة المرور متاح لصاحب الحساب عبر استعادة كلمة المرور.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-right pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="editAgencyName" className="text-xs font-bold">اسم المكتب *</Label>
                <Input 
                  id="editAgencyName" 
                  value={editForm.name} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})} 
                  required 
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="editContactPerson" className="text-xs font-bold">اسم المسؤول</Label>
                  <Input 
                    id="editContactPerson" 
                    value={editForm.contactPerson} 
                    onChange={e => setEditForm({...editForm, contactPerson: e.target.value})} 
                    className="rounded-xl h-10 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editPhone" className="text-xs font-bold">رقم الجوال</Label>
                  <Input 
                    id="editPhone" 
                    value={editForm.phone} 
                    onChange={e => setEditForm({...editForm, phone: e.target.value})} 
                    className="rounded-xl h-10 text-xs"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/40 space-y-2">
                <Label htmlFor="editEmail" className="text-xs font-bold">البريد الإلكتروني للدخول</Label>
                <Input 
                  id="editEmail" 
                  type="email"
                  value={editForm.email} 
                  readOnly
                  className="rounded-xl h-9 text-xs dir-ltr font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="editCountry" className="text-xs font-bold">الدولة</Label>
                  <Input 
                    id="editCountry" 
                    value={editForm.country} 
                    onChange={e => setEditForm({...editForm, country: e.target.value})} 
                    className="rounded-xl h-10 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editLicense" className="text-xs font-bold">رقم الترخيص</Label>
                  <Input 
                    id="editLicense" 
                    value={editForm.licenseNumber} 
                    onChange={e => setEditForm({...editForm, licenseNumber: e.target.value})} 
                    className="rounded-xl h-10 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editNotes" className="text-xs font-bold">ملاحظات</Label>
                <Textarea 
                  id="editNotes" 
                  value={editForm.notes} 
                  onChange={e => setEditForm({...editForm, notes: e.target.value})} 
                  className="rounded-xl h-20 text-xs"
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpenEditDialog(false)} className="rounded-xl h-10 text-xs font-bold">
                  إلغاء
                </Button>
                <Button type="submit" disabled={isSubmitting} className="rounded-xl h-10 text-xs font-bold gap-2 bg-primary">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  {isSubmitting ? "جاري الحفظ..." : "حفظ التعديلات ✅"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <DialogContent className="sm:max-w-md rounded-3xl p-6 text-right">
            <DialogHeader className="text-right space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-1">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <DialogTitle className="text-lg font-black text-foreground">
                تأكيد إزالة مكتب التوظيف
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                سيتم فصل مكتب <strong>{selectedAgencyForDelete?.name}</strong> عن شركتك. لن تُحذف بيانات المكتب أو حسابه إذا كان يعمل مع شركات أخرى.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2 sm:gap-0 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpenDeleteDialog(false)} className="rounded-xl h-10 text-xs font-bold">
                إلغاء
              </Button>
              <Button type="button" onClick={handleDeleteAgency} disabled={isSubmitting} className="rounded-xl h-10 text-xs font-bold gap-2 bg-rose-600 hover:bg-rose-700 text-white">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                تأكيد إزالة المكتب
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Credentials Popup Modal */}
        {createdCredentials && (
          <Dialog open={!!createdCredentials} onOpenChange={() => setCreatedCredentials(null)}>
            <DialogContent className="sm:max-w-md rounded-3xl p-6 text-right space-y-4">
              <DialogHeader className="text-right space-y-1">
                <DialogTitle className="text-lg font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  تم تجهيز حساب دخول مكتب العمل بنجاح! 🎉
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  اتبعتت دعوة إلى بريد مسؤول مكتب <strong>{createdCredentials.name}</strong> ليحدد كلمة مروره.
                </DialogDescription>
              </DialogHeader>

              <div className="p-4 rounded-2xl bg-card border-2 border-emerald-500/30 space-y-2 font-mono text-xs shadow-sm" dir="ltr">
                <p><strong className="font-sans text-foreground">Email:</strong> {createdCredentials.email}</p>
                <p className="text-[11px] text-muted-foreground font-sans pt-1">
                  <strong>Login Link:</strong> {window.location.origin}/auth?role=agency
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleCopyCredentials} className="w-full rounded-xl h-10 text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "تم النسخ بنجاح!" : "نسخ البريد ورابط الدخول 📋"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

      </div>
    </DashboardLayout>
  );
}

// Inner Component for Agency Full Screen Details View
function AgencyDetailTabContent({ agency, onEditPass }: { agency: any; onEditPass: () => void }) {
  const { data: candidates = [], isLoading } = useAgencyCandidates(agency.id);

  const handleCopyLink = () => {
    const text = `بيانات دخول مكتب التوظيف (${agency.name}):\nالبريد الإلكتروني: ${agency.contact_email}\nرابط الدخول: ${window.location.origin}/auth?role=agency`;
    navigator.clipboard.writeText(text);
    toast({ title: "تم نسخ بيانات الدخول للأن حافظة ✅" });
  };

  return (
    <div className="space-y-6 pt-3 text-right">
      
      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/40 space-y-0.5">
          <p className="text-[11px] text-muted-foreground font-semibold">مسؤول التواصل</p>
          <p className="text-xs font-bold text-foreground">{agency.contact_person || agency.name || "غير محدد"}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/40 space-y-0.5">
          <p className="text-[11px] text-muted-foreground font-semibold">رقم الجوال / الواتساب</p>
          <p className="text-xs font-bold text-foreground" dir="ltr">{agency.contact_phone || "غير محدد"}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/40 space-y-0.5">
          <p className="text-[11px] text-muted-foreground font-semibold">الدولة والمدينة</p>
          <p className="text-xs font-bold text-foreground">{agency.country || "السعودية"} {agency.city ? `- ${agency.city}` : ""}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/40 space-y-0.5">
          <p className="text-[11px] text-muted-foreground font-semibold">رقم الترخيص</p>
          <p className="text-xs font-bold text-foreground">{agency.license_number || "غير محدد"}</p>
        </div>
      </div>

      {/* Credentials Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-indigo-500/5 to-purple-500/10 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs">
            <Key className="w-4 h-4" />
            <span>بيانات حساب دخول المكتب بالنظام</span>
          </div>
          <p className="text-xs text-muted-foreground font-mono" dir="ltr">
            Email: <strong className="text-foreground">{agency.contact_email}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={handleCopyLink} className="rounded-xl text-xs font-bold gap-1.5 h-9">
            <Copy className="w-3.5 h-3.5" />
            نسخ بيانات الدخول
          </Button>
          <Button size="sm" onClick={onEditPass} className="rounded-xl text-xs font-bold gap-1.5 h-9 bg-primary">
            <RefreshCw className="w-3.5 h-3.5" />
            تغيير كلمة المرور
          </Button>
        </div>
      </div>

      {/* Candidates Provided Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            المرشحون المزوّدون بواسطة هذا المكتب ({candidates.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
        ) : candidates.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-muted/20 border border-dashed border-border/40 space-y-1">
            <Users className="w-8 h-8 text-muted-foreground/40 mx-auto" />
            <p className="text-xs text-muted-foreground">لم يرفع هذا المكتب أي مرشحين حتى الآن.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {candidates.map((c: any, i: number) => (
              <div key={c.id || i} className="flex items-center justify-between p-3.5 rounded-2xl border border-border/40 bg-card hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                    {c.name ? c.name.charAt(0) : "م"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-foreground truncate">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{c.role || c.email}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {c.stage || c.status || "جديد"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {agency.notes && (
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 space-y-1">
          <p className="text-xs font-bold text-foreground">ملاحظات وشروط التعامل:</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{agency.notes}</p>
        </div>
      )}

    </div>
  );
}
