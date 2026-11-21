import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { SEO } from "@/components/marketing/SEO";
import { useI18n } from "@/contexts/I18nContext";

export default function Contact() {
  const { t, locale } = useI18n();
  const [form, setForm] = useState({ name: "", email: "", company: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Compose mailto fallback so the inquiry actually reaches us without a backend table.
      const body = encodeURIComponent(
        `Name: ${form.name}\nCompany: ${form.company}\nEmail: ${form.email}\n\n${form.message}`
      );
      const subject = encodeURIComponent(form.subject || "Tawzeef-X inquiry");
      window.location.href = `mailto:tawzeefx@outlook.com?subject=${subject}&body=${body}`;
      await new Promise((r) => setTimeout(r, 600));
      setSubmitted(true);
      toast.success(t("contact.form.success"));
      setForm({ name: "", email: "", company: "", subject: "", message: "" });
    } catch {
      toast.error(t("contact.form.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const info = [
    { icon: Mail, title: t("contact.info.email"), value: "tawzeefx@outlook.com", href: "mailto:tawzeefx@outlook.com" },
    { icon: Phone, title: t("contact.info.phone"), value: "+966 50 000 0000", href: "tel:+966500000000" },
    { icon: MapPin, title: t("contact.info.location"), value: t("contact.info.locationValue") },
    { icon: Clock, title: t("contact.info.hours"), value: t("contact.info.hoursValue") },
  ];

  return (
    <MarketingLayout>
      <SEO
        title={t("contact.seo.title")}
        description={t("contact.seo.description")}
        canonical="https://www.tawzeefx.com/contact"
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "linear-gradient(170deg, hsl(160 84% 28% / 0.04) 0%, hsl(0 0% 99%) 60%, hsl(168 70% 34% / 0.03) 100%)" }} />
        <div className="container max-w-4xl mx-auto px-6 py-24 md:py-28 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black leading-tight tracking-tight"
          >
            {t("contact.hero.title")} <span className="text-gradient">{t("contact.hero.highlight")}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed"
          >
            {t("contact.hero.subtitle")}
          </motion.p>
        </div>
      </section>

      <section className="container max-w-6xl mx-auto px-6 pb-24">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="lg:col-span-3 bg-card border border-border rounded-3xl p-8 space-y-5"
          >
            {submitted && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-success/10 text-success text-sm">
                <CheckCircle2 className="w-4 h-4" />
                {t("contact.form.success")}
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">{t("contact.form.name")}</label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1.5 block">{t("contact.form.email")}</label>
                <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">{t("contact.form.company")}</label>
              <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">{t("contact.form.subject")}</label>
              <Input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1.5 block">{t("contact.form.message")}</label>
              <Textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
            <Button type="submit" disabled={submitting} size="lg" className="w-full sm:w-auto h-12 rounded-xl gradient-primary border-0 text-primary-foreground gap-2 font-bold">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? t("contact.form.sending") : t("contact.form.send")}
            </Button>
          </motion.form>

          {/* Info */}
          <div className="lg:col-span-2 space-y-3">
            {info.map((item, i) => (
              <motion.a
                key={i}
                href={item.href || "#"}
                initial={{ opacity: 0, x: locale === "ar" ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-4 p-5 bg-card border border-border rounded-2xl hover:border-primary/25 hover:bg-primary/[0.02] transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-0.5">{item.title}</p>
                  <p className="text-foreground font-bold text-sm">{item.value}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
