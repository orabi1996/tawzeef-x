import { useState, type FormEvent } from "react";
import { Building2, Mail, Phone, Send, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type QuotePlan = {
  name: string;
  name_ar: string;
  price: number;
  currency: string;
  job_posts_limit: number;
};

type QuoteRequestDialogProps = {
  plan: QuotePlan | null;
  onClose: () => void;
};

export default function QuoteRequestDialog({ plan, onClose }: QuoteRequestDialogProps) {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    hiringVolume: "",
    requirements: "",
  });

  if (!plan) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = [
      "طلب عرض سعر من موقع Tawzeef-X",
      "",
      `الباقة المطلوبة: ${plan.name_ar || plan.name}`,
      `الاسم: ${form.name}`,
      `المنشأة: ${form.company}`,
      `البريد الإلكتروني: ${form.email}`,
      `رقم الجوال: ${form.phone}`,
      `حجم التوظيف المتوقع: ${form.hiringVolume || "غير محدد"}`,
      "",
      "الاحتياجات الإضافية:",
      form.requirements || "لا توجد تفاصيل إضافية",
    ].join("\n");

    const subject = encodeURIComponent(`طلب عرض سعر - ${plan.name_ar || plan.name}`);
    window.location.href = `mailto:tawzeefx@outlook.com?subject=${subject}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-request-title"
        dir="rtl"
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-background p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق نافذة طلب عرض السعر"
          className="absolute left-5 top-5 rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 pl-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
            <Building2 className="h-4 w-4" />
            {plan.name_ar || plan.name}
          </div>
          <h2 id="quote-request-title" className="text-2xl font-black text-foreground sm:text-3xl">
            اطلب عرض سعر مناسب لمنشأتك
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            أرسل بيانات التواصل واحتياجك، وسيتواصل معك الفريق عبر البريد الإلكتروني أو الجوال لمناقشة التفاصيل وإرسال العرض.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm font-semibold text-foreground">
              الاسم الكامل
              <Input required autoFocus autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
            <label className="space-y-1.5 text-sm font-semibold text-foreground">
              اسم المنشأة
              <Input required autoComplete="organization" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} />
            </label>
            <label className="space-y-1.5 text-sm font-semibold text-foreground">
              البريد الإلكتروني
              <span className="relative block">
                <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input required type="email" autoComplete="email" className="pr-10" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </span>
            </label>
            <label className="space-y-1.5 text-sm font-semibold text-foreground">
              رقم الجوال
              <span className="relative block">
                <Phone className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input required type="tel" autoComplete="tel" inputMode="tel" pattern="[0-9+\\s().-]{8,20}" title="أدخل رقم جوال صحيحاً" className="pr-10" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
              </span>
            </label>
          </div>

          <label className="block space-y-1.5 text-sm font-semibold text-foreground">
            حجم التوظيف المتوقع
            <span className="relative block">
              <Users className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={form.hiringVolume}
                onChange={(event) => setForm({ ...form, hiringVolume: event.target.value })}
                className="h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">اختر الحجم (اختياري)</option>
                <option value="حتى 10 موظفين سنوياً">حتى 10 موظفين سنوياً</option>
                <option value="11–50 موظفاً سنوياً">11–50 موظفاً سنوياً</option>
                <option value="51–200 موظف سنوياً">51–200 موظف سنوياً</option>
                <option value="أكثر من 200 موظف سنوياً">أكثر من 200 موظف سنوياً</option>
              </select>
            </span>
          </label>

          <label className="block space-y-1.5 text-sm font-semibold text-foreground">
            ما احتياج منشأتك؟
            <Textarea
              rows={3}
              placeholder="مثال: عدد الوظائف أو الفروع، وأي تكاملات أو خدمات إضافية تحتاجها"
              value={form.requirements}
              onChange={(event) => setForm({ ...form, requirements: event.target.value })}
            />
          </label>

          <div className="rounded-xl bg-muted/60 p-3 text-xs leading-5 text-muted-foreground">
            عند الإرسال سيفتح تطبيق البريد لديك برسالة جاهزة إلى فريق Tawzeef-X. راجع الرسالة واضغط إرسال لإتمام الطلب.
          </div>

          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
              إلغاء
            </Button>
            <Button type="submit" className="gap-2 rounded-xl font-bold">
              <Send className="h-4 w-4" />
              فتح البريد وإرسال الطلب
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
